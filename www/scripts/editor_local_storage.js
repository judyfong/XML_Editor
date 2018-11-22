// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
var _autosave_documents = false;

function storageAvailable(type) {
  try {
    var storage = window[type],
      x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0;
  }
}

function getAvailableFiles() {
  var saved_files_string = localStorage.getItem("saved_files");
  if (!saved_files_string) {
    return [];
  }
  var saved_files = saved_files_string.split(';');

  return saved_files;
}

function saveEditorContentAuto() {
  var speech_id = get_speech_id_from_content(editor.getValue())
  if (!speech_id) {
    /* don't autosave documents that don't have a name yet */
    /* speech_id = 'unknown_' + new Date().toISOString();  */
    return;
  }
  var identifier = 'auto_' + speech_id;
  saveEditorContentAs(identifier, overwrite=true);
}

function saveEditorContentAs(identifier, overwrite=false) {
  // strip semicolons since we use these for serialization
  identifier = identifier.replace(new RegExp(';', 'g'), '');
  // get saved files list
  var saved_files = localStorage.getItem("saved_files");

  var exists = false;
  if (!saved_files) {
    saved_files = identifier;
  } else {
    // make sure the saved file doesn't exist first.
    // if it does, we will overwrite it -- prompt the user
    var availables = getAvailableFiles();
    for (var i = 0; i < availables.length; ++i) {
      if (identifier == availables[i]) {
        exists = true;
        break;
      }
    }
    if (exists && !overwrite) {
      var ok = confirm("Skjal með þessu nafni er til, vista samt?");
      if (!ok) {
        return;
      }
    }

    if (!exists) {
      saved_files = saved_files + ';' + identifier;
    }
  }

  var content = editor.getValue();

  localStorage.setItem(identifier, content);

  localStorage.setItem("saved_files", saved_files);

  if (!exists) {
    initialize_local_storage()
  }
}

function removeSavedContent(identifier) {
  // First verify an exact match exists
  var availables = getAvailableFiles();
  var found = "no";
  var saved_files_string = "";
  for (var i = 0; i < availables.length; ++i) {
    if (identifier == availables[i]) {
      found = i;
      break;
    }
  }

  if (found == "no") {
    alert("Fann ekki tiltekna vistun.");
    return;
  }

  availables.splice(found, 1);

  var saved_files_string = availables.join(';');

  /*
  var saved_files_string = localStorage.getItem("saved_files");
  var left = saved_files_string.substring(0, saved_files_string.indexOf(identifier));
  var right = saved_files_string.substring(saved_files_string.indexOf(identifier) + identifier.length);
  saved_files_string = left + right;
  
  // strip extra semicolons
  saved_files_string = saved_files_string.replace(';;', ';');
  if (saved_files_string[0] == ';') {
    saved_files_string = saved_files_string.substring(1);
  }
  if (saved_files_string[saved_files_string.length-1] == ';') {
    saved_files_string = saved_files_string.substring(0, saved_files_string.length-1);
  }
  */

  localStorage.setItem("saved_files", saved_files_string);
  localStorage.removeItem(identifier);
  initialize_local_storage();
}

function loadSavedContent(identifier) {
  var content = localStorage.getItem(identifier);
  if (!content) {
    // TODO: error;
  }
  // TODO: Confirm prompt!!

  set_editor_content(content);
}

function initialize_local_storage() {
  if (!storageAvailable('localStorage')) {
    console.log("Local storage is not available!");
  }
  /*
    <a id='save_file_locally'>vista skjal...</a>
    <div class='separator'/>
    */
  var ad = localStorage.getItem("autosave");
  if (ad == 'true') {
    _autosave_documents = true;
  } else {
    _autosave_documents = false;
  }

  var parent_menu = document.getElementById('local_storage_menu');
  remove_all_children(parent_menu);

  // add the file saver
  var link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode('Vista skjal...'));
  link_node.setAttribute('href', '#');
  link_node.addEventListener('click', function() {
    var identifier = prompt("Vista sem...");
    if (identifier) {
      saveEditorContentAs(identifier);
    }
  });
  parent_menu.appendChild(link_node);

  var autosave_pre = 'Virkja';
  if (_autosave_documents) {
    autosave_pre = 'Óvirkja';
  }
  var autosave_text = autosave_pre + ' sjálfvirka skjalavistun';
  link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode(autosave_text));
  link_node.setAttribute('href', '#');
  link_node.addEventListener('click', function() {
    _autosave_documents = !_autosave_documents;
    localStorage.setItem("autosave", _autosave_documents);
    initialize_local_storage();
  });
  parent_menu.appendChild(link_node);

  var hr = document.createElement('div');
  hr.setAttribute('class', 'separator');
  parent_menu.appendChild(hr)

  var available_files = getAvailableFiles();

  for (var i = 0; i < available_files.length; ++i) {
    // create the entry here
    var link_node = document.createElement("a");
    link_node.appendChild(document.createTextNode(available_files[i]));
    link_node.setAttribute('href', '#');
    link_node.addEventListener('click', function() {
      loadSavedContent(this.textContent);
    });
    parent_menu.appendChild(link_node);
  }

  // if there was no saved content
  if (available_files.length == 0) {
    var link_node = document.createElement("a");
    link_node.appendChild(document.createTextNode("Engin vistuð skjöl."));
    parent_menu.appendChild(link_node);
  }

  var hr = document.createElement('div');
  hr.setAttribute('class', 'separator');
  parent_menu.appendChild(hr)

  // add the file remover
  link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode('Eyða vistun...'));
  link_node.setAttribute('href', '#');
  link_node.addEventListener('click', function() {
    var speech_id = get_speech_id_from_content(editor.getValue())
    var auto_identifier = ''
    var avails = getAvailableFiles();
    for (var i = 0; i < avails.length; ++i) {
      if (avails[i].indexOf(speech_id) != -1) {
        auto_identifier = avails[i];
        break;
      }
    }
    var identifier = prompt("Skrá til að eyða", auto_identifier);
    if (identifier) {
      removeSavedContent(identifier);
    }
  });

  parent_menu.appendChild(link_node);

  /* Add the "clear all saved items" option */

  link_node = document.createElement("a");
  link_node.appendChild(document.createTextNode('Hreinsa vafrageymslu'));
  link_node.setAttribute('href', '#');
  link_node.addEventListener('click', function() {
    var success = confirm("Hreinsa allar stillingar og eyða öllum skjölum úr vafrageymslu?");
    if (success) {
      localStorage.clear();
    }
  });

  parent_menu.appendChild(link_node);

  if (_autosave_documents) {
    editor.on('changes', saveEditorContentAuto);
  } else {
    editor.off('changes', saveEditorContentAuto);
  }
}
