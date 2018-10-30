// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
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

function saveEditorContentAs(identifier) {
  // strip semicolons since we use these for serialization
  identifier = identifier.replace(new RegExp(';', 'g'), '');
  // get saved files list
  var saved_files = localStorage.getItem("saved_files");

  if (!saved_files) {
    saved_files = identifier;
  } else {
    saved_files = saved_files + ';' + identifier;
  }

  var content = editor.getValue();

  localStorage.setItem(identifier, content);

  localStorage.setItem("saved_files", saved_files);

  initialize_local_storage()
}

function removeSavedContent(identifier) {
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
    var identifier = prompt("Skrá til að eyða");
    if (identifier) {
      removeSavedContent(identifier);
    }
  });

  parent_menu.appendChild(link_node);
}

$(document).ready(initialize_local_storage);
