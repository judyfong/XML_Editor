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
//  editor.setOption('viewportMargin', Infinity);
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
  /*
  schema_tags = {

    "!top": ["top"],
    "!attrs": {
      id: null,
      class: []
    },
    top: {
      attrs: {
      },
      children: ["r\u00e6\u00f0a", "sp\u00f3luskjal"]
    },
    bjalla: {
      attrs: [],
      children: []
    },
    forseti: {
      attrs: [
        "j\u00f6fnun",
        "skst"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    atbur\u00f0ur: {
      attrs: [
        "j\u00f6fnun"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    truflun: {
      attrs: [
        "j\u00f6fnun"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    tilvitnun: {
      attrs: [
        "j\u00f6fnun",
        "skst"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    framm\u00edkall: {
      attrs: [
        "j\u00f6fnun",
        "skst"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    tilv\u00edsun: {
      attrs: [
        "\u00feskj",
        "m\u00e1l",
        "grein",
        "emb\u00e6tti",
        "spurning",
        "nmgr",
        "skst",
        "lg\u00fe"
      ],
      children: []
    },
    brot: {
      attrs: [
        "teljari",
        "nefnari"
      ],
      children: []
    },
    v\u00edsa: {
      attrs: [],
      children: [
        "l\u00edna",
        "erindi",
        "h\u00f6fundur",
        "heiti"
      ]
    },
    feitletra\u00f0: {
      attrs: [
        "j\u00f6fnun"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    sk\u00e1letra\u00f0: {
      attrs: [
        "j\u00f6fnun"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    undirstrika\u00f0: {
      attrs: [
        "j\u00f6fnun"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    ni\u00f0urskrift: {
      attrs: [
        "j\u00f6fnun"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    uppskrift: {
      attrs: [
        "j\u00f6fnun"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    l\u00ednubil: {
      attrs: [],
      children: []
    },
    titill: {
      attrs: [],
      children: []
    },
    l\u00fdsing: {
      attrs: [],
      children: []
    },
    \u00fatgefandi: {
      attrs: [],
      children: []
    },
    sta\u00f0ur: {
      attrs: [],
      children: []
    },
    url: {
      attrs: [],
      children: []
    },
    \u00e1rtal: {
      attrs: [],
      children: []
    },
    rit: {
      attrs: [
        "einkenni"
      ],
      children: [
        "titill",
        "\u00e1rtal",
        "l\u00fdsing",
        "\u00fatgefandi",
        "url",
        "sta\u00f0ur"
      ]
    },
    heiti: {
      attrs: [],
      children: []
    },
    h\u00f6fundur: {
      attrs: [
        "nefndarhluti",
        "nefnd",
        "skst",
        "emb\u00e6tti"
      ],
      children: []
    },
    erindi: {
      attrs: [],
      children: [
        "l\u00edna"
      ]
    },
    l\u00edna: {
      attrs: [],
      children: []
    },
    ums\u00fdsla: {
      attrs: [
        "fundur",
        "t\u00edmi",
        "dags",
        "\u00feskj",
        "lg\u00fe"
      ],
      children: [
        "breytingar",
        "m\u00e1l",
        "gildistaka",
        "l\u00f6g",
        "lesari",
        "ritari",
        "framkv\u00e6md"
      ]
    },
    r\u00e6\u00f0utexti: {
      attrs: [
        "id",
        null,
        "part"
      ],
      children: [
        "mgr",
        "l\u00ednubil"
      ]
    },
    mgr: {
      attrs: [
        "j\u00f6fnun"
      ],
      children: [
        "undirstrika\u00f0",
        "uppskrift",
        "l\u00ednubil",
        "truflun",
        "atbur\u00f0ur",
        "framm\u00edkall",
        "forseti",
        "brot",
        "v\u00edsa",
        "ni\u00f0urskrift",
        "tilv\u00edsun",
        "tilvitnun",
        "bjalla",
        "sk\u00e1letra\u00f0",
        "feitletra\u00f0"
      ]
    },
    atri\u00f0i: {
      attrs: [
        "n\u00famer"
      ],
      children: []
    },
    sk\u00fdringartexti: {
      attrs: [],
      children: []
    },
    base64: {
      attrs: [],
      children: []
    },
    t\u00f6fluheiti: {
      attrs: [],
      children: []
    },
    r\u00f6\u00f0: {
      attrs: [],
      children: [
        "reitur"
      ]
    },
    mynd: {
      attrs: [
        "j\u00f6fnun",
        "tegund",
        "uri",
        "h\u00e6\u00f0",
        "breidd",
        "id",
        "nr",
        "skiptiTexti"
      ],
      children: [
        "sk\u00fdringartexti",
        "base64"
      ]
    },
    reitur: {
      attrs: [
        "d\u00e1lkar"
      ],
      children: []
    },
    flm: {
      attrs: [
        "nefndarhluti",
        "nefnd",
        "skst",
        "emb\u00e6tti"
      ],
      children: []
    },
    tegflm: {
      attrs: [],
      children: []
    },
    m\u00e1lsheiti: {
      attrs: [],
      children: []
    },
    haus: {
      attrs: [],
      children: []
    },
    m\u00e1lshefjandi: {
      attrs: [
        "skst",
        "emb\u00e6tti"
      ],
      children: []
    },
    undirtitill: {
      attrs: [],
      children: []
    },
    \u00feskj: {
      attrs: [
        "\u00feegarsam\u00feykkt",
        "nr",
        "tegund",
        "samanber"
      ],
      children: []
    },
    lagatilv\u00edsun: {
      attrs: [
        "mgr",
        "dags",
        "\u00e1r",
        "ml",
        "nr",
        "grein"
      ],
      children: []
    },
    m\u00e1l: {
      attrs: [
        "m\u00e1lsflokkur",
        "umr",
        "frhatgr",
        "m\u00e1lstegund",
        "nr",
        "frumskjal"
      ],
      children: [
        "\u00feskj",
        "m\u00e1lshefjandi",
        "tegflm",
        "haus",
        "undirtitill",
        "flm",
        "m\u00e1lsheiti"
      ]
    },
    l\u00f6g: {
      attrs: [
        "nr",
        "dags"
      ],
      children: []
    },
    ritari: {
      attrs: [
        "nefndarhluti",
        "nefnd",
        "skst",
        "emb\u00e6tti"
      ],
      children: []
    },
    lesari: {
      attrs: [
        "nefndarhluti",
        "nefnd",
        "skst",
        "emb\u00e6tti"
      ],
      children: []
    },
    gildistaka: {
      attrs: [
        "dags"
      ],
      children: []
    },
    framkv\u00e6md: {
      attrs: [
        "dags"
      ],
      children: []
    },
    breytingar: {
      attrs: [],
      children: [
        "lagatilv\u00edsun"
      ]
    },
    fyrirs\u00f6gn: {
      attrs: [
        "d\u00e1lkar",
        "nr",
        "j\u00f6fnun"
      ],
      children: []
    },
    listi: {
      attrs: [
        "tegund"
      ],
      children: [
        "atri\u00f0i"
      ]
    },
    tafla: {
      attrs: [
        "id",
        "nr"
      ],
      children: [
        "t\u00f6fluheiti",
        "r\u00f6\u00f0",
        "sk\u00fdringartexti",
        "mynd"
      ]
    },
    regluger\u00f0artilv\u00edsun: {
      attrs: [
        "mgr",
        "dags",
        "\u00e1r",
        "ml",
        "nr",
        "grein"
      ],
      children: []
    },
    sp\u00f3luskjal: {
      attrs: [
        "id",
        null
      ],
      children: [
        "r\u00e6\u00f0u\u00d3loki\u00f0",
        "atbur\u00f0ur",
        "ritaskr\u00e1",
        "framhaldR\u00e6\u00f0u",
        "r\u00e6\u00f0a",
        "ums\u00fdsla"
      ]
    },
    framhaldR\u00e6\u00f0u: {
      attrs: [],
      children: []
    },
    r\u00e6\u00f0a: {
      attrs: [
        "frhr",
        "tegflm",
        "olok",
        "emb\u00e6tti",
        null,
        "nefnd",
        "skst",
        "id",
        "tegr",
        "r\u00e6\u00f0ub\u00fatur"
      ],
      children: [
        "ums\u00fdsla",
        "r\u00e6\u00f0utexti"
      ]
    },
    r\u00e6\u00f0u\u00d3loki\u00f0: {
      attrs: [],
      children: []
    },
    ritaskr\u00e1: {
      attrs: [],
      children: [
        "rit"
      ]
    }
  }
  */

  editor = CodeMirror(document.getElementById("editor-container"));

  editor.setValue(example_xml);
  setEditorOptions(editor);

  editor.on('beforeChange', fixInsertQuotes);
  editor.on('changes', autovalidator);
/*  editor.on('focus', autovalidator);*/
  editor.on('focus', applyViewMode);
  editor.on('cursorActivity', function() {
    // insert element
    editor.populateElementInserter({completeSingle: false})
    // tree explorer
    populateTreeExplorer();
    // attribute explorer
    populateAttributeInspector();
  });
  $(document).ready(editorInitializers);

  $(document).ready( function() {
    createSpellChecker(editor);
  });
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

