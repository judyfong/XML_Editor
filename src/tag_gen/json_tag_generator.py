#!/usr/bin/python
# -*- coding: utf-8 -*-

# TODO: This file could use cleaning up and sfile on line 10 could be replaced by an argparse argument

import xmlschema
import json
import xml.etree.ElementTree as ET
 
sfile = "../../skema/althingi_raedur.xsd"

tree = ET.parse(sfile)
root = tree.getroot()

schema = xmlschema.XMLSchema(sfile)

def extract_tag(node):
    extract_string = node.tag
    stop_ind = extract_string.find('}')
    return extract_string[stop_ind+1:]

##### BUILDERS
    # we will build a structure that looks like:
    # tagname -> { 
    #       attrs   : { attr: [ values ] },
    #       children: [ values ]
    #   }
    #   so essentially, a pair of tagname, { attrs, children }
    #####

def build_type(node):
    assert type(node) is xmlschema.validators.complex_types.XsdComplexType, 'node should be a complex type (? -- is simple okay?)'
    if hasattr(node, 'root_elements'):
        print("found root node as complex type!")
        return (
            'top', { 
                'attrs': {}, 'children': node.root_elements
            }
        )
    tagname = node.prefixed_name
    attributes = list([x for x in node.attributes.keys()])

    children = [x.prefixed_name for x in node.iter_components() if type(x) is xmlschema.validators.elements.XsdElement]

    structure = { 
        "attrs":    attributes, 
        "children": children,
    }
    
    return (tagname, structure)

def build_tag(node):
    assert type(node) is xmlschema.validators.elements.XsdElement, 'node should be a complex type (? -- is simple okay?)'

    # check if this is the root element (type XMLSchema10)
    if hasattr(node, 'root_elements'):
        print("found root node as element!")
        return (
            'top', { 
                'attrs': {}, 'children': node.root_elements
            }
        )
    tagname = node.prefixed_name
    attributes = list([x for x in node.attributes.keys()])

    children = [x.prefixed_name for x in node.iter_components() if type(x) is xmlschema.validators.elements.XsdElement and x.prefixed_name != tagname]

    structure = { 
        "attrs":    attributes, 
        "children": children,
        "type":     node.type.local_name,
    }

    return (tagname, structure)

# TODO START

# iterate over all elements and build:
# - type map
#   * type will contain extra attributes for elements for those types
#   * type will contain extra  children  for elements for those types
# - element map
#   * elements will contain children and sometimes attributes
#   * elements should not contain themselves as their own children

type_priority = [ 'raedu_malsgreinType', 'almennur_textiType' ]

element_d = {}
complex_d = {}

for child in schema.iter_components():
    item_type = type(child)

    #print("processing {0} of type {1}".format(child, item_type))

    if item_type is xmlschema.validators.elements.XsdElement:
        success = build_tag(child)
        thedict = element_d
    elif item_type is xmlschema.validators.complex_types.XsdComplexType:
        success = build_type(child)
        thedict = complex_d
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

# this is the part where we merge the content of the two dictionaries,
# i.e. we will add children & attributes to elements based on their type
# using a lookup in complex_d

new_d = {}

for key, value in element_d.items():
    etype = value.get('type', )
    cval = complex_d.get(etype, {})

#   print("{0}:\n\t{1}\n\t{2}".format(key, value, cval))

    # our new dictionary must contain the attrs and children from both...
    new_value = { 
            'attrs':    list(set(value['attrs'] + cval.get('attrs', []))),
            'children': list(set(value['children'] + cval.get('children', []))),
            }
    new_d[key] = new_value

sss = json.dumps(new_d, indent=4)
print(sss)
