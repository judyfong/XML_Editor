// we will map variables to keystrokes
// then we will listen to those keystrokes (based on variables)
// and execute the corresponding function

// naming convention: _key_SUBSYSTEM_function
var 
  /* editor functions */
    _key_editor_focus_toggle = 'F2'

  /* sounds */
  , _key_sound_play_pause = 'F6'
  , _key_sound_seek_forward = 'F8'
  , _key_sound_seek_backward = 'F7'
  /*  */
;

var _in_key_settings = false;

function initialize_keybindings() {
  // if there is local storage...
  // try to load keybindings that are saved
  if (storageAvailable('localStorage')) {
    let focus_toggle = localStorage.getItem('key_editor_focus_toggle');
    if (focus_toggle) {
      _key_editor_focus_toggle = focus_toggle;
    }
    let sound_play_pause = localStorage.getItem('key_sound_play_pause');
    if (sound_play_pause) {
      _key_sound_play_pause = sound_play_pause;
    }
    let sound_seek_forward = localStorage.getItem('key_sound_seek_forward');
    if (sound_seek_forward) {
      _key_sound_seek_forward = sound_seek_forward;
    }
    let sound_seek_backward = localStorage.getItem('key_sound_seek_backward');
    if (sound_seek_backward) {
      _key_sound_seek_backward = sound_seek_backward;
    }
  }

  document.addEventListener('keydown', handleKeyDownEvent);
  document.addEventListener('keyup', handleKeyUpEvent);

  let settings_btn = document.getElementById("open_key_settings");
  settings_btn.addEventListener('click', showKeyEditModalOverlay);
}

// Stop our keys from being captured by the browser
function handleKeyDownEvent(e) {
  if (_in_key_settings) {
    if (e.key == 'Escape') {
      closeKeyEditModal();
    }
    e.preventDefault();
    return;
  }
  switch(e.key) {
    case _key_sound_seek_forward:
      sound_seek_relative(_sound_seek_seconds);
      e.preventDefault();
      break;
    case _key_sound_seek_backward:
      sound_seek_relative(-_sound_seek_seconds);
      e.preventDefault();
      break;
    case _key_editor_focus_toggle:
    case _key_sound_play_pause:
      e.preventDefault();
      return;
  }
}

function handleKeyUpEvent(e) {
  if (e.defaultPrevented) {
    return;
  }
  if (_in_key_settings) {
    e.preventDefault();
    return;
  }

  let key = e.key;

  switch(key) {
    case _key_editor_focus_toggle:
      editor_focus_toggle();
      break;
    case _key_sound_play_pause:
      sound_play_pause();
      break;
      /*
    case _key_sound_seek_forward:
      //sound_seek_relative(_sound_seek_seconds);
      audio_player = document.getElementById("audio_player");
      audio_player.playbackRate = 1.0;
      */
      break;
    case _key_sound_seek_backward:
    case _key_sound_seek_forward:
      //sound_seek_relative(-_sound_seek_seconds);
      break;
    default:
      return false;
  }
  return true;
}

function closeKeyEditModal() {
  let modal = document.getElementById('keybind_modal');
  modal.classList.add("closed");
  remove_all_children(document.getElementById('keybind_content'));
  _in_key_settings = false;
}

function createKeyEditElement(label, input_id) {
  let current_key = window['_' + input_id];
  let key_div = document.createElement("div");
  let key_label = document.createElement("label");
  let key_input = document.createElement("input");

  key_label.appendChild(document.createTextNode(label))

  key_input.setAttribute("type", "text");
  key_input.setAttribute("value", current_key);

  key_label.setAttribute("for", input_id);
  key_input.setAttribute("id", input_id);

  key_div.setAttribute("class", "key_section");
  key_label.setAttribute("class", "key_label");
  key_input.setAttribute("class", "key_input");

  key_div.appendChild(key_label);
  key_div.appendChild(key_input);

  let content = document.getElementById('keybind_content');
  content.appendChild(key_div);
  key_input.addEventListener('keydown', createKeyEditHandler(input_id, key_input));
}

function createKeyEditHandler(key_id, key_input) {
  return function(evt) {
    let key = evt.key;
    if (key == 'Escape') {
      closeKeyEditModal();
      return;
    }
    switch (key) {
      // double check to make sure the key isn't in use
      case _key_editor_focus_toggle:
      case _key_sound_play_pause:
      case _key_sound_seek_forward:
      case _key_sound_seek_backward:
        // don't alert if it is 'this' key
        if (key != window['_' + key_id]) {
          alert("Flýtilikill er nú þegar í notkun!");
        }
        return;
      // if this is 'Backspace' or 'Delete', clear the binding
      case 'Backspace':
      case 'Delete':
        key = "";
        break;
    }
    if (key && key[0] != 'F') {
      alert("Einungis er hægt að nota F-lykla í flýtileiðum.");
      console.log("couldn't set key", key);
      return;
    }
    key_input.setAttribute("value", key);
    window["_" + key_id] = key;
  };
}

function showKeyEditModalOverlay() {
  _in_key_settings = true;
  let modal = document.getElementById('keybind_modal');
  let content = document.getElementById('keybind_content');

  // add all the keys
  createKeyEditElement("Fókus á ritil", "key_editor_focus_toggle");
  createKeyEditElement("Spilari - spila/pása", "key_sound_play_pause");
  createKeyEditElement("Spilari - spóla áfram", "key_sound_seek_forward");
  createKeyEditElement("Spilari - spóla aftur á bak", "key_sound_seek_backward");

  modal.classList.remove("closed");

  let close = document.getElementById("keybind_close");
  close.onclick = closeKeyEditModal;
}

$(document).ready(initialize_keybindings);
