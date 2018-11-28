#!/usr/bin/python
# -*- coding: utf-8 -*-
# pylint: disable=C0326
# NOTE: This also exists: http://q42jaap.github.io/xsd2codemirror/

import argparse
import json
#import xml.etree.ElementTree as ET
import xmlschema

def extract_tag(node):
    """
    This method is currently unused,
    and will probably be removed soon.
    """
    extract_string = node.tag
    stop_ind = extract_string.find('}')
    return extract_string[stop_ind+1:]

##### BUILDERS

def build_type(node):
    """
    This method constructs a tag type based on the following idea:
    # we will build a structure that looks like:
    # tagname -> {
    #       attrs   : { attr: [ values ] },
    #       children: [ values ]
    #   }
    #   so essentially, a pair of tagname, { attrs, children }
    """
    assert isinstance(node, xmlschema.validators.complex_types.XsdComplexType), \
        'node should be a complex type (? -- is simple okay?)'
    if hasattr(node, 'root_elements'):
        print("found root node as complex type!")
        return (
            'top', {
                'attrs': {}, 'children': node.root_elements
            }
        )
    tagname = node.prefixed_name
    attributes = list([x for x in node.attributes.keys() if x is not None])

    children = [x.prefixed_name for x in node.iter_components() \
            if isinstance(x, xmlschema.validators.elements.XsdElement)]

    structure = {
        "attrs":    attributes,
        "children": children,
    }
    
    return (tagname, structure)

def build_tag(node):
    """
    This method constructs the tag itself based on the following idea:
    # we will build a structure that looks like:
    # tagname -> {
    #       attrs   : { attr: [ values ] },
    #       children: [ values ]
    #   }
    #   so essentially, a pair of tagname, { attrs, children }
    """
    assert isinstance(node, xmlschema.validators.elements.XsdElement), \
            'node should be a complex type (? -- is simple okay?)'

    # check if this is the root element (type XMLSchema10)
    if hasattr(node, 'root_elements'):
        print("found root node as element!")
        return (
            'top', {
                'attrs': {}, 'children': node.root_elements
            }
        )
    tagname = node.prefixed_name
    attributes = list([x for x in node.attributes.keys() if x is not None])

    children = [x.prefixed_name for x in node.iter_components() if isinstance(x, \
            xmlschema.validators.elements.XsdElement) and x.prefixed_name != tagname]

    structure = {
        "attrs":    attributes,
        "children": children,
        "type":     node.type.local_name,
    }

    return (tagname, structure)

def parse_elements(schema):
    type_priority = ['raedu_malsgreinType', 'almennur_textiType']

    simple_elements = {}
    complex_elements = {}

    for child in schema.iter_components():
        item_type = type(child)

        #print("processing {0} of type {1}".format(child, item_type))

        if item_type is xmlschema.validators.elements.XsdElement:
            success = build_tag(child)
            thedict = simple_elements
        elif item_type is xmlschema.validators.complex_types.XsdComplexType:
            success = build_type(child)
            thedict = complex_elements
        else:
            success = False

        if success:
            key, value = success
            if key is None:
            #   print("got key none...")
                continue
            if key in thedict:
                old = thedict[key]
                # only replace if higher priority
                if old['type'] == type_priority[0]:
                    if value['type'] == old['type'] and value != old:
                        raise Exception("same types with different values!")
                    continue
                if old != value:
                    print("warning! replacing key {0}".format(key))
                    print("old: {0}\nnew: {1}".format(old, value))
                    print("old type:", old['type'], "\nnew type:", value['type'])
            thedict[key] = value

    return simple_elements, complex_elements 

def merge_elements(simple_elements, complex_elements):
    # this is the part where we merge the content of the two dictionaries,
    # i.e. we will add children & attributes to elements based on their type
    # using a lookup in complex_elements
    merged_tree = {}

    for key, value in simple_elements.items():
        element_type = value.get('type', )
        cval = complex_elements.get(element_type, {})

    #   print("{0}:\n\t{1}\n\t{2}".format(key, value, cval))

        # our new dictionary must contain the attrs and children from both...
        node = {
            'attrs':    list(set(value['attrs'] + cval.get('attrs', []))),
            'children': list(set(value['children'] + cval.get('children', []))),
        }
        merged_tree[key] = node

    return merged_tree

def merge_trees(main_tree, extra_tree):
    # each arg is a "merged_tree" dictionary from merge_elements
    # merge strategy: append children to identical key nodes
    returned_tree = main_tree.copy()
    
    for key in main_tree:
        # Update on identical key
        if key in extra_tree:
            main_value   = main_tree[key]
            extra_value  = extra_tree[key]
            merged_value = main_value
            for sub_key in set(main_value.keys() | extra_value.keys()):
                merged_value[sub_key] = list(set(main_value.get(sub_key, []) + extra_value.get(sub_key, [])))

            returned_tree[key] = merged_value

    # now make sure all keys in extra are in main
    for key in extra_tree:
        if key not in returned_tree:
            returned_tree[key] = extra_tree[key]

    return returned_tree

def main(args):
    """
    # iterate over all elements and build:
    # - type map
    #   * type will contain extra attributes for elements for those types
    #   * type will contain extra  children  for elements for those types
    # - element map
    #   * elements will contain children and sometimes attributes
    #   * elements should not contain themselves as their own children
    """
    
    # sfile = "../../skema/althingi_raedur.xsd" # Now replaced by args.schema

#   tree = ET.parse(args.schema)
#   root = tree.getroot()

    full_tree = {}
    for schema_file in args.schema:
        schema = xmlschema.XMLSchema(schema_file)

        simple_elements, complex_elements = parse_elements(schema)

        merged_tree = merge_elements(simple_elements, complex_elements)
        if not full_tree:
            full_tree = merged_tree
        else:
            full_tree = merge_trees(full_tree, merged_tree)


    sss = json.dumps(full_tree, indent=4)

    with open(args.outfile, 'w') as outfile:
        outfile.write(sss)

if __name__ == '__main__':
    _parser = argparse.ArgumentParser()
    _parser.add_argument('schema', nargs='*', default=None, help='The schema file to parse into usable tags')
    _parser.add_argument('-o', '--outfile', default='tags_ref_for_testing.json', help='Write output to this file')
    _args = _parser.parse_args()
    if not _args.schema:
        _args.schema = ['skema/althingi_raedur.xsd']
    main(_args)
