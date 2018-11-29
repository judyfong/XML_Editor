var _current_view = 'assisted';
var _last_view = 'none';
var _visible_tags = true;

function restoreLocalSettings() {
  if (!storageAvailable('localStorage')) {
    console.log("Could not restore local settings: No storage available.");
    return;
  }
 
  var cw = localStorage.getItem('viewmode');
  var vt = localStorage.getItem('tag_visibility');
  if (cw) {
    set_view(cw);
  }
  if (vt) {
    _visible_tags = (vt == 'true');
  }

  var inserter_symbols = localStorage.getItem('symbols_inserter');
  var inserter_special = localStorage.getItem('special_inserter');
  if (inserter_symbols && inserter_symbols == 'true') {
    toggle_symbol_inserter();
  }
  if (inserter_special && inserter_special == 'true') {
    toggle_specialchars_inserter();
  }
  var line_numbers = localStorage.getItem('line_numbers');
  if (line_numbers && line_numbers == 'false') {
    // by default, line numbers are enabled
    toggle_line_numbers();
  }

  var font_size = localStorage.getItem('font_size');
  if (font_size) {
    fsz_number = parseInt(font_size);
    if (!isNaN(fsz_number)) {
      change_font_size(fsz_number);
    }
  }
}

function save_view_option(optname, optval) {
  if (!storageAvailable('localStorage')) {
    console.log("Could not store local setting for: " + optname + "=" + optval + ": No storage available.");
    return;
  }

  localStorage.setItem(optname, optval);
}

function set_view(view_name) {
  _current_view = view_name;
  applyViewMode();
  hide_empty_lines();

  save_view_option('viewmode', view_name);
}

function applyViewMode() {
  // check first if anything changed
  if (_current_view == _last_view) {
    // Nothing to do, return
    editor.refresh();
    return;
  }

  // hide the debug container
  editor.setOption("firstLineNumber", 1);

  let view_name = 'XML';

  switch (_current_view) {
    case 'normal':
      view_name = 'áberandi';
      break;
    case 'assisted':
      view_name = 'einföld';
  }

  document.getElementById('editor-mode').innerHTML = view_name + " sýn";
  // format XML, moving tags to their own lines etc
  format_default();
  // remove all marks
  remove_tag_labels();
  switch (_current_view) {
    case 'XML':
    case 'raw':
      break
    case 'normal':
      apply_normal_mode();
      break;
    case 'assisted':
      apply_assisted_mode();
      break;
  }

  set_view_theme(_current_view);

  _last_view = _current_view;

  // Last minute updates
  render_tag_visibility();
  hide_empty_lines();

  // update the editor
  editor.refresh();

  // update any extra, non-editor elements
  update_helper_elements()
}

function update_helper_elements() {
  var content = editor.getValue();
  var congress = get_congress_number(content);
  var initials = get_member_initials_from_content(content);
  display_member_name_from_initials(congress, initials);
  initials = get_address_type_initials_from_content(content)
  display_address_type_by_initials(congress, initials);
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
  if (_current_view == 'XML') {
    show_tags = true;
  }
  // validate the view-hide-tags stylesheet visibility
  var tag_visibility_theme = document.getElementById('view-hide-tags-stylesheet');
  if (tag_visibility_theme) {
    var rel = 'stylesheet';
    if (show_tags) {
      rel = 'stylesheet alternate';
    }
    tag_visibility_theme.rel = rel;
  }
  
  // if marks exist on tags, collapse the tags
  var markers = editor.getAllMarks();

  for (var i = 0; i < markers.length; ++i) {
    if (markers[i].className == 'marked-tag-no-hide') {
      continue;
    }
    markers[i].collapsed = !_visible_tags;
  }
}

function hide_if_empty(lineHandle) {
  // don't hide the line if the cursor is on this line
  let lineNumber = editor.getLineNumber(lineHandle);
  if (editor.getCursor().line == lineNumber) {
    return;
  }
  let text = lineHandle.text;
  indexOpen = 0;
  while (indexOpen != -1) {
    indexOpen = text.indexOf('<');
    indexClose = text.indexOf('>', indexOpen) + 1;
    text = text.substr(0, indexOpen) + text.substr(indexClose);
  }
  text = text.trim();
  if (!text) {
    editor.markText({line: lineNumber, ch: 0}, {line: lineNumber}, {inclusiveRight: true, inclusiveLeft: true, collapsed: true});
  }
}

function hide_empty_lines() {
  if (_visible_tags || _current_view == 'XML') {
    return;
  }
  let linecount = editor.lineCount(); 

  editor.eachLine(hide_if_empty);
}

function toggle_tags() {
  // NEVER turn off tags in raw mode!! Leads to PEBCAK problems!
  if (_current_view == 'XML') {
    alert("Ekki er hægt að slökkva á tögum í hráum XML ham!");
    return;
  }
  // toggle the variable
  _visible_tags = !_visible_tags;
  save_view_option('tag_visibility', _visible_tags);
  render_tag_visibility();
  hide_empty_lines();
  editor.refresh();
}

function toggle_line_numbers() {
  var option = !editor.getOption('lineNumbers');
  editor.setOption('lineNumbers', option);
  save_view_option('line_numbers', option);
}

function toggle_symbol_inserter() {
  var cont_id = 'special-symbol-inserter'
  var container = document.getElementById(cont_id);
  
  // if the inserter exists, remove it
  if (container.childElementCount > 0) {
    remove_all_children(container);
    save_view_option('symbols_inserter', 'false');
    return;
  }
  save_view_option('symbols_inserter', 'true');

  var symbols = [
    '¡', '¿', '¢', '£', '¤', '¥', '¶', '§', '©', '®', '™', 'ª', '«', '»', '<', '>', '„', '“', '…', '–', '—', 'µ', 'ƒ', '×', '÷', '±', '¹', '²', '³', '¼', '½', '¾', '¦',
  ];
  
  container = create_symbol_inserter(cont_id, symbols);
  document.getElementById('special-symbol-inserter').appendChild(container);
}

