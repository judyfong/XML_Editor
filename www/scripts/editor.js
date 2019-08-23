var editor;

function setEditorOptions(editor) {
  function completeAfter(cm, pred) {
    let cur = cm.getCursor();
    if (!pred || pred()) setTimeout(function() {
      if (!cm.state.completionActive)
        cm.showHint({completeSingle: false});
    }, 100);
    return CodeMirror.Pass;
  }

  function completeIfAfterLt(cm) {
    return completeAfter(cm, function() {
      let cur = cm.getCursor();
      return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
    });
  }

  function completeIfInTag(cm) {
    return completeAfter(cm, function() {
      let tok = cm.getTokenAt(cm.getCursor());
      if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
        let inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
        return inner.tagName;
      });
  }

  editor.setOption('mode', 'xml_tagged');
  editor.setOption('tabindex', -1);
  editor.setOption('lineWrapping', true);
  editor.setOption('lineNumbers', true);
  editor.setOption('extraKeys', 
    {
      "Enter": handleEnterPressed,
      "'<'": completeAfter,
      "'/'": completeIfAfterLt,
      "' '": completeIfInTag,
      "'='": completeIfInTag,
      "Ctrl-Space": "autocomplete"
    }
  );
  let callback = function(obj) {
    editor.setOption('hintOptions', { schemaInfo: obj });
    schema_tags = obj;
  };

  readTags('resources/tags.json', callback);
}

function readTags(path, callback) {
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      let myObj = JSON.parse(this.responseText);
      callback(myObj);
    }
  };
  xmlhttp.open("GET", path, true);
  xmlhttp.send();    
}

var schema_tags;

function start() {
  let example_xml=`
<?dctm xml_app="Raeduskjal"?>
<ræða id="r2017-12-14T16:09:27" skst="SJS" tegr="R" tegflm="E" frhr="0">
<umsýsla fundur="1" tími="2017-12-14T16:09:27" lgþ="148">
    <mál nr="8" málstegund="þi" málsflokkur="B">
        <málsheiti>drengskaparheit unnin</málsheiti>
    </mál>
</umsýsla>
<ræðutexti>
    <mgr>Samkvæmt 2. gr. þingskapa ber þeim alþingismönnum sem nú taka sæti á Alþingi í fyrsta sinn að undirrita drengskaparheit að stjórnarskránni. Af hinum 19 nýkjörnu alþingismönnum hafa níu áður tekið sæti á Alþingi, einn þingmaður er fjarverandi og undirritar heit sitt síðar, svo níu nýir þingmenn munu undirrita drengskaparheit á þessum fundi.</mgr>
    <mgr>
        <atburður>[Níu þingmenn undirrituðu drengskaparheit um að halda stjórnarskrána.]</atburður>
    </mgr>
</ræðutexti>
</ræða>
`;

  editor = CodeMirror(document.getElementById("editor-container"));

  editor.setValue(example_xml);
  setEditorOptions(editor);

  editor.on('beforeChange', fixInsertQuotes);
  //editor.on('changes', handleChanges);
/*  editor.on('focus', autovalidator);*/
  editor.on('focus', applyViewMode);
  editor.on('cursorActivity', handleCursorActivity);
  editorInitializers();
}

function loadXMLtoEditor(xml_path) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', xml_path, true);
  xhr.send();
  xhr.timeout = 2000;

  xhr.onload = function() {
    content = this.responseText;
    setEditorContent(content);
  };
  xhr.ontimeout = function (e) {
    alert("Could not load XML file:", e);
  };
}

function changeFontSize(value) {
  $('.CodeMirror').css('font-size', value);
  if (storageAvailable('localStorage')) {
    localStorage.setItem('font_size', value);
  }
}

function editorFocusToggle() { 
  if (editor.hasFocus()) {
    document.activeElement.blur();
  } else {
    editor.focus();
  }
}

function editorInitializers() {
  restoreLocalSettings(); // from editor_views.js
  _last_view = 'changed';
  applyViewMode();
  initializeLocalStorage(); // from editor_local_storage.js
  resetEditorHeight();
}

function setEditorContent(content) {
  editor.setValue(content);
  editorInitializers();
}

$(document).ready(function() {
  document.getElementById('toggle-autovalidate').addEventListener('click', toggleAutovalidate);

  document.getElementById('insert-comment').addEventListener('click', insertCommentPrompt);
  document.getElementById('load-example-1').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/rad20180612T234422.xml');});
  document.getElementById('load-example-2').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/rad20180613T003335.xml');});
  document.getElementById('load-example-3').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/rad20180718T150651.xml');});
  document.getElementById('load-example-dag014').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/dag014.xml');});
  document.getElementById('load-example-fja012').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/fja012.xml');});
  document.getElementById('load-example-fun023').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/fun023.xml');});
  document.getElementById('load-example-inn029').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/inn029.xml');});
  document.getElementById('load-example-les025').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/les025.xml');});
  document.getElementById('load-example-lid20171215T103413').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/lid20171215T103413.xml');});
  document.getElementById('load-example-lid20181009T230112').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/lid20181009T230112.xml');});
  document.getElementById('load-example-utb20171215T201027').addEventListener('click', function() { loadXMLtoEditor('resources/example_xml/utb20171215T201027.xml');});
});

$(window).load(function() {
  console.debug('onload');
  //verify speechId is a query parameter at the end of the URL
  if (window.location.href.indexOf("speechId=") > -1) {
    var speechId = (window.location.href.match(/speechId=([^&]+)/))[1];
    if (speechId) {
      // XXX: Please edit me!
      loadXMLtoEditor('http://asr-server.althingi.is/~lirfa/Lirfa/api/retrieveTranscript/?speechID='+ speechId);
    }
  }
});
