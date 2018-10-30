// In this file, we put things that:
// (1) use the global 'editor' variable liberally, and
// (2) modify the DOM

function populate_insert_element_container(data) {
  // inserts a tag element of type tag_label at the cursor location and moves the cursor inside the tag
  function insert_tag_element(tag_label) {
    // Possible TODO: create self-closing elements properly (e.g. <bjalla/> instead of <bjalla></bjalla>)
    var to;
    var selection = ''
    if (editor.somethingSelected()) {
      to = editor.getCursor('to');
      selection = editor.getSelection();
    }
    var cursor_loc = editor.getCursor('from');
    var movement = tag_label.length + 2;
    var element = '<' + tag_label + '>' + selection + '</' + tag_label + '>';
    insert_element_at_cursor(element, movement);
    return;
  }

  function create_element(tag_label) {
    var list_element = document.createElement("li");
    var link_element = document.createElement("a");
    var text = document.createTextNode(tag_label);
    list_element.appendChild(link_element);
    link_element.appendChild(text);

    link_element.setAttribute('href', '#');
    link_element.addEventListener('click', function() { insert_tag_element(tag_label); });

    document.getElementById("insert-element-links").appendChild(list_element);
  }

  // function body start

  // clear the list
  var link_node = document.getElementById('insert-element-links');
  remove_all_children(link_node);

  // populate the list
  for (var i=0; i<data.list.length; i++) {
    var tag_hint_label = data.list[i];
    if (tag_hint_label[0] != '<') {
      // this isn't a tag, so what is it?
      // Nothing that belongs here, at least.
      continue;
    } else if (tag_hint_label[1] == '/') {
      // this is a closing tag, doesn't fit in an
      // 'Insert Element' window
      continue;
    }
    create_element(tag_hint_label.substring(1));
  }
}

function populate_tree_explorer() {
  // TODO: Make this all a lot prettier by adding indentation (and maybe using something other than li and a)
  function get_text_at_tag_location(tag) {
    var pos = { line: tag.line, ch: tag.start_index };
    var word = editor.findWordAt(pos);
    var line = editor.getLine(word.anchor.line);

    var word_left  = line.substring(0, word.anchor.ch);
    var word_right = line.substring(word.head.ch);

    var start = tag.end_index;
    var end = start + 24;
    if (line.length < end) {
      end = line.length;
    }

    var phrase = line.substring(start, end);

    if (phrase) {
      phrase += '...';
    }

    return phrase;
  }

  function add_tag_to_tree(tag) {
    var list_element = document.createElement("li");
    var text_content = tag.line + ' <' + tag.tag_label + '> ' + get_text_at_tag_location(tag);
    var text_node = document.createTextNode(text_content);
    list_element.appendChild(text_node);

    list_element.setAttribute('class', 'button');
    list_element.addEventListener('click', function() { 
      var pos = { line: tag.line, ch: tag.end_index };
      editor.setCursor(pos);
      editor.focus();
    });

    document.getElementById("tree-explorer-links").appendChild(list_element);
  }

  var link_node = document.getElementById('tree-explorer-links');
  remove_all_children(link_node);

  // populate the tree explorer with every tag
  var tag_pairs = parse_tags();  
  for (var i = 0; i < tag_pairs.length; ++i) {
    var detected_tag = tag_pairs[i].tag_open;
    add_tag_to_tree(detected_tag);
  }
}

function parse_tag_attribute_values(tag) {
  function extract_value(attribute_value) {
    if (!attribute_value) {
      return "";
    }
    var si = attribute_value.indexOf("\"") + 1;
    var ei = attribute_value.lastIndexOf("\"");

    return attribute_value.substring(si, ei);
  }
  var tag_line = editor.getLine(tag.line);
  var tag_string = tag_line.substring(tag.start_index, tag.end_index);
  var tag_parts = tag_string.split(" ");
  if (tag_parts.length == 1) {
    return {};
  }

  var attributes = {};
  var current_index = tag_string.indexOf(' ') + 1;

  for (var i = 1; i < tag_parts.length; ++i) {
    // split tag into key=value
    var pair = tag_parts[i].split('=');
    var attribute_descriptor = {
      attribute_index: i,
      value: extract_value(pair[1]),
      start_index: current_index + pair[0].length + 1,
    }
    attributes[pair[0]] = attribute_descriptor;
    current_index += tag_parts[i].length + 1;
  }

  return attributes;
}

function add_tag_attribute(attribute_tag, key, value) {
  var added_tag_string = ' ' + key + '="' + value + '"';

  // calculate the position where the tag closes
  var tag = attribute_tag.tag_open;
  var close_index = tag.end_index - 1;
  var from = {line: tag.line, ch: close_index};
  // insert the tag string at that position
  editor.replaceRange(added_tag_string, from)
}

