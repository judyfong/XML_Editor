var _sound_seek_seconds = 0.5;

function soundPlayPause() {
  let player = document.getElementById("audio-player");
  if (!player) {
    initializeSoundPlayer();
    return;
  }
  if (player.paused) {
    player.play();
  } else { 
    player.pause();
  }
}

function soundSeekRelative(seconds) {
  let player = document.getElementById("audio-player");
  player.currentTime += seconds;
}

var speech_start_date;
var speech_bufsz;
function updateRealTimer(evt) {
  audio_player = document.getElementById('audio-player');
  let play_time = audio_player.currentTime - speech_bufsz;
  let seconds = speech_start_date.getSeconds() + play_time;
  current_time = new Date(speech_start_date);
  current_time.setSeconds(seconds);
  document.getElementById('sound-player-real-timer').innerHTML = current_time.toLocaleString('is');
}

function initializeSoundPlayer(evt, bufsz='TRUE') {
  let start_timestamp = getTimestampFromContent(editor.getValue());

  let src_url = "https://butar.althingi.is/raedur/?start=" + start_timestamp + "&buffer=" + bufsz;

  let parent_container = document.getElementById("sound-player-container");
  removeAllChildren(parent_container);

  let audio_player = document.createElement("audio");
  let audio_src = document.createElement("source");
  audio_src.setAttribute("src", src_url);
  let attr = document.createAttribute("controls");
  audio_player.setAttributeNode(attr);
  attr = document.createAttribute("autoplay");
  audio_player.setAttributeNode(attr);
  audio_player.setAttribute("type", "audio/mpeg");
  audio_player.setAttribute("id", "audio-player");
  let startTime = parseInt(bufsz, 10);
  if (isNaN(startTime)) {
    startTime = 60;
  }
  speech_bufsz = startTime;
  audio_player.currentTime = startTime;

  audio_player.appendChild(audio_src);
  parent_container.appendChild(audio_player);

  document.getElementById("sound-player-container").style.display = "block";
  // make the icon act as a play/pause button now
  let sound_player = document.getElementById('sound-player-icon');
  sound_player.removeEventListener('click', initializeSoundPlayer);
  sound_player.addEventListener('click', soundPlayPause);

  // display a little realtime clock
  let real_timer = document.createElement("div");
  real_timer.setAttribute('id', 'sound-player-real-timer');
  audio_player.addEventListener('timeupdate', updateRealTimer)
  parent_container.appendChild(real_timer);

  // bookmarks bar
  let add_bookmark = document.getElementById("add-bookmark");

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
      let player = document.getElementById("audio-player");
      player.currentTime = time;
    });

    parent_menu = document.getElementById("audio-player-menu");
    parent_menu.appendChild(link_node);
  });
  
  // save the speech start time too
  speech_start_date = new Date(start_timestamp);
}

function getTimestampFromContent(content) {
  let start_search_index = content.indexOf("<umsýsla") + 7;

  let start_index = content.indexOf("tími", start_search_index) + 6;
  let end_index = content.indexOf('"', start_index);
  return content.substring(start_index, end_index);
}

function setAudioSeekSize() {
  let new_seek_size = Number(prompt("Sekúndur til að spóla fram eða aftur í hverju þrepi:", _sound_seek_seconds));
  if (isNaN(new_seek_size)) {
    alert("Inntak þarf að vera tala!");
    return;
  }

  _sound_seek_seconds = new_seek_size;

  if (storageAvailable('localStorage')) {
    localStorage.setItem('sound_seek_seconds', _sound_seek_seconds);
  }
}

function setAudioRate() {
  let audio_player = document.getElementById("audio-player");
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
  sound_player.addEventListener('click', initializeSoundPlayer);
  sound_player.innerHTML = '🔊';

  // Menu item, same function as main player icon
  let initializer_menu_item = document.getElementById("initialize-sound-player");
  initializer_menu_item.addEventListener('click', initializeSoundPlayer);

  let custom_initializer_menu_item = document.getElementById("sound-player-custom-buffer");
  custom_initializer_menu_item.addEventListener('click', function(evt) {
    let bufsz = prompt("Aukastærð hljóðbúts:", 60);
    if (bufsz) {
      initializeSoundPlayer(evt, bufsz);
    }
  });

  // set seek size
  let seek_size_setter = document.getElementById("set-audio-seek-size");
  seek_size_setter.addEventListener('click', setAudioSeekSize);

  // set playback rate
  let playback_rate_setter = document.getElementById("set-audio-rate");
  playback_rate_setter.addEventListener('click', setAudioRate);

  // Restore local settings
  if (storageAvailable('localStorage')) {
    let snd_seek_secs = parseInt(localStorage.getItem('sound_seek_seconds'));
    if (snd_seek_secs && !isNaN(snd_seek_secs)) {
      _sound_seek_seconds = snd_seek_secs;
    }
  }
});
