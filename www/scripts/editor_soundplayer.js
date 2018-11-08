var _sound_seek_seconds = 5; // TODO: Load from localStorage?

function sound_play_pause() {
  var player = document.getElementById("audio_player");
  if (player.paused) {
    player.play();
  } else { 
    player.pause();
  }
}

function sound_seek_relative(seconds) {
  var player = document.getElementById("audio_player");
  player.currentTime += seconds;
}

function initialize_sound_player() {
  var start_timestamp = get_timestamp_from_content(editor.getValue());

  var src_url = "https://butar.althingi.is/raedur/?start=" + start_timestamp;

  var parent_container = document.getElementById("sound-player-container");
  remove_all_children(parent_container);

  var audio_player = document.createElement("audio");
  var audio_src = document.createElement("source");
  audio_src.setAttribute("src", src_url);
  var attr = document.createAttribute("controls");
  audio_player.setAttributeNode(attr);
  attr = document.createAttribute("autoplay");
  audio_player.setAttributeNode(attr);
  audio_player.setAttribute("type", "audio/mpeg");
  audio_player.setAttribute("id", "audio_player");

  audio_player.appendChild(audio_src);
  parent_container.appendChild(audio_player);

  document.getElementById("sound-player-container").style.display = "block";
  // make the icon act as a play/pause button now
  var sound_player = document.getElementById('sound-player-icon');
  sound_player.removeEventListener('click', initialize_sound_player);
  sound_player.addEventListener('click', sound_play_pause);
}

function get_timestamp_from_content(content) {
  var start_search_index = content.indexOf("<umsýsla") + 7;

  var start_index = content.indexOf("tími", start_search_index) + 6;
  var end_index = content.indexOf('"', start_index);
  return content.substring(start_index, end_index);
}

/* fallback method in case the above method doesn't work... not currently used */
function get_speech_id_from_content(content) {
  // Since we know the legal XML layout, we can use this silly hack:
  // We want to find the first instance of "id=r" and start parsing from there to the closing quote
  var start_index = content.indexOf("id=\"r") + 5;
  if (start_index == 5) {
    // Houston, we have a problem!
    console.log("PROBLEM I HOUSTON");
    return;
  }
  var end_index = content.indexOf('"', start_index);
  if (end_index == -1) {
    // Houston, we have a problem!
    console.log("PROBLEM II HOUSTON");
    return;
  }

  var speech_identifier = content.substring(start_index, end_index);

  var regexp = /[-:]/g;
  var match = regexp.exec(speech_identifier);

  while (match != null) {
    // delete the token
    speech_identifier = speech_identifier.replace(match, '');
    // get a new match
    match = regexp.exec(speech_identifier);
  }

  return speech_identifier;
}

function set_audio_seek_size() {
  var new_seek_size = Number(prompt("Sekúndur til að spóla fram eða aftur í hverju þrepi:"));
  if (isNaN(new_seek_size)) {
    alert("Inntak þarf að vera tala!");
    return;
  }

  _sound_seek_seconds = new_seek_size;
}

function set_audio_rate() {
  var audio_player = document.getElementById("audio_player");
  if (!audio_player) {
    alert("Spilari hefur ekki verið virkjaður!");
    return;
  }

  var new_playback_rate = Number(prompt("Hraði spilunar:"));
  if (isNaN(new_playback_rate)) {
    alert("Inntak þarf að vera tala!");
    return;
  }
  if (new_playback_rate > 4 || new_playback_rate < 0.5) {
    alert("Spilunarhraði skal vera á milli 0.5 og 4!");
    return;
  }

  audio_player.playbackRate = new_playback_rate;
}

$(document).ready( function () {
  // Main player icon
  var sound_player = document.getElementById('sound-player-icon');
  sound_player.addEventListener('click', initialize_sound_player);
  sound_player.innerHTML = '🔊';

  // Menu item, same function as main player icon
  var initializer_menu_item = document.getElementById("initialize_sound_player");
  initializer_menu_item.addEventListener('click', initialize_sound_player);

  // set seek size
  var seek_size_setter = document.getElementById("set_audio_seek_size");
  seek_size_setter.addEventListener('click', set_audio_seek_size);

  // set playback rate
  var playback_rate_setter = document.getElementById("set_audio_rate");
  playback_rate_setter.addEventListener('click', set_audio_rate);
});