function modify_tag_attribute(attribute_tag, key, value) {
  // calculate the start and end of the attribute's value
  var line = attribute_tag.lineo;
  var start_index = attribute_tag.attrs[key].start_index + attribute_tag.index + 1;
  var end_index = attribute_tag.attrs[key].value.length + start_index;
  var from = {line: line, ch: start_index};
  var to = {line: line, ch: end_index};
  // edge case -- value is empty
  if (!value) {
    // delete the attribute instead of resetting the value
    from.ch = from.ch - key.length - 3 // traverse to the start of the attribute key
    to.ch += 1; // exit from "quote"
  }
  // NOTE: If something "suddenly broke", the tag being edited has probably
  // been set to read-only mode via editor marking, in this case:
  // remove any read-only marks that might interfere with editing
  // (also in add_tag_attribute)

  // replace the value
  editor.replaceRange(value, from, to);
}

function populate_attribute_inspector() {
  function tags_on_line(doc_tags, line) {
    function create_found_tag(tag_pair) {
      // NOTE: false works here, because start_index won't be zero
      // UNLESS it's on another line,
      // and then we *are* inside the tag anyway... </hack>
      var close = false;
      var linec = tag_pair.tag_open.line;
      if (tag_pair.tag_close) {
        close = tag_pair.tag_close.start_index;
        linec = tag_pair.tag_close.line;
      }
      var tag_attrs = parse_tag_attribute_values(tag_pair.tag_open);
      var obj = {
        label: tag_pair.tag_open.tag_label,
        index: tag_pair.tag_open.start_index,
        close: close,
        lineo:  tag_pair.tag_open.line,
        linec:  linec,
        attrs: tag_attrs,
        tag_open: tag_pair.tag_open,
      }
      return obj
    }

    var found_tags = [];
    for (var i = 0; i < doc_tags.length; ++i) {
      var this_tag = doc_tags[i].tag_open;
      if (this_tag.line == line) {
        found_tags.push(create_found_tag(doc_tags[i]))
      }
    }

    return found_tags;
  }

  function get_nearest_tag() {
    var doc_tags = parse_tags();
    // find the closest tag, looking left first, then right 
    var pos = editor.getCursor();
    var current_line_number = pos.line;

    // find the first tag on this line
    var nearby_tags;

    do {
      nearby_tags = tags_on_line(doc_tags, current_line_number);

      // OK, at this point we have a list of nearby tags, pick the first one that doesn't close before pos
      while (nearby_tags.length > 0) {
        var this_tag = nearby_tags.pop();
        var label = this_tag.label;
        // check if this tag closes before pos
        var close = this_tag.close;
        // make sure it closes on this line or earlier, not later
        if (close) {
          // this tag closes somewhere nearby, find where
          if (this_tag.linec <= pos.line && close < pos.ch) {
            // closes before cursor, not this tag
            continue;
          }
          if (this_tag.linec < pos.line) {
            // closes on a previous line, not this tag
            continue;
          }
        }

        // make sure it has been opened
        if (this_tag.lineo > pos.line) {
          // opens on a later line
          continue; 
        }
        else if (this_tag.lineo == pos.line && this_tag.index > pos.ch) {
          // opens on this line, but after cursor
          continue;
        }

        // It is open and didn't close, we are in this tag!
        return this_tag;
      }
    } while (nearby_tags.length == 0 && --current_line_number >= 0);

    if (nearby_tags.length == 0) {
      // TODO: Look right
      console.log('nothing found');
    }

    return false;
  }

  function get_tag_attributes(label) {
    // find the tag's entry in schema_tags
    // and return the attributes it has
    var schema_tag = schema_tags[label];

    if (!schema_tag) {
      // stay consistent with return value if schema_tag object doesn't have an 'attrs' key
      return undefined;
    }

    return schema_tag.attrs;
  }

  function create_tag_attribute_element(attribute, current_value, callback) {
    var row_element = document.createElement("tr");
    var col_element = document.createElement("td");
    var text = document.createTextNode(attribute);
    row_element.appendChild(col_element);
    col_element.appendChild(text);

    var mutate_col_element = document.createElement("td");
    var mutate_col_textbox = document.createElement("input");
    mutate_col_textbox.setAttribute("type", "text");
    mutate_col_textbox.setAttribute("value", current_value);
    mutate_col_element.appendChild(mutate_col_textbox);
    row_element.appendChild(mutate_col_element);

    // TODO HERE: listen for changes in the textbox, and reflect in CodeMirror
    mutate_col_textbox.addEventListener('change', function() { callback(attribute, this.value)} );

    document.getElementById("attribute-inspector-table").appendChild(row_element);
  }

  var nearest_tag = get_nearest_tag();
  if (!nearest_tag) {
    return;
  }

  // now find the nearest tag's entry in schema_tags
  // and figure out what attributes it can have
  var tag_attributes = get_tag_attributes(nearest_tag.label);
  if (!tag_attributes) {
    // we're probably in a meta tag or something,
    // anyway, we don't know how to deal with this type of tag
    return;
  }

  // clear the list
  var div_node = document.getElementById('attribute-inspector-div');
  remove_all_children(div_node);

  // add the title
  var title_element = document.createElement("h4");
  var text = document.createTextNode(nearest_tag.label);
  title_element.appendChild(text);
  div_node.appendChild(title_element);

  if (tag_attributes.length == 0) {
    var node = document.createElement("p");
    var text = document.createTextNode(" hefur engin eigindi.");
    var span = document.createElement("span");
    span.setAttribute("style", "font-family: monospace;");
    var label = document.createTextNode(nearest_tag.label);
    span.appendChild(label);
    node.appendChild(span);
    node.appendChild(text);
    div_node.appendChild(node);
    return;
  }

  // create the table
  var table_element = document.createElement("table");
  table_element.setAttribute('id', 'attribute-inspector-table');
  div_node.appendChild(table_element);

  // populate the table
  for (var i = 0; i < tag_attributes.length; ++i) {
    // get the attribute label
    var attribute = tag_attributes[i];

    // get the current value of this attribute on the tag
    // TODO: nearest_tag.attributes 'map'
    var attrs = nearest_tag.attrs[attribute];
    var callback;
    var value = '';

    if (!attrs) {
      callback = function(attribute, value) {
        add_tag_attribute(nearest_tag, attribute, value);
        // Since we are adding an attribute, we need to change
        // the callback for this field if we commit,
        // easiest way to do that is to just compute the inspector again
        populate_attribute_inspector();
      }
    } else {
      var got_value = nearest_tag.attrs[attribute].value;
      if (got_value) {
        value = got_value;
      }

      var callback = function(attribute, value) {
        modify_tag_attribute(nearest_tag, attribute, value);
        // Since we are modifying an attribute, we need to change
        // the callback for this field if we commit an empty value,
        // easiest way to do that is to just compute the inspector again
        populate_attribute_inspector();
      }
    }

    create_tag_attribute_element(attribute, value, callback);
  }
}

