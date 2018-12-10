function dctmError(evt) {
    alert("Ekki er hægt að vinna með Documentum eins og er -- samþættingu vantar.");

}

function dctmCheckIn() {
  let speech_id = getSpeechIdFromContent(editor.getValue())
  // TODO: Check the file in
  
  let check_in_success = false;
  // TODO: Once check-in confirmed, delete 'this' from browser local storaeg
  if (check_in_success) {
    if (storageAvailable('localStorage')) {
      removeSavedContent(speech_id);
    }
  } else {
    alert("Ekki var hægt að senda skrá inn!");
  }
}

function dctmCheckOut() {
  // TODO: Let the user select a file to check out
  // or at least provide the file name
}

$(document).ready(function() {
  document.getElementById('dctm_check_out').addEventListener('click', dctmError);
  document.getElementById('dctm_check_in').addEventListener('click', dctmError);
});
