var editor;

function set_editor_options(editor) {
  function completeAfter(cm, pred) {
    var cur = cm.getCursor();
    if (!pred || pred()) setTimeout(function() {
      if (!cm.state.completionActive)
        cm.showHint({completeSingle: false});
    }, 100);
    return CodeMirror.Pass;
  }

  function completeIfAfterLt(cm) {
    return completeAfter(cm, function() {
      var cur = cm.getCursor();
      return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
    });
  }

  function completeIfInTag(cm) {
    return completeAfter(cm, function() {
      var tok = cm.getTokenAt(cm.getCursor());
      if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
        var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
        return inner.tagName;
      });
  }

  editor.setOption('mode', 'xml_tagged');
  editor.setOption('tabindex', -1);
  editor.setOption('lineWrapping', true);
  editor.setOption('lineNumbers', true);
  editor.setOption('viewportMargin', Infinity);
  editor.setOption('extraKeys', 
    {
      "'<'": completeAfter,
      "'/'": completeIfAfterLt,
      "' '": completeIfInTag,
      "'='": completeIfInTag,
      "Ctrl-Space": "autocomplete"
    }
  );
  var callback = function(obj) {
    editor.setOption('hintOptions', { schemaInfo: obj });
    schema_tags = obj;
  };

  read_tags('resources/tags.json', callback);
}

function read_tags(path, callback) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var myObj = JSON.parse(this.responseText);
      callback(myObj);
    }
  };
  xmlhttp.open("GET", path, true);
  xmlhttp.send();    
}

var schema_tags;

function start() {
  var example_xml=`
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

  editor = CodeMirror(document.getElementById("editor_container"));

  editor.setValue(example_xml);
  set_editor_options(editor);

  //    editor.on('cursorActivity', applyViewMode);
  editor.on('cursorActivity', addDebugInfo);
  editor.on('changes', autovalidator);
  editor.on('focus', autovalidator);
  editor.on('focus', applyViewMode);
  editor.on('cursorActivity', function() {
    // insert element
    editor.populateElementInserter({completeSingle: false})
    // tree explorer
    populate_tree_explorer();
    // attribute explorer
    populate_attribute_inspector();
  });
  $(document).ready(editor_initializers);

/*	typoLoaded.then(typo => startSpellCheck(editor, typo));*/
  $(document).ready( function() {
/*    typoLoaded.then(typo => createSpellChecker(editor, typo));*/
    createSpellChecker(editor);
  });
}

function loadXMLtoEditor(xml_path) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', xml_path, true);
  xhr.send();
  xhr.timeout = 2000;

  xhr.onload = function() {
    content = this.responseText;
    set_editor_content(content);
  };
  xhr.ontimeout = function (e) {
    alert("Could not load XML file:", e);
  };
}

// TODO: change font-size on everything
function change_font_size(value) {
  $('.CodeMirror').css('font-size', value);
}

function get_font_size() {
  var fz = $('.CodeMirror').css('font-size');
  var got_int = parseInt(fz);
  if (isNaN(got_int)) { return 13; }
  return got_int;
}

function inc_font_size() {
  new_size = get_font_size() + 2;
  change_font_size(new_size);
}

function dec_font_size() {
  new_size = get_font_size() - 2;
  change_font_size(new_size);
}

function get_display(container) {
  style = window.getComputedStyle(container);
  display = style.getPropertyValue('display');
  return display
}

function toggle_display(id) {
  container = document.getElementById(id);
  display = get_display(container);
  if (display == 'none') {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

function addDebugInfo() {
  /* intentionally left blank */
}

function addDebugContent(content) {
  // append the content
  div = document.getElementById('debug_container');

  div.innerHTML += "<p>" + content + "</p>";

  // scroll to bottom
  div.scrollTop = div.scrollHeight;
}

// TODO: Dead code, maybe delete it.
function distribute_tags_to_lines() {
  String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  };
  var content = editor.getValue();

  var tag_regexp = /([^\n\s])(<[^>]*[^\/]>)/g; // NOTE: This semicolon used to be missing, but it worked.
  var match = tag_regexp.exec(content);

  while (match != null) {
    replacement = match[1] + '\n' + match[2];
    content = content.replace(match[0], replacement);
    match = tag_regexp.exec(content);
  }

  editor.setValue(content);
  // fix indentation
  for (var i = 0; i < editor.lineCount(); ++i) {
    editor.indentLine(i);
  }
}

function toggle_autovalidate() {
  _validation_disabled = !_validation_disabled;
}

function editor_focus_toggle() { 
  if (editor.hasFocus()) {
    document.activeElement.blur();
  } else {
    editor.focus();
  }
}

function editor_initializers() {
  restoreLocalSettings(); // from editor_views.js
  _last_view = 'changed';
  applyViewMode();
}

function set_editor_content(content) {
  editor.setValue(content);
  editor_initializers();
}

$(document).ready(function() {
  document.getElementById('view_normal_mode').addEventListener('click', function() { set_view('normal'); });
  document.getElementById('view_assisted_mode').addEventListener('click', function() { set_view('assisted'); });
  document.getElementById('view_raw_mode').addEventListener('click', function() { set_view('raw'); });


  document.getElementById('hide_side_left').addEventListener('click', function() { toggle_display('side-container-left'); });
  document.getElementById('hide_side_right').addEventListener('click', function() { toggle_display('side-container-right'); });


  document.getElementById('toggle_symbol_inserter').addEventListener('click', toggle_symbol_inserter);
  document.getElementById('toggle_specialchars_inserter').addEventListener('click', toggle_specialchars_inserter);

  document.getElementById('toggle_tags').addEventListener('click', toggle_tags);
  document.getElementById('toggle_line_numbers').addEventListener('click', toggle_line_numbers);

  document.getElementById('toggle_autovalidate').addEventListener('click', toggle_autovalidate);


  document.getElementById('inc_font').addEventListener('click', inc_font_size);
  document.getElementById('dec_font').addEventListener('click', dec_font_size);
  document.getElementById('def_font').addEventListener('click', function() {change_font_size('inherit');});

  document.getElementById('insert_comment').addEventListener('click', insert_comment_prompt);

  document.getElementById('load_example_1').addEventListener('click', function() { loadXMLtoEditor('/example_xml/rad20180612T234422.xml');});
  document.getElementById('load_example_2').addEventListener('click', function() { loadXMLtoEditor('/example_xml/rad20180613T003335.xml');});
  document.getElementById('load_example_3').addEventListener('click', function() { loadXMLtoEditor('/example_xml/rad20180718T150651.xml');});
  document.getElementById('load_example_dag014').addEventListener('click', function() { loadXMLtoEditor('/example_xml/dag014.xml');});
  document.getElementById('load_example_fja012').addEventListener('click', function() { loadXMLtoEditor('/example_xml/fja012.xml');});
  document.getElementById('load_example_fun023').addEventListener('click', function() { loadXMLtoEditor('/example_xml/fun023.xml');});
  document.getElementById('load_example_inn029').addEventListener('click', function() { loadXMLtoEditor('/example_xml/inn029.xml');});
  document.getElementById('load_example_les025').addEventListener('click', function() { loadXMLtoEditor('/example_xml/les025.xml');});
  document.getElementById('load_example_lid20171215T103413').addEventListener('click', function() { loadXMLtoEditor('/example_xml/lid20171215T103413.xml');});
  document.getElementById('load_example_utb20171215T201027').addEventListener('click', function() { loadXMLtoEditor('/example_xml/utb20171215T201027.xml');});

  make_nice_containers_collapsible(); // from editor_additions.js
});