function insert_comment_prompt() {
  var comment_content;
  if (editor.somethingSelected()) {
    comment_content = editor.getSelection();
  } else {
    comment_content = prompt("Setjið inn athugasemd.");
    if (comment_content == null || comment_content == "") {
      // prompt canceled
      return;
    }
  }

  // comments may not have double hyphens, so replace any instances of double hyphens with a hyphen, space, hyphen
  var comment_element = '<!-- ' + comment_content.replace(new RegExp('--', 'g'), '- -') + ' -->';

  insert_element_at_cursor(comment_element);
}

function createSpellCheckMenuItem(editor, link_text, callback) {
  // create a spell checking option in the menus
  // find the parent menu
  var parent_menu = document.getElementById('function_menu');
  // delete any existing node
  var existing = document.getElementById('spell-check-menu-item');
  if (existing) {
    existing.remove();
  }

  // node was already created, input param link_node
  var link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode(link_text));
  link_node.setAttribute('href', '#');
  link_node.setAttribute('id', 'spell-check-menu-item');
  link_node.addEventListener('click', callback);
  // add it to the menu
  var before_target = document.getElementById('toggle_autovalidate');
  parent_menu.insertBefore(link_node, before_target);
}

function createSpellChecker(editor) {
  // create a spell checking option in the menus
  var link_text = 'Virkja stafsetningarleit';

  var callback = function() {
    const aff = 'resources/spell/index.aff';
    const dic = 'resources/spell/index.dic';
    let typoLoaded=loadTypo(aff, dic);
    typoLoaded.then(typo => {
      startSpellCheck(editor, typo);
      createSpellCheckDisabler(editor);
    });
  }
  createSpellCheckMenuItem(editor, 'Virkja stafsetningarleit', callback);
}

function createSpellCheckDisabler(editor) {
  // create a spell check disabling option in the menus
  var link_text = 'Slökkva á stafsetningarleit';
  var callback = function() {
    editor.removeOverlay("spell-check-overlay");
    createSpellChecker(editor);
  };

  createSpellCheckMenuItem(editor, link_text, callback);
}
