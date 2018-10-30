// Helpful helper function
function remove_all_children(node) {
  var child = node.firstChild;
  while (child) {
    node.removeChild(child);
    child = node.firstChild;
  }
}

// Simple tag parser for finding tags for marking
function parse_tags() {
  // tags array for opening tags and closing tags
  var tags = []
  // Just find tags when they start, then parse until you find a matching closer
  // we want to create a tag_object which looks like:
  // { line, start_index, end_index, tag_label, tag_is_open }

  function tag_finder(lineHandle) {

    function find_full_tag(text, start_index) {
      // start_index points to a '<' and we will stop at the first '>'
      var content = text.substr(start_index);
      var stop_index = content.indexOf('>') + 1;
      return content.substr(0, stop_index);
    }

    var tag_object;

    var content = lineHandle.text;

    for (var i=0; i < content.length; ++i) {
      var letter = content[i];

      if (letter == '<' && content.length > i+1) {
        // We found a tag!
        var full_tag = find_full_tag(content, i);
        // what kind of tag is it?
        var tag_type = extract_tag_name(full_tag);

        // figure out what to do with it
        var tag_is_open = true;
        if (full_tag[1] == '/') {
          // this is a closing tag
          tag_is_open = false;
        }
        // create the tag object
        tag_object = { 
          line: editor.getLineNumber(lineHandle), 
          start_index: i,
          end_index: i+full_tag.length,
          tag_label: tag_type,
          tag_is_open: tag_is_open,
        }
        tags.push(tag_object);
      }
    }
  }

  function find_closing_tag(index, opening_tag) {
    // 1. N := count of how many tags of the same kind open after index in tags
    //
    // 2. find the Nth tag of that kind that closes

    var count = 0;

    for (var i = index + 1; i < tags.length; ++i) {
      var matching_tag = tags[i];
      if (matching_tag.tag_label == opening_tag.tag_label) {
        // we found a matching tag, do we increment/decrement count or return this tag?
        if (matching_tag.tag_is_open) {
          // oops, need to increment count
          count++;
          continue;
        } else {
          // this is a closing tag, check if count is zero
          if (count == 0) {
            return matching_tag;
          }
          // since we didn't return, decrement count
          count--;
        }
      }
    }
  }

  // populate the tags array
  editor.eachLine(tag_finder);

  // array of tag_pair object: { tag_open: tag_object, tag_close: tag_object }
  var tag_pairs = []

  for (var i = 0 ; i < tags.length - 1; ++i) { 
    var tag_object = tags[i];
    if (!tag_object.tag_is_open) {
      // we don't care about 'closing' tags, because we are... closing... tags...
      // in other words, we only want to close 'opening' tags
      continue;
    }
    var closer = find_closing_tag(i, tag_object);
    if (!closer) {
      //console.log("Couldn't find a closing tag for", tag_object.tag_label, "on line", tag_object.line);
    }
    tag_pair_object = { tag_open: tag_object, tag_close: closer }
    // unoptimized for refactorability
    tag_pairs.push(tag_pair_object)
  }

  return tag_pairs
}

function insert_element_at_cursor(element, movement=undefined) {
    var to;
    var selection = ''
    if (editor.somethingSelected()) {
      to = editor.getCursor('to');
    }
    var cursor_loc = editor.getCursor('from');
    if (!movement) {
      movement = element.length + 2;
    }
    editor.replaceRange(element, cursor_loc, to);
    
    // move the cursor appropriately
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

