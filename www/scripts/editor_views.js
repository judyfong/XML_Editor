var _current_view = 'assisted';
var _last_view = 'none';
var _visible_tags = true;

function restoreLocalSettings() {
  if (!storageAvailable('localStorage')) {
    console.log("Could not restore local settings: No storage available.");
    return;
  }
 
  let cw = localStorage.getItem('viewmode');
  let vt = localStorage.getItem('tag_visibility');
  if (cw) {
    set_view(cw);
  }
  if (vt) {
    _visible_tags = (vt == 'true');
  }

  let inserter_symbols = localStorage.getItem('symbols_inserter');
  let inserter_special = localStorage.getItem('special_inserter');
  if (inserter_symbols && inserter_symbols == 'true') {
    toggle_symbol_inserter();
  }
  if (inserter_special && inserter_special == 'true') {
    toggle_specialchars_inserter();
  }
  let line_numbers = localStorage.getItem('line_numbers');
  if (line_numbers && line_numbers == 'false') {
    // by default, line numbers are enabled
    toggle_line_numbers();
  }

  let font_size = localStorage.getItem('font_size');
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
  let content = editor.getValue();
  let congress = get_congress_number(content);
  let initials = get_member_initials_from_content(content);
  display_member_name_from_initials(congress, initials);
  initials = get_address_type_initials_from_content(content)
  display_address_type_by_initials(congress, initials);
}

function set_view_theme(chosen_theme) {
  let sheets = document.getElementsByClassName('view-stylesheet');
  for (let i = 0; i < sheets.length; i++) {
    if (sheets[i].id && sheets[i].id == 'view-hide-tags-stylesheet') {
      continue;
    }
    sheets[i].rel = 'alternate stylesheet';
  }

  let full_theme_name = 'view-'+chosen_theme+'-stylesheet';

  let theme_link = document.getElementById(full_theme_name);
  if (theme_link) {
    theme_link.rel = 'stylesheet';
  }
}

function render_tag_visibility() {
  // NEVER turn off tags in raw mode!! Leads to PEBCAK problems!
  let show_tags = _visible_tags;
  if (_current_view == 'XML') {
    show_tags = true;
  }
  // validate the view-hide-tags stylesheet visibility
  let tag_visibility_theme = document.getElementById('view-hide-tags-stylesheet');
  if (tag_visibility_theme) {
    let rel = 'stylesheet';
    if (show_tags) {
      rel = 'stylesheet alternate';
    }
    tag_visibility_theme.rel = rel;
  }
  
  // if marks exist on tags, collapse the tags
  let markers = editor.getAllMarks();

  for (let i = 0; i < markers.length; ++i) {
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
  let option = !editor.getOption('lineNumbers');
  editor.setOption('lineNumbers', option);
  save_view_option('line_numbers', option);
}

function toggle_symbol_inserter() {
  let cont_id = 'special-symbol-inserter'
  let container = document.getElementById(cont_id);
  
  // if the inserter exists, remove it
  if (container.childElementCount > 0) {
    remove_all_children(container);
    save_view_option('symbols_inserter', 'false');
    return;
  }
  save_view_option('symbols_inserter', 'true');

  let symbols = [
    '¡', '¿', '¢', '£', '¤', '¥', '¶', '§', '©', '®', '™', 'ª', '«', '»', '<', '>', '„', '“', '…', '–', '—', 'µ', 'ƒ', '×', '÷', '±', '¹', '²', '³', '¼', '½', '¾', '¦',
  ];
  
  container = create_symbol_inserter(cont_id, symbols);
  document.getElementById('special-symbol-inserter').appendChild(container);
}

function toggle_specialchars_inserter() {
  let cont_id = 'special-characters-inserter'
  let container = document.getElementById(cont_id);
  
  // if the inserter exists, remove it
  if (container.childElementCount > 0) {
    remove_all_children(container);
    save_view_option('special_inserter', 'false');
    return;
  }
  save_view_option('special_inserter', 'true');

  let cont_upper = 'special-characters-inserter-uppercase';
  let cont_lower = 'special-characters-inserter-lowercase';

  let symbols_upper = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÚÛÜÙÝß".split("");
  let symbols_lower = "àáâãäåæçèéêëìíîïðñòóôõöøúûüùýÿ".split("");

  let parent_container = document.getElementById('special-characters-inserter');
  let lower = create_symbol_inserter(cont_upper, symbols_upper);
  let upper = create_symbol_inserter(cont_lower, symbols_lower);
  parent_container.appendChild(upper);
  parent_container.appendChild(lower);
}

function create_symbol_inserter(container_id, symbols) {

  let container = document.createElement('div');
  container.setAttribute('id', container_id);
  container.setAttribute('style', 'border: 1px teal dotted;');
  let main_symbol_container = document.getElementById('symbol-inserter-container');
  main_symbol_container.appendChild(container);
  // create buttons for each symbol
  for (let i = 0; i < symbols.length; ++i) {
    let btn = document.createElement('button');
    btn.appendChild(document.createTextNode(symbols[i]));
    btn.setAttribute('class', 'insert-symbol button');
    btn.addEventListener('click', function() {
      insert_element_at_cursor(this.textContent, 1);
    });
    container.appendChild(btn);
  }

  return container;
}

function get_font_size() {
  let fz = $('.CodeMirror').css('font-size');
  let got_int = parseInt(fz);
  if (isNaN(got_int)) { return 13; }
  return got_int;
}

function inc_font_size() {
  new_size = get_font_size() + 2;
  change_font_size(new_size);
}

function dec_font_size() {
  new_size = get_font_size() - 2;
  change_font_size(new_size);
}

function format_default() {
  // fix lines
  format_tags_on_own_lines();

  // replace self-closing <mgr/> tags with <mgr></mgr>
  format_replace_mgr_selfclose();

  // fix indentation
  for (let i = 0; i < editor.lineCount(); ++i) {
    editor.indentLine(i);
  }

  // update the editor
  setTimeout(function(){ editor.refresh(); }, 300);
}

// Replaces <mgr/> tags with <mgr></mgr> so that users can type text inside them.
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

    let tag_line = editor.getLine(tag.line);

    // check if there is content *after* the tag
    if (tag_line.length > tag.end_index) {
      // there is content after the tag
      // only replace if this is a closing tag
      if (!tag.tag_is_open) {
        let from = { line: tag.line, ch: tag.end_index };
        editor.replaceRange('\n', from);
      }
    }

    // check if there is content *before* the tag
    let trimmed_line = tag_line.trimLeft();
    let delta = tag_line.length - trimmed_line.length;
    if (tag.start_index - delta > 0) {
      // only replace if this is an opening tag
      if (tag.tag_is_open) {
        from = { line: tag.line, ch: tag.start_index };
        editor.replaceRange('\n', from);
      }
    }
  }

  let tag_pairs;  

  // iterate backwards to prevent propagation errors

  // do opening tags
  tag_pairs = parse_tags(); // from editor_tools.js
  for (let i = tag_pairs.length-1 ; i >= 0; --i) {
    put_tag_on_line(tag_pairs[i].tag_open);
  }

  // then backwards iterate over SORTED closing tags
  let closing_tags = get_closing_tags_from_pairs(parse_tags());

  for (let i = closing_tags.length - 1; i >= 0; --i) {
    let tag_close = closing_tags[i];
    if (!tag_close) {
      continue;
    }
    put_tag_on_line(tag_close);
  }
}

