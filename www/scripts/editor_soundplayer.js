var _sound_seek_seconds = 0.5; // TODO: Load from localStorage?

function windBackward() {
  let player = document.getElementById("audio_player");
  if (player.currentTime <= _seekSeconds) {
    player.currentTime = 0;
  } else {
    player.currentTime -= _seekSeconds;
  }
}

function windForward() {
  let player = document.getElementById("audio_player");
  if (player.currentTime >= player.duration + _seekSeconds) {
    player.currentTime = player.duration;
    stopMediaSeek();
  } else {
    player.currentTime += _seekSeconds;
  }
}

function sound_play_pause() {
  let player = document.getElementById("audio_player");
  if (!player) {
    initialize_sound_player();
    return;
  }
  if (player.paused) {
    player.play();
  } else { 
    player.pause();
  }
}

function sound_seek_relative(seconds) {
  let player = document.getElementById("audio_player");
  player.currentTime += seconds;
}

function initialize_sound_player(evt, bufsz='TRUE') {
  let start_timestamp = get_timestamp_from_content(editor.getValue());

  let src_url = "https://butar.althingi.is/raedur/?start=" + start_timestamp + "&buffer=" + bufsz;

  let parent_container = document.getElementById("sound-player-container");
  remove_all_children(parent_container);

  let audio_player = document.createElement("audio");
  let audio_src = document.createElement("source");
  audio_src.setAttribute("src", src_url);
  let attr = document.createAttribute("controls");
  audio_player.setAttributeNode(attr);
  attr = document.createAttribute("autoplay");
  audio_player.setAttributeNode(attr);
  audio_player.setAttribute("type", "audio/mpeg");
  audio_player.setAttribute("id", "audio_player");
  let startTime = parseInt(bufsz, 10);
  if (isNaN(startTime)) {
    startTime = 60;
  }
  audio_player.currentTime = startTime;

  audio_player.appendChild(audio_src);
  parent_container.appendChild(audio_player);

  document.getElementById("sound-player-container").style.display = "block";
  // make the icon act as a play/pause button now
  let sound_player = document.getElementById('sound-player-icon');
  sound_player.removeEventListener('click', initialize_sound_player);
  sound_player.addEventListener('click', sound_play_pause);

  // bookmarks bar
  let bookmark_container = document.getElementById("bookmark-container");
  let add_bookmark = document.getElementById("add_bookmark");

  add_bookmark.addEventListener("click", function() {
    let link_node = document.createElement("a");
    let time = audio_player.currentTime;
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time % 60);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    let text = document.createTextNode("Bókamerki: " + minutes + ":" + seconds);
    link_node.appendChild(text);
    link_node.setAttribute('href', '#');
    link_node.addEventListener("click", function(evt) {
      let player = document.getElementById("audio_player");
      player.currentTime = time;
    });

    parent_menu = document.getElementById("audio_player_menu");
    parent_menu.appendChild(link_node);
  });
}

function get_timestamp_from_content(content) {
  let start_search_index = content.indexOf("<umsýsla") + 7;

  let start_index = content.indexOf("tími", start_search_index) + 6;
  let end_index = content.indexOf('"', start_index);
  return content.substring(start_index, end_index);
}

function set_audio_seek_size() {
  let new_seek_size = Number(prompt("Sekúndur til að spóla fram eða aftur í hverju þrepi:"));
  if (isNaN(new_seek_size)) {
    alert("Inntak þarf að vera tala!");
    return;
  }

  _sound_seek_seconds = new_seek_size;

  if (storageAvailable('localStorage')) {
    localStorage.setItem('sound_seek_seconds', _sound_seek_seconds);
  }
}

function set_audio_rate() {
  let audio_player = document.getElementById("audio_player");
  if (!audio_player) {
    alert("Spilari hefur ekki verið virkjaður!");
    return;
  }

  let new_playback_rate = Number(prompt("Hraði spilunar (á milli 0.5 og 2.0):"));
  if (new_playback_rate == "") { 
    return;
  }
  if (isNaN(new_playback_rate)) {
    alert("Inntak þarf að vera tala!");
    return;
  }
  if (new_playback_rate > 4 || new_playback_rate < 0.5) {
    alert("Spilunarhraði skal vera á milli 0.5 og 2.0!");
    return;
  }

  audio_player.playbackRate = new_playback_rate;
}

$(document).ready( function () {
  // Main player icon
  let sound_player = document.getElementById('sound-player-icon');
  sound_player.addEventListener('click', initialize_sound_player);
  sound_player.innerHTML = '🔊';

  // Menu item, same function as main player icon
  let initializer_menu_item = document.getElementById("initialize_sound_player");
  initializer_menu_item.addEventListener('click', initialize_sound_player);

  let custom_initializer_menu_item = document.getElementById("sound_player_custom_buffer");
  custom_initializer_menu_item.addEventListener('click', function(evt) {
    let bufsz = prompt("Aukastærð hljóðbúts:", 60);
    initialize_sound_player(evt, bufsz);
  });

  // set seek size
  let seek_size_setter = document.getElementById("set_audio_seek_size");
  seek_size_setter.addEventListener('click', set_audio_seek_size);

  // set playback rate
  let playback_rate_setter = document.getElementById("set_audio_rate");
  playback_rate_setter.addEventListener('click', set_audio_rate);

  // Restore local settings
  if (storageAvailable('localStorage')) {
    let snd_seek_secs = parseInt(localStorage.getItem('sound_seek_seconds'));
    if (snd_seek_secs && !isNaN(snd_seek_secs)) {
      _sound_seek_seconds = snd_seek_secs;
    }
  }
});
