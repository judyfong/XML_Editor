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
    setView(cw);
  }
  if (vt) {
    _visible_tags = (vt == 'true');
  }

  let inserter_symbols = localStorage.getItem('symbols_inserter');
  let inserter_special = localStorage.getItem('special_inserter');
  if (inserter_symbols && inserter_symbols == 'true') {
    toggleSymbolInserter();
  }
  if (inserter_special && inserter_special == 'true') {
    toggleSpecialcharsInserter();
  }
  let line_numbers = localStorage.getItem('line_numbers');
  if (line_numbers && line_numbers == 'false') {
    // by default, line numbers are enabled
    toggleLineNumbers();
  }

  let font_size = localStorage.getItem('font_size');
  if (font_size) {
    fsz_number = parseInt(font_size);
    if (!isNaN(fsz_number)) {
      changeFontSize(fsz_number);
    }
  }
}

function saveViewOption(optname, optval) {
  if (!storageAvailable('localStorage')) {
    console.log("Could not store local setting for: " + optname + "=" + optval + ": No storage available.");
    return;
  }

  localStorage.setItem(optname, optval);
}

function setView(view_name) {
  _current_view = view_name;
  applyViewMode();
  hideEmptyLines();

  saveViewOption('viewmode', view_name);
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
  formatDefault();
  // remove all marks
  removeTagLabels();
  switch (_current_view) {
    case 'XML':
    case 'raw':
      break
    case 'normal':
      applyNormalMode();
      break;
    case 'assisted':
      applyAssistedMode();
      break;
  }

  setViewTheme(_current_view);

  _last_view = _current_view;

  // Last minute updates
  renderTagVisibility();
  hideEmptyLines();

  // update the editor
  editor.refresh();

  // update any extra, non-editor elements
  updateHelperElements()
}

function updateHelperElements() {
  let content = editor.getValue();
  let congress = getCongressNumber(content);
  let initials = getMemberInitialsFromContent(content);
  displayMemberNameFromInitials(congress, initials);
  initials = getAddressTypeInitialsFromContent(content)
  displayAddressTypeByInitials(congress, initials);
}

function setViewTheme(chosen_theme) {
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

function renderTagVisibility() {
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

function hideIfEmpty(lineHandle) {
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

function hideEmptyLines() {
  if (_visible_tags || _current_view == 'XML') {
    return;
  }
  let linecount = editor.lineCount(); 

  editor.eachLine(hideIfEmpty);
}

function toggleTags() {
  // NEVER turn off tags in raw mode!! Leads to PEBCAK problems!
  if (_current_view == 'XML') {
    alert("Ekki er hægt að slökkva á tögum í hráum XML ham!");
    return;
  }
  // toggle the variable
  _visible_tags = !_visible_tags;
  saveViewOption('tag_visibility', _visible_tags);
  renderTagVisibility();
  hideEmptyLines();
  editor.refresh();
}

function toggleLineNumbers() {
  let option = !editor.getOption('lineNumbers');
  editor.setOption('lineNumbers', option);
  saveViewOption('line_numbers', option);
}

function toggleSymbolInserter() {
  let cont_id = 'special-symbol-inserter'
  let container = document.getElementById(cont_id);
  
  // if the inserter exists, remove it
  if (container.childElementCount > 0) {
    removeAllChildren(container);
    saveViewOption('symbols_inserter', 'false');
    return;
  }
  saveViewOption('symbols_inserter', 'true');

  let symbols = [
    '¡', '¿', '¢', '£', '¤', '¥', '¶', '§', '©', '®', '™', 'ª', '«', '»', '<', '>', '„', '“', '…', '–', '—', 'µ', 'ƒ', '×', '÷', '±', '¹', '²', '³', '¼', '½', '¾', '¦',
  ];
  
  container = createSymbolInserter(cont_id, symbols);
  document.getElementById('special-symbol-inserter').appendChild(container);
}

function toggleSpecialcharsInserter() {
  let cont_id = 'special-characters-inserter'
  let container = document.getElementById(cont_id);
  
  // if the inserter exists, remove it
  if (container.childElementCount > 0) {
    removeAllChildren(container);
    saveViewOption('special_inserter', 'false');
    return;
  }
  saveViewOption('special_inserter', 'true');

  let cont_upper = 'special-characters-inserter-uppercase';
  let cont_lower = 'special-characters-inserter-lowercase';

  let symbols_upper = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÚÛÜÙÝß".split("");
  let symbols_lower = "àáâãäåæçèéêëìíîïðñòóôõöøúûüùýÿ".split("");

  let parent_container = document.getElementById('special-characters-inserter');
  let lower = createSymbolInserter(cont_upper, symbols_upper);
  let upper = createSymbolInserter(cont_lower, symbols_lower);
  parent_container.appendChild(upper);
  parent_container.appendChild(lower);
}

function createSymbolInserter(container_id, symbols) {

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
      insertElementAtCursor(this.textContent, 1);
    });
    container.appendChild(btn);
  }

  return container;
}

function getFontSize() {
  let fz = $('.CodeMirror').css('font-size');
  let got_int = parseInt(fz);
  if (isNaN(got_int)) { return 13; }
  return got_int;
}

function incFontSize() {
  new_size = getFontSize() + 2;
  changeFontSize(new_size);
}

function decFontSize() {
  new_size = getFontSize() - 2;
  changeFontSize(new_size);
}