function get_closing_tags_from_pairs(tag_pairs) {
  let closers = [];

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

  let collapse;

  let markTextOptions = {
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
  let tag_content_start = 1;
  if (full_tag[1] == '/') {
    tag_content_start = 2;
  }

  let tag_content_end = full_tag.length - 1;
  let first_space = full_tag.indexOf(' ')

  if (first_space != -1) {
    tag_content_end = first_space;
  }

  return full_tag.substring(tag_content_start, tag_content_end);
}

function mark_tag(tag, options) {
  let className;
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
  let special_tags = ["bjalla", "frammíkall"]
  for (let i = 0; i < special_tags.length; ++i) {
    let found = tag.tag_label.indexOf(special_tags[i]);
    if (found != -1) {
      className = 'marked-tag-no-hide';
    }
  }

  assign_tag_label(tag.line, tag.start_index, tag.end_index, className, options);
}

function apply_normal_mode() {
  let tag_pairs = parse_tags(); // from editor_tools.js

  // mark_selection_custom_class on content_start, content_end
  // content_start and content_end should be an object like { line: ln, ch: i }
  for (let i = 0; i < tag_pairs.length; ++i) {
    let tag_open = tag_pairs[i].tag_open;
    let tag_close = tag_pairs[i].tag_close;
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
  let tag_pairs = parse_tags(); // from editor_tools.js

  // mark_selection_custom_class on content_start, content_end
  // content_start and content_end should be an object like { line: ln, ch: i }
  for (let i = 0; i < tag_pairs.length; ++i) {
    let tag_open = tag_pairs[i].tag_open;
    let tag_close = tag_pairs[i].tag_close;
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
  let parent_menu = document.getElementById(parent_id);
  parent_menu.appendChild(element);
}

function insert_navbar_anchor_at(element, parent_id, before_id) {
  let parent_menu = document.getElementById(parent_id);
  let before_target = document.getElementById(before_id);

  parent_menu.insertBefore(element, before_target);
}

function make_nice_containers_collapsible() {
	let containers = document.getElementsByClassName("nice-container");

	for (let i = 0; i < containers.length; i++) {
    let heading = containers[i].firstElementChild;
    heading.classList.toggle("collapsible-inactive");
		heading.addEventListener("click", function() {
			this.classList.toggle("collapsible-active");
      this.classList.toggle("collapsible-inactive");
			let content = this.nextElementSibling;
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

