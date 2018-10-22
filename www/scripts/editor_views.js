var _current_view = 'assisted';
var _last_view = 'none';
var _visible_tags = true;

function set_view(view_name) {
  _current_view = view_name;
  applyViewMode();
}

function cycle_current_view() {
  var views = ['raw', 'assisted', 'normal', 'debug'];
  var new_index = (views.indexOf(_current_view) + 1) % views.length;

  _current_view = views[new_index];
}

function cycleViewMode() {
  cycle_current_view();
  applyViewMode();
}

function applyViewMode() {
  // check first if anything changed
  if (_current_view == _last_view) {
    // Nothing to do, return
    editor.refresh();
    return;
  }

  // hide the debug container
  debug_container = document.getElementById('debug_container');
  debug_container.style.display = 'none';

  document.getElementById('editor-mode').innerHTML = _current_view + " mode";
  // format XML, moving tags to their own lines etc
  format_default();
  // remove all marks
  remove_tag_labels();
  switch (_current_view) {
    case 'raw':
      break // TODO: Demolish when debug mode is removed
    case 'debug':
      apply_debug_mode();
      break;
    case 'normal':
      //distribute_tags_to_lines();
      apply_normal_mode();
      break;
    case 'assisted':
      apply_assisted_mode();
      break;
  }

  set_view_theme(_current_view);

  _last_view = _current_view;

  // Last minute updates
  render_tag_visibility()

  // update the editor
  editor.refresh();
}

function set_view_theme(chosen_theme) {
  var sheets = document.getElementsByClassName('view-stylesheet');
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].id && sheets[i].id == 'view-hide-tags-stylesheet') {
      continue;
    }
    sheets[i].rel = 'alternate stylesheet';
  }

  var full_theme_name = 'view-'+chosen_theme+'-stylesheet';

  var theme_link = document.getElementById(full_theme_name);
  if (theme_link) {
    theme_link.rel = 'stylesheet';
  }
}

function render_tag_visibility() {
  // NEVER turn off tags in raw mode!! Leads to PEBCAK problems!
  var show_tags = _visible_tags;
  if (_current_view == 'raw') {
    show_tags = true;
  }
  // validate the view-hide-tags stylesheet visibility
  var tag_visibility_theme = document.getElementById('view-hide-tags-stylesheet');
  if (tag_visibility_theme) {
    if (show_tags) {
      tag_visibility_theme.rel = 'alternate stylesheet';
    } else {
      tag_visibility_theme.rel = 'stylesheet';
    }
  }
  
  // if marks exist on tags, collapse the tags
  var markers = editor.getAllMarks();

  for (var i = 0; i < markers.length; ++i) {
    markers[i].collapsed = !_visible_tags;
  }
  // potential TODO: fold lines that only contain hidden (collapsed) content
}

function toggle_tags() {
  // NEVER turn off tags in raw mode!! Leads to PEBCAK problems!
  if (_current_view == 'raw') {
    alert("Ekki er hægt að slökkva á tögum í hráum XML ham!");
    return;
  }
  // togle the variable
  _visible_tags = !_visible_tags;
  render_tag_visibility()
  editor.refresh();
}

function toggle_line_numbers() {
  var option = editor.getOption('lineNumbers');
  editor.setOption('lineNumbers', !option);
}

function format_default() {
  // fix lines
  format_tags_on_own_lines();

  // fix indentation
  for (var i = 0; i < editor.lineCount(); ++i) {
    editor.indentLine(i);
  }

  // update the editor
  setTimeout(function(){ editor.refresh(); }, 300);
}

function format_tags_on_own_lines() {
  function put_tag_on_line(tag) {
    // don't put special tags on lines
    switch (tag.tag_label) {
      case 'bjalla/':
      case 'truflun':
      case 'frammíkall':
      case 'niðurskrift':
      case 'uppskrift':
      case 'feitletrað':
      case 'skáletrað':
      case 'undirstrikað':
        return;
      default:
        /* intentionally blank */
    }

    var tag_line = editor.getLine(tag.line);

    // check if there is content *after* the tag
    if (tag_line.length > tag.end_index) {
      // there is content after the tag
      // only replace if this is a closing tag
      if (!tag.tag_is_open) {
        var from = { line: tag.line, ch: tag.end_index };
        editor.replaceRange('\n', from);
      }
    }

    // check if there is content *before* the tag
    var trimmed_line = tag_line.trimStart();
    var delta = tag_line.length - trimmed_line.length;
    if (tag.start_index - delta > 0) {
      // only replace if this is an opening tag
      if (tag.tag_is_open) {
        from = { line: tag.line, ch: tag.start_index };
        editor.replaceRange('\n', from);
      }
    }
  }

  var tag_pairs;  

  // iterate backwards to prevent propagation errors

  // do opening tags
  tag_pairs = parse_tags();  
  for (var i = tag_pairs.length-1 ; i >= 0; --i) {
    put_tag_on_line(tag_pairs[i].tag_open);
  }

  // then backwards iterate over SORTED closing tags
  var closing_tags = get_closing_tags_from_pairs(parse_tags());

  for (var i = closing_tags.length - 1; i >= 0; --i) {
    var tag_close = closing_tags[i];
    if (!tag_close) {
      continue;
    }
    put_tag_on_line(tag_close);
  }
}

