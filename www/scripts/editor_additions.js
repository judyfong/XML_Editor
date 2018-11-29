// In this file, we put things that:
// (1) use the global 'editor' variable liberally, and
// (2) modify the DOM

// inserts a tag element of type tag_label at the cursor location and moves the cursor inside the tag
function insert_tag_element(tag_label, newline=false) {
  // Possible TODO: create self-closing elements properly (e.g. <bjalla/> instead of <bjalla></bjalla>)
  let to;
  let selection = ''
  if (editor.somethingSelected()) {
    to = editor.getCursor('to');
    selection = editor.getSelection();
  }
  let cursor_loc = editor.getCursor('from');
  let movement = tag_label.length + 2;
  let element = '<' + tag_label + '>' + selection + '</' + tag_label + '>';
  insert_element_at_cursor(element, movement, newline);
  return;
}

function populate_insert_element_container(data) {
  function create_element(tag_label) {
    let list_element = document.createElement("li");
    let link_element = document.createElement("a");
    let text = document.createTextNode(tag_label);
    list_element.appendChild(link_element);
    link_element.appendChild(text);

    link_element.setAttribute('href', '#');
    link_element.addEventListener('click', function() { 
      insert_tag_element(tag_label);
      _last_view = 'changed';
      applyViewMode();
    });

    document.getElementById("insert-element-links").appendChild(list_element);
  }

  // function body start

  // clear the list
  let link_node = document.getElementById('insert-element-links');
  remove_all_children(link_node);

  let list_empty = true;
  // populate the list
  for (let i=0; i<data.list.length; i++) {
    let tag_hint_label = data.list[i];
    if (tag_hint_label[0] != '<') {
      // this isn't a tag, so what is it?
      // Nothing that belongs here, at least.
      continue;
    } else if (tag_hint_label[1] == '/') {
      // this is a closing tag, doesn't fit in an
      // 'Insert Element' window
      continue;
    }
    let label = tag_hint_label.substring(1)
    if (validate_insertion_at_cursor(label)) {
      create_element(label);
      list_empty = false;
    } // else: we thought we could create an element here, but it doesn't validate.
  }
  if (list_empty) {
    let list_element = document.createElement("li");
    let text = document.createTextNode("Engin leyfileg tög á tilteknum stað.");
    list_element.appendChild(text);
    document.getElementById("insert-element-links").appendChild(list_element);
  }
}

function populate_tree_explorer() {
  function get_text_at_tag_location(tag) {
    let pos = { line: tag.line, ch: tag.start_index };
    let word = editor.findWordAt(pos);
    let line = editor.getLine(word.anchor.line);

    let word_left  = line.substring(0, word.anchor.ch);
    let word_right = line.substring(word.head.ch);

    let start = tag.end_index;
    let end = start + 24;
    if (line.length < end) {
      end = line.length;
    }

    let phrase = line.substring(start, end);

    if (phrase) {
      phrase += '...';
    } else {
      phrase = editor.getLine(tag.line + 1).substring(0, 24) + "..."
    }

    return phrase;
  }

  function add_tag_to_tree(tag) {
    let list_element = document.createElement("li");
    let link_element = document.createElement("a");
    let text_content = 1 + tag.line + ' <' + tag.tag_label + '> ' + get_text_at_tag_location(tag);
    let text_node = document.createTextNode(text_content);
    link_element.appendChild(text_node);

    link_element.setAttribute('href', '#');
    link_element.addEventListener('click', function() { 
      let pos = { line: tag.line, ch: tag.end_index };
      editor.focus();
      editor.setCursor(pos);
      setTimeout(function() {editor.scrollIntoView(pos)}, 50);
    });
    list_element.appendChild(link_element);

    document.getElementById("tree-explorer-links").appendChild(list_element);
  }

  let link_node = document.getElementById('tree-explorer-links');
  remove_all_children(link_node);

  // populate the tree explorer with every <mgr> tag
  let tag_pairs = parse_tags();  
  for (let i = 0; i < tag_pairs.length; ++i) {
    let detected_tag = tag_pairs[i].tag_open;
    if (detected_tag.tag_label == 'mgr') {
      add_tag_to_tree(detected_tag);
    }
  }
}