function toggle_specialchars_inserter() {
  var cont_id = 'special-characters-inserter'
  var container = document.getElementById(cont_id);
  
  // if the inserter exists, remove it
  if (container.childElementCount > 0) {
    remove_all_children(container);
    save_view_option('special_inserter', 'false');
    return;
  }
  save_view_option('special_inserter', 'true');

  var cont_upper = 'special-characters-inserter-uppercase';
  var cont_lower = 'special-characters-inserter-lowercase';

  var symbols_upper = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÚÛÜÙÝß".split("");
  var symbols_lower = "àáâãäåæçèéêëìíîïðñòóôõöøúûüùýÿ".split("");

  var parent_container = document.getElementById('special-characters-inserter');
  var lower = create_symbol_inserter(cont_upper, symbols_upper);
  var upper = create_symbol_inserter(cont_lower, symbols_lower);
  parent_container.appendChild(upper);
  parent_container.appendChild(lower);
}

function create_symbol_inserter(container_id, symbols) {

  var container = document.createElement('div');
  container.setAttribute('id', container_id);
  container.setAttribute('style', 'border: 1px teal dotted;');
  var main_symbol_container = document.getElementById('symbol-inserter-container');
  main_symbol_container.appendChild(container);
  // create buttons for each symbol
  for (var i = 0; i < symbols.length; ++i) {
    var btn = document.createElement('button');
    btn.appendChild(document.createTextNode(symbols[i]));
    btn.setAttribute('class', 'insert-symbol button');
    btn.addEventListener('click', function() {
      insert_element_at_cursor(this.textContent, 1);
    });
    container.appendChild(btn);
  }

  return container;
}

function format_default() {
  // fix lines
  format_tags_on_own_lines();

  // replace self-closing <mgr/> tags with <mgr></mgr>
  format_replace_mgr_selfclose();

  // fix indentation
  for (var i = 0; i < editor.lineCount(); ++i) {
    editor.indentLine(i);
  }

  // update the editor
  setTimeout(function(){ editor.refresh(); }, 300);
}

function format_replace_mgr_selfclose() {
  let tag_pairs = parse_tags();

  for (let i = tag_pairs.length-1; i >= 0; --i) {
    let tag = tag_pairs[i].tag_open;
    if (tag.tag_label == 'mgr/') {
      let from = { line: tag.line, ch: tag.start_index };
      let to   = { line: tag.line, ch: tag.start_index + 6 };
      editor.replaceRange("<mgr></mgr>", from, to);
    }
  }
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
    var trimmed_line = tag_line.trimLeft();
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
  tag_pairs = parse_tags(); // from editor_tools.js
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

  // If it's a special, un-hideable tag, give it a special className
  var special_tags = ["bjalla", "frammíkall"]
  for (var i = 0; i < special_tags.length; ++i) {
    var found = tag.tag_label.indexOf(special_tags[i]);
    if (found != -1) {
      className = 'marked-tag-no-hide';
    }
  }

  assign_tag_label(tag.line, tag.start_index, tag.end_index, className, options);
}

function apply_normal_mode() {
  var tag_pairs = parse_tags(); // from editor_tools.js

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
  var tag_pairs = parse_tags(); // from editor_tools.js

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

function place_navbar_anchor(element, parent_id) {
  // insert the element in the right <ul> identified by parent_id
  var parent_menu = document.getElementById(parent_id);
  parent_menu.appendChild(element);
}

function insert_navbar_anchor_at(element, parent_id, before_id) {
  var parent_menu = document.getElementById(parent_id);
  var before_target = document.getElementById(before_id);

  parent_menu.insertBefore(element, before_target);
}

function make_nice_containers_collapsible() {
	var containers = document.getElementsByClassName("nice-container");

	for (var i = 0; i < containers.length; i++) {
    var heading = containers[i].firstElementChild;
    heading.classList.toggle("collapsible-inactive");
		heading.addEventListener("click", function() {
			this.classList.toggle("collapsible-active");
      this.classList.toggle("collapsible-inactive");
			var content = this.nextElementSibling;
      toggle_display(content.id);
		});
	}
}

$(document).ready(function() {
  document.getElementById('view_normal_mode').addEventListener('click', function() { set_view('normal'); });
  document.getElementById('view_assisted_mode').addEventListener('click', function() { set_view('assisted'); });
  document.getElementById('view_raw_mode').addEventListener('click', function() { set_view('XML'); });

  document.getElementById('hide_side_left').addEventListener('click', function() { toggle_display('side-container-left'); });
  document.getElementById('hide_side_right').addEventListener('click', function() { toggle_display('side-container-right'); });

  document.getElementById('toggle_symbol_inserter').addEventListener('click', toggle_symbol_inserter);
  document.getElementById('toggle_specialchars_inserter').addEventListener('click', toggle_specialchars_inserter);

  document.getElementById('toggle_tags').addEventListener('click', toggle_tags);
  document.getElementById('toggle_line_numbers').addEventListener('click', toggle_line_numbers);

  document.getElementById('inc_font').addEventListener('click', inc_font_size);
  document.getElementById('dec_font').addEventListener('click', dec_font_size);
  document.getElementById('def_font').addEventListener('click', function() {change_font_size('inherit');});

  make_nice_containers_collapsible();
});