function get_closing_tags_from_pairs(tag_pairs) {
  var closers = [];

  for (i=0; i < tag_pairs.length; ++i) {
    tag = tag_pairs[i].tag_close;
    if (tag) {
      closers.push(tag);
    }
  }

  return closers.sort(function(a,b) {
    if (a.line == b.line) {
      return a.start_index - b.start_index;
    }
    return a.line - b.line;
  });
}

function assign_tag_label(line_number, start, finish, className, options = { assisted: false }) {
  start_obj = { line: line_number, ch: start, }
  finish_obj = { line: line_number, ch: finish, }

  var collapse;

  var markTextOptions = {
    className: className,
    collapsed: false, //true,
    atomic: true,
    readOnly: true,
  }

  if (options.assisted) {
    // don't hide tags in assisted mode
    markTextOptions.collapsed = false;
  }

  if (options.stopLeft) {
    markTextOptions.inclusiveLeft = true;
  }

  if (options.stopRight) {
    markTextOptions.inclusiveRight = true;
  }

  editor.markText(start_obj, finish_obj, markTextOptions);
}

function mark_selection_custom_class(start_obj, finish_obj, className) {
  editor.markText(start_obj, finish_obj, {
    className: className,
  }
  );
}

function extract_tag_name(full_tag) {
  var tag_content_start = 1;
  if (full_tag[1] == '/') {
    tag_content_start = 2;
  }

  var tag_content_end = full_tag.length - 1;
  var first_space = full_tag.indexOf(' ')

  if (first_space != -1) {
    tag_content_end = first_space;
  }

  return full_tag.substring(tag_content_start, tag_content_end);
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

function mark_tag(tag, options) {
  var className;
  if (typeof options.className != 'undefined') {
    // allow className overriding
    className = options.className;
    /*
    } else if (tag.tag_is_open) {
        className = 'close_tag';
    } else {
        className = 'open_tag';
        */
  } else {
    className = 'marked-tag';
  }

  assign_tag_label(tag.line, tag.start_index, tag.end_index, className, options);
}

function apply_debug_mode() {
  editor.setOption("lineNumbers", true);
  debug_container = document.getElementById('debug_container');
  debug_container.style.display = 'block';
  console.log("applied debug mode.");
  _visible_tags = true;
}

function apply_normal_mode() {
  var tag_pairs = parse_tags();  

  // mark_selection_custom_class on content_start, content_end
  // content_start and content_end should be an object like { line: ln, ch: i }
  for (var i = 0; i < tag_pairs.length; ++i) {
    var tag_open = tag_pairs[i].tag_open;
    var tag_close = tag_pairs[i].tag_close;
    if (!tag_close) {
      // We have some kind of meta tag, just mark it
      mark_tag(tag_open, { className: "" } );
      continue;
    }
    mark_tag(tag_open,  { stopLeft:  true , className: "" } );
    mark_tag(tag_close, { stopRight: true , className: "" } );
  }
  // editor.setOption("lineNumbers", false);
}

function apply_assisted_mode() {
  var tag_pairs = parse_tags();  

  // mark_selection_custom_class on content_start, content_end
  // content_start and content_end should be an object like { line: ln, ch: i }
  for (var i = 0; i < tag_pairs.length; ++i) {
    var tag_open = tag_pairs[i].tag_open;
    var tag_close = tag_pairs[i].tag_close;
    mark_tag(tag_open, { assisted: true, stopLeft: true });
    if (tag_close) {
      mark_tag(tag_close, { assisted: true, stopRight: true });
    }
  }
  //editor.setOption("lineNumbers", true);
}

function remove_tag_labels() {
  editor.getAllMarks().forEach(function(mark) {
    last_mark = mark;
    mark.clear();
  });
}