function parse_tag_attribute_values(tag) {
  function extract_value(attribute_value) {
    if (!attribute_value) {
      return "";
    }
    let si = attribute_value.indexOf("\"") + 1;
    let ei = attribute_value.lastIndexOf("\"");

    return attribute_value.substring(si, ei);
  }
  let tag_line = editor.getLine(tag.line);
  let tag_string = tag_line.substring(tag.start_index, tag.end_index);
  let tag_parts = tag_string.split(" ");
  if (tag_parts.length == 1) {
    return {};
  }

  let attributes = {};
  let current_index = tag_string.indexOf(' ') + 1;

  for (let i = 1; i < tag_parts.length; ++i) {
    // split tag into key=value
    let pair = tag_parts[i].split('=');
    let attribute_descriptor = {
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
  let added_tag_string = ' ' + key + '="' + value + '"';

  // calculate the position where the tag closes
  let tag = attribute_tag.tag_open;
  let close_index = tag.end_index - 1;
  let from = {line: tag.line, ch: close_index};
  // insert the tag string at that position
  editor.replaceRange(added_tag_string, from)
}

function modify_tag_attribute(attribute_tag, key, value) {
  // calculate the start and end of the attribute's value
  let line = attribute_tag.lineo;
  let start_index = attribute_tag.attrs[key].start_index + attribute_tag.index + 1;
  let end_index = attribute_tag.attrs[key].value.length + start_index;
  let from = {line: line, ch: start_index};
  let to = {line: line, ch: end_index};
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
      let close = false;
      let linec = tag_pair.tag_open.line;
      if (tag_pair.tag_close) {
        close = tag_pair.tag_close.start_index;
        linec = tag_pair.tag_close.line;
      }
      let tag_attrs = parse_tag_attribute_values(tag_pair.tag_open);
      let obj = {
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

    let found_tags = [];
    for (let i = 0; i < doc_tags.length; ++i) {
      let this_tag = doc_tags[i].tag_open;
      if (this_tag.line == line) {
        found_tags.push(create_found_tag(doc_tags[i]))
      }
    }

    return found_tags;
  }

  function get_nearest_tag() {
    let doc_tags = parse_tags();
    // find the closest tag, looking left first, then right 
    let pos = editor.getCursor();
    let current_line_number = pos.line;

    // find the first tag on this line
    let nearby_tags;

    do {
      nearby_tags = tags_on_line(doc_tags, current_line_number);

      // OK, at this point we have a list of nearby tags, pick the first one that doesn't close before pos
      while (nearby_tags.length > 0) {
        let this_tag = nearby_tags.pop();
        let label = this_tag.label;
        // check if this tag closes before pos
        let close = this_tag.close;
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
    let schema_tag = schema_tags[label];

    if (!schema_tag) {
      // stay consistent with return value if schema_tag object doesn't have an 'attrs' key
      return undefined;
    }

    return schema_tag.attrs;
  }

  function create_tag_attribute_element(attribute, current_value, callback) {
    let row_element = document.createElement("tr");
    let col_element = document.createElement("td");
    let text = document.createTextNode(attribute);
    row_element.appendChild(col_element);
    col_element.appendChild(text);

    let mutate_col_element = document.createElement("td");
    let mutate_col_textbox = document.createElement("input");
    mutate_col_textbox.setAttribute("type", "text");
    mutate_col_textbox.setAttribute("value", current_value);
    mutate_col_element.appendChild(mutate_col_textbox);
    row_element.appendChild(mutate_col_element);

    // TODO HERE: listen for changes in the textbox, and reflect in CodeMirror
    mutate_col_textbox.addEventListener('change', function() { 
      callback(attribute, this.value); 
      _last_view = 'changed';
      applyViewMode;
    });

    document.getElementById("attribute-inspector-table").appendChild(row_element);
  }

  let nearest_tag = get_nearest_tag();
  if (!nearest_tag) {
    return;
  }

  // now find the nearest tag's entry in schema_tags
  // and figure out what attributes it can have
  let tag_attributes = get_tag_attributes(nearest_tag.label);
  if (!tag_attributes) {
    // we're probably in a meta tag or something,
    // anyway, we don't know how to deal with this type of tag
    return;
  }

  // clear the list
  let div_node = document.getElementById('attribute-inspector-div');
  remove_all_children(div_node);

  // add the title
  let title_element = document.createElement("h4");
  let text = document.createTextNode(nearest_tag.label);
  title_element.appendChild(text);
  div_node.appendChild(title_element);

  if (tag_attributes.length == 0) {
    let node = document.createElement("p");
    let text = document.createTextNode(" hefur engin eigindi.");
    let span = document.createElement("span");
    span.setAttribute("style", "font-family: monospace;");
    let label = document.createTextNode(nearest_tag.label);
    span.appendChild(label);
    node.appendChild(span);
    node.appendChild(text);
    div_node.appendChild(node);
    return;
  }

  // create the table
  let table_element = document.createElement("table");
  table_element.setAttribute('id', 'attribute-inspector-table');
  div_node.appendChild(table_element);

  // populate the table
  for (let i = 0; i < tag_attributes.length; ++i) {
    // get the attribute label
    let attribute = tag_attributes[i];

    // get the current value of this attribute on the tag
    let attrs = nearest_tag.attrs[attribute];
    let callback;
    let value = '';

    if (!attrs) {
      callback = function(attribute, value) {
        add_tag_attribute(nearest_tag, attribute, value);
        // Since we are adding an attribute, we need to change
        // the callback for this field if we commit,
        // easiest way to do that is to just compute the inspector again
        populate_attribute_inspector();
      }
    } else {
      let got_value = nearest_tag.attrs[attribute].value;
      if (got_value) {
        value = got_value;
      }

      let callback = function(attribute, value) {
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
  let comment_content;
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
  let comment_element = '<!-- ' + comment_content.replace(new RegExp('--', 'g'), '- -') + ' -->';

  insert_element_at_cursor(comment_element);
}

function createSpellCheckMenuItem(editor, link_text, callback) {
  // create a spell checking option in the menus
  // delete any existing node
  let existing = document.getElementById('spell-check-menu-item');
  if (existing) {
    existing.remove();
  }

  // construct the anchor node
  let link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode(link_text));
  link_node.setAttribute('href', '#');
  link_node.setAttribute('id', 'spell-check-menu-item');
  link_node.addEventListener('click', callback);

  // insert the anchor node into the navigation bar
  insert_navbar_anchor_at(link_node, 'function_menu', 'toggle_autovalidate');
}

function createSpellChecker(editor) {
  // create a spell checking option in the menus
  let link_text = 'Virkja stafsetningarpúka';

  let callback = function() {
    /*
    const aff = 'resources/spell/index.aff';
    const dic = 'resources/spell/index.dic';
    */
    // TODO remove below and uncomment above, because of awardspace demo restrictions
    const aff = 'https://raw.githubusercontent.com/wooorm/dictionaries/master/dictionaries/is/index.aff';
    const dic = 'https://raw.githubusercontent.com/wooorm/dictionaries/master/dictionaries/is/index.dic';
    let typoLoaded=loadTypo(aff, dic);
    typoLoaded.then(typo => {
      startSpellCheck(editor, typo);
      createSpellCheckDisabler(editor);
    });
  }
  createSpellCheckMenuItem(editor, link_text, callback);
}

function createSpellCheckDisabler(editor) {
  // create a spell check disabling option in the menus
  let link_text = 'Slökkva á stafsetningarpúka';
  let callback = function() {
    editor.removeOverlay("spell-check-overlay");
    createSpellChecker(editor);
  };

  createSpellCheckMenuItem(editor, link_text, callback);
}

function get_member_initials_from_content(content) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(content, "text/xml");
  let elems = xmlDoc.getElementsByTagName("ræða");
  if (elems.length == 0) { return false; }
  let initials = elems[0].getAttribute("skst");
  if (!initials) { return false; }
  return initials;
}

function get_congress_number(content) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(content, "text/xml");
  let elems = xmlDoc.getElementsByTagName("umsýsla");
  if (elems.length == 0) { return false; }
  let congress = elems[0].getAttribute("lgþ");
  if (!congress) { return false; }
  return congress;
}

function get_address_type_initials_from_content(content) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString(content, "text/xml");
  let elems = xmlDoc.getElementsByTagName("ræða");
  if (elems.length == 0) { return false; }
  let initials = elems[0].getAttribute("tegr");
  if (!initials) { return false; }
  return initials;
}

function display_address_type_by_initials(congress, initials) {
  // TODO HERE: Use variable congress (lgþ) to fetch the right file
  let xml_path = 'resources/xml/tegra.php4.xml';

  let xhr = new XMLHttpRequest();
  xhr.open('GET', xml_path, true);
  xhr.send();
  xhr.timeout = 2000;

  xhr.onload = function() {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(this.responseText, "text/xml");
    let elements = xmlDoc.getElementsByTagName("tegundræðu");
    let address_type = 'Óþekkt ræðutegund';
    if (initials) {
      for (let i = 0; i < elements.length; ++i) {
        if (elements[i].getAttribute("tegund") == initials) {
          address_type = elements[i].innerHTML;
          break;
        }
      }
      initials = '(' + initials + ')';
    } else {
      initials = '';
    }
    document.getElementById("address-type-placeholder").innerHTML = address_type + " " + initials;
  };
  xhr.ontimeout = function (e) {
    alert("Could not load XML file:", e);
  };
}

function display_member_name_from_initials(congress, initials) {
  // TODO HERE: Use variable congress (lgþ) to fetch the right file
  let xml_path = 'resources/xml/thingmenn.php4.xml';

  let xhr = new XMLHttpRequest();
  xhr.open('GET', xml_path, true);
  xhr.send();
  xhr.timeout = 2000;

  xhr.onload = function() {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(this.responseText, "text/xml");
    let elements = xmlDoc.getElementsByTagName("þm");
    let member_name = 'Óþekktur þingmaður';
    if (initials) {
      for (let i = 0; i < elements.length; ++i) {
        if (elements[i].getAttribute("skst") == initials) {
          member_name = elements[i].innerHTML;
          break;
        }
      }
      initials = '(' + initials + ')';
    } else {
      initials = '';
    }
    document.getElementById("member-name-placeholder").innerHTML = member_name + " " + initials;
  };
  xhr.ontimeout = function (e) {
    alert("Could not load XML file:", e);
  };
}

// If something is highlighted and the user presses '"', enclose in „quotes“
function fix_insert_quotes(instance, changeObj) {
  // Check if a double quote was inserted
  let quote_inserted = false;
  // Something inserted
  if (!changeObj.text) {
    return;
  }
  // Something has to actually be selected
  // Also: Were there multiple selections?
  if (!editor.somethingSelected()) {
    return;
  } else if (editor.getSelections().length > 1) {
    return;
  }
  // Search for a double quote
  for (let i = 0; i < changeObj.text.length ; ++i) {
    if (changeObj.text[i] == '"') {
      quote_inserted = true;
      break;
    }
  }
  // No action unless quote inserted
  if (!quote_inserted) {
    return;
  }
  let replacement =  '„' + editor.getSelection() + '“';
  // cancel the change
  changeObj.cancel();
  // conduct the replacement (NOTE: probably fires 'change' and 'beforeChange' events)
  // NOTE: See comment on https://codemirror.net/doc/manual.html#events under 'beforeChange'
  //       It is possible that this implementation causes some bugs, look here first!
  editor.replaceRange(replacement, changeObj.from);
}


function handleEnterPressed(instance) {
  // Let's insert some <mgr> </mgr> tags
  // If inside a <vísa>, insert a <lína> </lína> pair instead
  // Step 1: figure out our context
  let pos = instance.getCursor();
  let tokens = instance.getLineTokens(pos.line);
  let next_candidate = false;
  let label = undefined;
  let token = undefined;
  let fix_line = 0;
  console.log(tokens);
  for (let i = 0; i < tokens.length; ++i) {
    let tok = tokens[i].string;
    if (next_candidate) {
      switch(tok) {
        case 'mgr':
        case 'lína':
        case 'erindi':
          label = tok;
          break;
        case 'vísa':
          label = 'erindi';
          fix_line = 1;
          break;
      }
    }
    if (label && !token) {
      token = tokens[i];
      break;
    }
    if (tok == '</') {
      next_candidate = true;
      continue;
    }
  }

  if (!label || !token) {
      // We didn't find any closers, so find what's open instead
      for (let i = tokens.length - 1; i >= 0; --i) {
        let tok = tokens[i].string;
        if (next_candidate) {
          switch(tok) {
            case 'vísa':
              label = 'erindi';
              break;
            case 'erindi':
              label = 'lína';
              break;
            case 'ræðutexti':
              label = 'mgr';
              break;
          }
        }
        if (label && !token) {
          token = tokens[i];
          break;
        }
        if (tok == '>') {
          next_candidate = true;
          continue;
        }
      }
  }
  
  if (!label || !token) {
    console.log("Enter pressed in unknown context");
    return CodeMirror.Pass;
  }
  // Step 2: Move out of the <mgr> or <lína> if we are in one

  let new_pos = { line: pos.line + 1 - fix_line, ch: 0 }
  instance.setCursor(new_pos);
 
  // Step 3: insert a new <mgr> or <lína>
  insert_tag_element(label, newline=true);

  if (label == 'erindi') {
    insert_tag_element('lína', newline=true);
  }

  // Step 4: Render the view again to mark the new tags if they should be marked
  instance.indentLine(pos.line + 1);
  _last_view = 'raw';
  applyViewMode();
}
