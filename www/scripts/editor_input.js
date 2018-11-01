// we will map variables to keystrokes
// then we will listen to those keystrokes (based on variables)
// and execute the corresponding function

// naming convention: _key_SUBSYSTEM_function
var 
  /* sounds */
    _key_sound_play_pause = 'F6'
  , _key_sound_seek_forward = 'F8'
  , _key_sound_seek_backward = 'F7'
  /*  */
;

function initialize_keybindings() {
  // if there is local storage...
  // try to load keybindings that are saved
  // TODO

  document.addEventListener('keydown', handleKeyDownEvent);
  document.addEventListener('keyup', handleKeyUpEvent);
}

// Stop our keys from being captured by the browser
function handleKeyDownEvent(e) {
  switch(e.key) {
    case _key_sound_play_pause:
    case _key_sound_seek_forward:
    case _key_sound_seek_backward:
      e.preventDefault();
      return;
  }
}

function handleKeyUpEvent(e) {
  if (e.defaultPrevented) {
    return;
  }

  var key = e.key;

  switch(key) {
    case _key_sound_play_pause:
      sound_play_pause(_sound_playing);
      break;
    case _key_sound_seek_forward:
      seek_sound_relative(_sound_playing, _sound_seek_seconds);
      break;
    case _key_sound_seek_backward:
      seek_sound_relative(_sound_playing, -_sound_seek_seconds);
      break;
     default:
      return false;
  }
  return true;
}

$(document).ready(initialize_keybindings);
