// In this file, we put things that:
// (1) use the global 'editor' variable liberally, and
// (2) modify the DOM

function remove_all_children(node) {
  var child = node.firstChild;
  while (child) {
    node.removeChild(child);
    child = node.firstChild;
  }
}

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
    editor.replaceRange('<' + tag_label + '>' + selection + '</' + tag_label + '>', cursor_loc, to);
    
    // move the cursor inside the tag
    cursor_loc.ch += movement;
    if (selection) {
      to.ch += movement;
      editor.setSelection(cursor_loc, to);
    } else {
      editor.setCursor(cursor_loc);
    }
    // focus the editor
    editor.focus();
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
    var tag_hint_label = data.list[i].substring(1);
    if (tag_hint_label[0] == '/') {
      // this is a closing tag, doesn't fit in an
      // 'Insert Element' window
      continue;
    }
    create_element(tag_hint_label);
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


