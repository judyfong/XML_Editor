var _sound_playing;
var _sound_seek_seconds = 5; // TODO: Load from localStorage?

function initialize_sound_player() {
  var speech_identifier = get_speech_id_from_content(editor.getValue());
  var altext_url = generate_url_from_speech_id(speech_identifier);

  // Now that we know where to scrape, use jQuery to grab the desired sound file URL
  console.log("initializing sound player...");

  // remove current sound player
  var parent_container = document.getElementById('sound-player-links');
  remove_all_children(parent_container); 

  var url = "http://allorigins.me/get?method=raw&url=" + encodeURIComponent(altext_url) + "&callback=?";

  $.get(url, function(data){
    var anchor = $(data).find('#embeddcode').next().next();
    var sound_file_location = anchor.attr('href');
    if (sound_file_location) {
      activate_sound_player(sound_file_location);
    } else {
      console.log("Couldn't start sound player:", anchor);
      console.log(anchor.attr('href'), sound_file_location);
    }
  });
  document.getElementById('sound-player-container').style.display = 'block';
  var message = document.createElement("li");
  message.appendChild(document.createTextNode("Verið er að sækja hljóðbút..."));
  document.getElementById('sound-player-links').appendChild(message);
}

function cors_bypass(base_url) {
  var url = "http://allorigins.me/get?method=raw&url=" + encodeURIComponent(base_url) + "&callback=?";
  return url
}

function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = [].slice.call(new Uint8Array(buffer));

  bytes.forEach((b) => binary += String.fromCharCode(b));

  return window.btoa(binary);
};

var _last_sound_start, _last_sound_stop;

function get_sound_elapsed_time_from_now() {
  _last_sound_stop = new Date();
  return get_sound_elapsed_time();
}

function get_sound_elapsed_time() {
  var timeDiff =  _last_sound_stop - _last_sound_start;
  return timeDiff / 1000;
}

function seek_sound_relative(sound, seconds) {
  var cur_time = get_sound_elapsed_time_from_now();
  _last_sound_start -= (seconds * 1000);
  sound.seek(cur_time + seconds);
}

function sound_play_pause(sound) {
    if (sound.playing()) {
      ret = sound.pause();
      _last_sound_stop = new Date();
    } else {
      _last_sound_start = new Date();
      sound.play();
    }
}

function sound_set_rate(sound, rate) {
  sound.rate(rate);
}

function start_sound_player(content) {
  var parent_container = document.getElementById('sound-player-links');
  remove_all_children(parent_container); 

  function add_button_to_player(sound, anchor) {
    var link_node = document.createElement("li")
    link_node.appendChild(anchor);
    parent_container.appendChild(link_node);
  }

  if (_sound_playing && _sound_playing.playing()) {
      _sound_playing.pause();
  }

  var sound = new Howl({
    src: [ content ],
  });

  // pollute the global namespace...
  _sound_playing = sound;

  // create the dom elements now

  var play = document.createElement("a");
  play.appendChild(document.createTextNode("Play/Pause"));
  play.addEventListener('click', function() { sound_play_pause(sound); });
  add_button_to_player(sound, play);

  var seek = document.createElement("a");
  seek.appendChild(document.createTextNode("Spóla áfram"));
  seek.addEventListener('click', function() {
    seek_sound_relative(sound, _sound_seek_seconds);
  });
  add_button_to_player(sound, seek);

  var rseek = document.createElement("a");
  rseek.appendChild(document.createTextNode("Spóla aftur á bak"));
  rseek.addEventListener('click', function() {
    seek_sound_relative(sound, - _sound_seek_seconds);
  });
  add_button_to_player(sound, rseek);

  /*
   * Hér er hægt að hafa takka til að breyta spilunarhraða.
   * Athugið að hröðun spilunar eykur tíðni hlóðsins, sem breytir rödd ræðumanns.
  var speed_normal = document.createElement("a");
  speed_normal.appendChild(document.createTextNode("Spila á venjulegum hraða"));
  speed_normal.addEventListener('click', function() {
    sound_set_rate(sound, 1);
  });
  add_button_to_player(sound, speed_normal);

  var speedup = document.createElement("a");
  speedup.appendChild(document.createTextNode("Spila hraðar"));
  speedup.addEventListener('click', function() {
    sound_set_rate(sound, 1.2);
  });
  add_button_to_player(sound, speedup);
  */
}

function activate_sound_player(url) {
  // start by at least downloading the file
  var cors_url = cors_bypass(url);

  var request = new Request(cors_url);

  fetch(request, {}).then( (response) =>
    {
      response.arrayBuffer().then((buffer) =>
        {
          var sndStr = "data:audio/mp3;base64," + arrayBufferToBase64(buffer);

          start_sound_player(sndStr)

        }
      );
    }
  );
}

function generate_url_from_speech_id(spid) {
  return 'https://www.althingi.is/altext/upptokur/raeda/?raeda=rad' + spid;
}

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

$(document).ready( function () {
  var sound_player = document.getElementById('sound-player-icon');
  sound_player.addEventListener('click', initialize_sound_player);
  sound_player.innerHTML = '🔊';
});
