// For now, we don't have any real corrections so we're going to just mock them

// we'll do this by assuming that all <mgr> starts have correction candidates and we'll make the candidates be some canned Lorem Ispum stuff, this way we can reuse the tree explorer

function populateCorrections() {
  function addCorrectionToList(anchor, suggestions) {
    let list_element = document.createElement("li");
    let link_element = document.createElement("a");
    let text_content = 1 + anchor.start.line + ' ' + anchor.text;
    let text_node = document.createTextNode(text_content);
    link_element.appendChild(text_node);
    list_element.appendChild(link_element);

    link_element.setAttribute('href', '#');
    link_element.addEventListener('click', function() {
      promptSuggestionSelection(anchor, suggestions)
    });

    parent_node.appendChild(list_element);
  }
  let lipsum = "Lorem ipsum dolor sit amet.";

  let parent_node = document.getElementById("correction-suggestions");
  removeAllChildren(parent_node);

  // TODO: Get real ones, don't steal from populateTreeExplorer
  let tag_pairs = parseTags();
  for (let i = 0; i < tag_pairs.length; ++i) {
    let detected_tag = tag_pairs[i].tag_open;
    let closing_tag = tag_pairs[i].tag_close;
    if (!closing_tag) {
      continue;
    }
    let anchor =
      { 
        start:
        { 
          line: detected_tag.line, 
          ch: detected_tag.end_index 
        },
        end:
        {
          line: closing_tag.line,
          ch: closing_tag.start_index
        },
        text: getTextAtTagLocation(detected_tag)
      }
    if (detected_tag.tag_label == 'mgr') {
      // get the current text
      let current = editor.getRange(anchor.start, anchor.end);
      addCorrectionToList(anchor, [current, lipsum]);
    }
  }
}

function promptSuggestionSelection(anchor, suggestions) {
  function createCallback(div, anchor, suggestion) {
    return function() {
      editor.replaceRange(suggestion, anchor.start, anchor.end);
      removeAllChildren(div);
    }
  }
  function showCorrectionSuggestions(suggestions, origin) {
    let overlay = document.getElementById("correction-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.setAttribute("id", "correction-overlay");
      div = document.createElement("div");
      div.setAttribute("id", "suggestion-div");

      let text = document.createElement("h3");
      text.appendChild(document.createTextNode("Veljið breytingu eða smellið út fyrir tillögulista."));
      overlay.appendChild(text);

      overlay.appendChild(div);
      overlay.addEventListener("click", function() {
        let element = document.getElementById("correction-overlay");
        element.parentNode.removeChild(element);
      });
    }
    removeAllChildren(div);
    let ul = document.createElement("ul");

    for (let i = 0; i < suggestions.length; ++i) {
      let li = document.createElement("li");
      let al = document.createElement("a");
      ul.appendChild(li);
      li.appendChild(al);
      al.appendChild(document.createTextNode(suggestions[i]));
      al.setAttribute('href', '#');

      let callback = createCallback(overlay, anchor, suggestions[i]);

      al.addEventListener("click", callback);
    }

    div.appendChild(ul);
    div.setAttribute("style", "position: fixed; top: " + origin.top + "px; left: " + origin.left + "px;");
    div.setAttribute("class", "scrollable-modal");
    document.getElementById("main-container").appendChild(overlay);
  }

  // mark the selection
  editor.setSelection(anchor.start, anchor.end,/* { css: 'color: #f23' }*/);

  editor.focus();

  // get coordinates to draw the suggestions
  let origin = { 
    left: editor.charCoords(anchor.start, "page").left,
    top: editor.charCoords(anchor.end, "page").top + editor.defaultTextHeight() + 20,
  };

  showCorrectionSuggestions(suggestions, origin);

}

