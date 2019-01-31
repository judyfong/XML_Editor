// Helpful helper function
function removeAllChildren(node) {
  let child = node.firstChild;
  while (child) {
    node.removeChild(child);
    child = node.firstChild;
  }
}

// Simple tag parser for finding tags for marking
function parseTags() {
  // tags array for opening tags and closing tags
  let tags = []
  // Just find tags when they start, then parse until you find a matching closer
  // we want to create a tag_object which looks like:
  // { line, start_index, end_index, tag_label, tag_is_open }

  function tagFinder(lineHandle) {

    function findFullTag(text, start_index) {
      // start_index points to a '<' and we will stop at the first '>'
      let content = text.substr(start_index);
      let stop_index = content.indexOf('>') + 1;
      return content.substr(0, stop_index);
    }

    let tag_object;

    let content = lineHandle.text;

    for (let i=0; i < content.length; ++i) {
      let letter = content[i];

      if (letter == '<' && content.length > i+1) {
        // We found a tag!
        let full_tag = findFullTag(content, i);
        // what kind of tag is it?
        let tag_type = extractTagName(full_tag);

        // figure out what to do with it
        let tag_is_open = true;
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

  function findClosingTag(index, opening_tag) {
    // 1. N := count of how many tags of the same kind open after index in tags
    //
    // 2. find the Nth tag of that kind that closes

    let count = 0;

    for (let i = index + 1; i < tags.length; ++i) {
      let matching_tag = tags[i];
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
  editor.eachLine(tagFinder);

  // array of tag_pair object: { tag_open: tag_object, tag_close: tag_object }
  let tag_pairs = []

  for (let i = 0 ; i < tags.length - 1; ++i) { 
    let tag_object = tags[i];
    if (!tag_object.tag_is_open) {
      // we don't care about 'closing' tags, because we are... closing... tags...
      // in other words, we only want to close 'opening' tags
      continue;
    }
    let closer = findClosingTag(i, tag_object);
    if (!closer) {
      //console.log("Couldn't find a closing tag for", tag_object.tag_label, "on line", tag_object.line);
    }
    tag_pair_object = { tag_open: tag_object, tag_close: closer }
    // unoptimized for refactorability
    tag_pairs.push(tag_pair_object)
  }

  return tag_pairs
}

function insertElementAtCursor(element, movement=undefined, newline=false) {
  let to;
  let selection = ''
  if (editor.somethingSelected()) {
    to = editor.getCursor('to');
  }
  let cursor_loc = editor.getCursor('from');
  if (!movement) {
    movement = element.length + 2;
  }
  // append newline if requested
  if (newline) {
    element += '\n';
  }

  // validate the replacement
  let content_before = editor.getValue();
  editor.replaceRange(element, cursor_loc, to);

  if (validateXMLW3(editor.getValue()) != "OK") {
    console.log("Inserting element", element, "at position", cursor_loc, "produces invalid XML.");
    alert("Villa! Tag er ekki leyfilegt á tilsettum stað.");
    editor.setValue(content_before);
    return;
  }

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

function getSpeechIdFromContent(content) {
  // Since we know the legal XML layout, we can use this silly hack:
  // We want to find the first instance of "id=r" and start parsing from there to the closing quote
  let start_index = content.indexOf("id=\"r") + 5;
  if (start_index == 5) {
    // Houston, we have a problem!
    return;
  }
  let end_index = content.indexOf('"', start_index);
  if (end_index == -1) {
    // Houston, we have a problem!
    return;
  }

  let speech_identifier = content.substring(start_index, end_index);

  let regexp = /[-:]/g;
  let match = regexp.exec(speech_identifier);

  while (match != null) {
    // delete the token
    speech_identifier = speech_identifier.replace(match, '');
    // get a new match
    match = regexp.exec(speech_identifier);
  }

  return speech_identifier;
}

function getTextAtTagLocation(tag) {
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

function getDisplay(container) {
  style = window.getComputedStyle(container);
  display = style.getPropertyValue('display');
  return display
}

function toggleDisplay(id) {
  container = document.getElementById(id);
  display = getDisplay(container);
  if (display == 'none') {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

// Throttling and Debouncing, taken from:
// https://codeburst.io/throttling-and-debouncing-in-javascript-b01cad5c8edf 
/**
	* debounce function
	* use inDebounce to maintain internal reference of timeout to clear
	*/
const debounce = (func, delay) => {
  let inDebounce
  return function() {
    const context = this
    const args = arguments
    clearTimeout(inDebounce)
    inDebounce = setTimeout(() =>
      func.apply(context, args)
      , delay)
  }
}

/**
  * throttle function that catches and triggers last invocation
  * use time to see if there is a last invocation
  */
const throttle = (func, limit) => {
  let lastFunc
  let lastRan
  return function() {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}