function formatDefault() {
  // fix lines
  formatTagsOnOwnLines();

  // replace self-closing <mgr/> tags with <mgr></mgr>
  formatReplaceMgrSelfclose();

  // fix indentation
  for (let i = 0; i < editor.lineCount(); ++i) {
    editor.indentLine(i);
  }

  // update the editor
  setTimeout(function(){ editor.refresh(); }, 300);
}

// Replaces <mgr/> tags with <mgr></mgr> so that users can type text inside them.
function formatReplaceMgrSelfclose() {
  let tag_pairs = parseTags();

  for (let i = tag_pairs.length-1; i >= 0; --i) {
    let tag = tag_pairs[i].tag_open;
    if (tag.tag_label == 'mgr/') {
      let from = { line: tag.line, ch: tag.start_index };
      let to   = { line: tag.line, ch: tag.start_index + 6 };
      editor.replaceRange("<mgr></mgr>", from, to);
    }
  }
}

function formatTagsOnOwnLines() {
  function putTagOnLine(tag) {
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
  tag_pairs = parseTags(); // from editor_tools.js
  for (let i = tag_pairs.length-1 ; i >= 0; --i) {
    putTagOnLine(tag_pairs[i].tag_open);
  }

  // then backwards iterate over SORTED closing tags
  let closing_tags = getClosingTagsFromPairs(parseTags());

  for (let i = closing_tags.length - 1; i >= 0; --i) {
    let tag_close = closing_tags[i];
    if (!tag_close) {
      continue;
    }
    putTagOnLine(tag_close);
  }
}

function getClosingTagsFromPairs(tag_pairs) {
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

function assignTagLabel(line_number, start, finish, className, options = { assisted: false }) {
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

function markSelectionCustomClass(start_obj, finish_obj, className) {
  editor.markText(start_obj, finish_obj, {
    className: className,
  }
  );
}

function extractTagName(full_tag) {
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

function markTag(tag, options) {
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

  assignTagLabel(tag.line, tag.start_index, tag.end_index, className, options);
}

function applyNormalMode() {
  let tag_pairs = parseTags(); // from editor_tools.js

  // mark_selection_custom_class on content_start, content_end
  // content_start and content_end should be an object like { line: ln, ch: i }
  for (let i = 0; i < tag_pairs.length; ++i) {
    let tag_open = tag_pairs[i].tag_open;
    let tag_close = tag_pairs[i].tag_close;
    if (!tag_close) {
      // We have some kind of meta tag, just mark it
      markTag(tag_open, { className: "" } );
      continue;
    }
    markTag(tag_open,  { stopLeft:  true , className: "" } );
    markTag(tag_close, { stopRight: true , className: "" } );
  }
  // editor.setOption("lineNumbers", false);
}

function applyAssistedMode() {
  let tag_pairs = parseTags(); // from editor_tools.js

  // mark_selection_custom_class on content_start, content_end
  // content_start and content_end should be an object like { line: ln, ch: i }
  for (let i = 0; i < tag_pairs.length; ++i) {
    let tag_open = tag_pairs[i].tag_open;
    let tag_close = tag_pairs[i].tag_close;
    markTag(tag_open, { assisted: true, stopLeft: true });
    if (tag_close) {
      markTag(tag_close, { assisted: true, stopRight: true });
    }
  }
  //editor.setOption("lineNumbers", true);
}

function removeTagLabels() {
  editor.getAllMarks().forEach(function(mark) {
    last_mark = mark;
    mark.clear();
  });
}

function placeNavbarAnchor(element, parent_id) {
  // insert the element in the right <ul> identified by parent_id
  let parent_menu = document.getElementById(parent_id);
  parent_menu.appendChild(element);
}

function insertNavbarAnchorAt(element, parent_id, before_id) {
  let parent_menu = document.getElementById(parent_id);
  let before_target = document.getElementById(before_id);

  parent_menu.insertBefore(element, before_target);
}

function makeNiceContainersCollapsible() {
	let containers = document.getElementsByClassName("nice-container");

	for (let i = 0; i < containers.length; i++) {
    let heading = containers[i].firstElementChild;
    heading.classList.toggle("collapsible-inactive");
		heading.addEventListener("click", function() {
			this.classList.toggle("collapsible-active");
      this.classList.toggle("collapsible-inactive");
			let content = this.nextElementSibling;
      toggleDisplay(content.id);
		});
	}
}

$(document).ready(function() {
  document.getElementById('view_normal_mode').addEventListener('click', function() { setView('normal'); });
  document.getElementById('view_assisted_mode').addEventListener('click', function() { setView('assisted'); });
  document.getElementById('view_raw_mode').addEventListener('click', function() { setView('XML'); });

  document.getElementById('hide_side_left').addEventListener('click', function() { toggleDisplay('side-container-left'); });
  document.getElementById('hide_side_right').addEventListener('click', function() { toggleDisplay('side-container-right'); });

  document.getElementById('toggle_symbol_inserter').addEventListener('click', toggleSymbolInserter);
  document.getElementById('toggle_specialchars_inserter').addEventListener('click', toggleSpecialcharsInserter);

  document.getElementById('toggle_tags').addEventListener('click', toggleTags);
  document.getElementById('toggle_line_numbers').addEventListener('click', toggleLineNumbers);

  document.getElementById('inc_font').addEventListener('click', incFontSize);
  document.getElementById('dec_font').addEventListener('click', decFontSize);
  document.getElementById('def_font').addEventListener('click', function() {changeFontSize('inherit');});

  makeNiceContainersCollapsible();
});

