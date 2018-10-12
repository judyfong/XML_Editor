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
    var tags = {

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
    $(document).ready(editor_initializers);
}

function loadXMLtoEditor(xml_path) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', xml_path, true);
    xhr.send();
    xhr.timeout = 2000;

    xhr.onload = function() {
        content = this.responseText;
        //console.log("Got content:", content);
        editor.setValue(content);
    };
    xhr.ontimeout = function (e) {
        alert("Could not load XML file:", e);
    };
}

/*
$(document).ready(function() {
    document.getElementById("validate3").addEventListener('click', validateXML_W3);
});
*/
 
// Validation code taken from W3schools on XML validation
var xt="",h3OK=1
function checkErrorXML(x) {
    xt=""
    h3OK=1
    checkXML(x)
}

function checkXML(n) {
    var l,i,nam
    nam=n.nodeName
    if (nam=="h3") {
        if (h3OK==0) {
            return;
        }
        h3OK=0
    }
    if (nam=="#text") {
        xt=xt + n.nodeValue + "\n"
    }
    l=n.childNodes.length
    for (i=0;i<l;i++) {
        checkXML(n.childNodes[i])
    }
}

function validateXML_W3() {
    // code for IE
    if (window.ActiveXObject) {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async=false;
        xmlDoc.loadXML(editor.getValue());
        if(xmlDoc.parseError.errorCode!=0) {
            txt="Error Code: " + xmlDoc.parseError.errorCode + "\n";
            txt=txt+"Error Reason: " + xmlDoc.parseError.reason;
            txt=txt+"Error Line: " + xmlDoc.parseError.line;
            alert(txt);
        } else {
            //console.log("for some reason we already validated, and there were no errors!");
            return "OK";
        }
    // code for Mozilla, Firefox, Opera, etc.
    } else if (document.implementation.createDocument) {
        try {
            var text=editor.getValue();
            var parser=new DOMParser();
            var xmlDoc=parser.parseFromString(text,"application/xml");
        } catch(err) {
            console.log("err:", err.message);
            alert(err.message);
            return "Exception: " + err.message;
        }

        if (xmlDoc.getElementsByTagName("parsererror").length>0) {
            checkErrorXML(xmlDoc.getElementsByTagName("parsererror")[0]);
            console.log(xt)
            return xt;
        } else {
            //console.log("for some reason we already validated, and there were no errors!");
            return "OK";
        }
    } else {
        alert('Your browser cannot handle XML validation');
    }
    return false;
}

function autovalidator() {
    function validate_success() {
        $("#validation_status").text("OK");
        $("#validation_status").css('color', 'green');
        $("#validation_error").css('display', 'none');
    }

    function validate_failure(result) {
        $("#validation_status").text("Validation failed!");
        $("#validation_status").css('color', 'red');
        $("#validation_error").css('display', 'block');
        $("#validation_message").text(result);
    }

    result = validateXML_W3();
    //console.log("validation returned", result);
    if (result == "OK") {
        validate_success();
    } else {
        console.log(result, "is not", "OK");
        validate_failure(result);
    }
}

// TODO: change font-size on everything
function change_font_size(value) {
    $('.CodeMirror pre').css('font-size', value);
}

function get_font_size() {
    var fz = $('.CodeMirror pre').css('font-size');
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

function toggle_display(id) {
    container = document.getElementById(id);
    style = window.getComputedStyle(container);
    display = style.getPropertyValue('display');
    if (display == 'none') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

function assign_tag_label(line_number, start, finish, className, options = { assisted: false }) {
    start_obj = { line: line_number, ch: start, }
    finish_obj = { line: line_number, ch: finish, }

    var collapse;

    var markTextOptions = {
        className: className,
        collapsed: false, //true,
        atomic: true,
        readOnly: true,
    }

    if (options.assisted) {
        // don't hide tags in assisted mode
        markTextOptions.collapsed = false;
    }

    if (options.stopLeft) {
        markTextOptions.inclusiveLeft = true;
    }

    if (options.stopRight) {
        markTextOptions.inclusiveRight = true;
    }

    editor.markText(start_obj, finish_obj, markTextOptions);
}

function mark_selection_custom_class(start_obj, finish_obj, className) {
    editor.markText(start_obj, finish_obj, {
            className: className,
        }
    );
}

function extract_tag_name(full_tag) {
    var tag_content_start = 1;
    if (full_tag[1] == '/') {
        tag_content_start = 2;
    }

    var tag_content_end = full_tag.length - 1;
    var first_space = full_tag.indexOf(' ')

    if (first_space != -1) {
        tag_content_end = first_space;
    }
    
    return full_tag.substring(tag_content_start, tag_content_end);
}

function parse_tags() {
    // tag arrays for opening tags and closing tags, respectively
    var tags = []
    // Just find tags when they start, then parse until you find a matching closer
    // we want to create a tag object which looks like { line, start_index, tag_label }

    function tag_finder(lineHandle) {

        function find_full_tag(text, start_index) {
            // start_index points to a '<' and we will stop at the first '>'
            var content = text.substr(start_index);
            var stop_index = content.indexOf('>') + 1;
            return content.substr(0, stop_index);
        }

        var tag_object;

        var content = lineHandle.text;

        for (var i=0; i < content.length; ++i) {
            var letter = content[i];
            
            if (letter == '<' && content.length > i+1) {
                // We found a tag!
                var full_tag = find_full_tag(content, i);
                // what kind of tag is it?
                var tag_type = extract_tag_name(full_tag);

                // figure out what to do with it
                var tag_is_open = true;
                if (full_tag[1] == '/') {
                    // this is a closing tag
                    tag_is_open = false;
                }
                // create the tag object
                tag_object = { 
                    line: editor.getLineNumber(lineHandle), 
                    start_index: i,
                    end_index: i+full_tag.length,
                    tag_label: tag_type,
                    tag_is_open: tag_is_open,
                }
                tags.push(tag_object);
            }
        }
    }

    function find_closing_tag(index, opening_tag) {
        // 1. N := count of how many tags of the same kind open after index in tags
        //
        // 2. find the Nth tag of that kind that closes

        var count = 0;

        for (var i = index + 1; i < tags.length; ++i) {
            var matching_tag = tags[i];
            if (matching_tag.tag_label == opening_tag.tag_label) {
                // we found a matching tag, do we increment/decrement count or return this tag?
                if (matching_tag.tag_is_open) {
                    // oops, need to increment count
                    count++;
                    continue;
                } else {
                    // this is a closing tag, check if count is zero
                    if (count == 0) {
                        return matching_tag;
                    }
                    // since we didn't return, decrement count
                    count--;
                }
            }
        }
    }
    
    // populate the tags array
    editor.eachLine(tag_finder);

    // array of tag_pair object: { tag_open: tag_object, tag_close: tag_object }
    var tag_pairs = []

    for (var i = 0 ; i < tags.length - 1; ++i) { 
        var tag_object = tags[i];
        if (!tag_object.tag_is_open) {
            // we don't care about 'closing' tags, because we are... closing... tags...
            // in other words, we only want to close 'opening' tags
            continue;
        }
        var closer = find_closing_tag(i, tag_object);
        if (!closer) {
            //console.log("Couldn't find a closing tag for", tag_object.tag_label, "on line", tag_object.line);
        }
        tag_pair_object = { tag_open: tag_object, tag_close: closer }
        // unoptimized for refactorability
        tag_pairs.push(tag_pair_object)
    }

    return tag_pairs
}

function mark_tag(tag, options) {
    var className;
    if (typeof options.className != 'undefined') {
        // allow className overriding
        className = options.className;
    } else if (tag.tag_is_open) {
        className = 'close_tag';
    } else {
        className = 'open_tag';
    }

    console.log("marked tag", tag, "with class", className);
    console.log("options were:", options);

    assign_tag_label(tag.line, tag.start_index, tag.end_index, className, options);
}

function apply_normal_mode() {
    var tag_pairs = parse_tags();  
      
    // mark_selection_custom_class on content_start, content_end
    // content_start and content_end should be an object like { line: ln, ch: i }
    for (var i = 0; i < tag_pairs.length; ++i) {
        var tag_open = tag_pairs[i].tag_open;
        var tag_close = tag_pairs[i].tag_close;
        if (!tag_close) {
            // We have some kind of meta tag, just hide it!
            mark_tag(tag_open, { className: "" } );
            continue;
        }
        mark_tag(tag_open,  { stopLeft:  true , className: "" } );
        mark_tag(tag_close, { stopRight: true , className: "" } );
    }
    editor.setOption("lineNumbers", false);
}

function apply_assisted_mode() {
    var tag_pairs = parse_tags();  
      
    // mark_selection_custom_class on content_start, content_end
    // content_start and content_end should be an object like { line: ln, ch: i }
    for (var i = 0; i < tag_pairs.length; ++i) {
        var tag_open = tag_pairs[i].tag_open;
        var tag_close = tag_pairs[i].tag_close;
        mark_tag(tag_open, { assisted: true, stopLeft: true });
        if (tag_close) {
            mark_tag(tag_close, { assisted: true, stopRight: true });
        }
    }
    editor.setOption("lineNumbers", true);
}

function remove_tag_labels() {
    editor.getAllMarks().forEach(function(mark) {
        last_mark = mark;
        mark.clear();
    });
}

function addDebugInfo() {
    cursor_loc = editor.getCursor();
    
    addDebugContent("<span class='debug_line'>Cursor: " + cursor_loc.line + " " + cursor_loc.ch + "</span>");
}

function addDebugContent(content) {
    // append the content
    div = document.getElementById('debug_container');

    div.innerHTML += "<p>" + content + "</p>";

    // scroll to bottom
    div.scrollTop = div.scrollHeight;
}

// TODO: rename to "safe mode", and bang it.
var _current_view = 'assisted';

function cycle_current_view() {
    var views = ['raw', 'assisted', 'normal', 'debug'];
    var new_index = (views.indexOf(_current_view) + 1) % views.length;

    _current_view = views[new_index];
}

function cycleViewMode() {
    if (_current_view == 'debug') {
        toggle_display('debug_container');
    }
    cycle_current_view();
    if (_current_view == 'debug') {
        toggle_display('debug_container');
    }
    applyViewMode();
}

function get_closing_tags_from_pairs(tag_pairs) {
    var closers = [];

    for (i=0; i < tag_pairs.length; ++i) {
        tag = tag_pairs[i].tag_close;
        if (tag) {
            closers.push(tag);
        }
    }

    return closers.sort(function(a,b) {
        if (a.line == b.line) {
            return a.start_index - b.start_index;
        }
        return a.line - b.line;
    });

}

function format_tags_on_own_lines() {
    function put_tag_on_line(tag) {
        // don't put special tags on lines
        switch (tag.tag_label) {
            case 'bjalla/':
                return;
            default:
                /* intentionally blank */
        }

        var tag_line = editor.getLine(tag.line);

        // check if there is content *after* the tag
        if (tag_line.length > tag.end_index) {
            // there is content after the tag
            var from = { line: tag.line, ch: tag.end_index };
            editor.replaceRange('\n', from);
        }
        
        // check if there is content *before* the tag
        var trimmed_line = tag_line.trimStart();
        var delta = tag_line.length - trimmed_line.length;
        if (tag.start_index - delta > 0) {
            from = { line: tag.line, ch: tag.start_index };
            editor.replaceRange('\n', from);
        }
    }
      
    var tag_pairs;  

    // iterate backwards to prevent propagation errors

    // do opening tags
    tag_pairs = parse_tags();  
    for (var i = tag_pairs.length-1 ; i >= 0; --i) {
        put_tag_on_line(tag_pairs[i].tag_open);
    }
    
    // then backwards iterate over SORTED closing tags
    var closing_tags = get_closing_tags_from_pairs(parse_tags());

    for (var i = closing_tags.length - 1; i >= 0; --i) {
        var tag_close = closing_tags[i];
        if (!tag_close) {
            continue;
        }
        put_tag_on_line(tag_close);
    }
}

function distribute_tags_to_lines() {
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    var content = editor.getValue();
    
    var tag_regexp = /([^\n\s])(<[^>]*[^\/]>)/g
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

function format_default() {
    // fix lines
    format_tags_on_own_lines();

    // fix indentation
    for (var i = 0; i < editor.lineCount(); ++i) {
        editor.indentLine(i);
    }
}

function applyViewMode() {
    document.getElementById('editor-mode').innerHTML = _current_view + " mode";
    // remove all marks
//    format_default();
    remove_tag_labels();
    switch (_current_view) {
        case 'raw':
        case 'debug':
            editor.setOption("lineNumbers", true);
            break;
        case 'normal':
            distribute_tags_to_lines();
            apply_normal_mode();
            break;
        case 'assisted':
            apply_assisted_mode();
            break;
    }

    set_view_theme(_current_view);
}

function set_view_theme(chosen_theme) {
	var sheets = document.getElementsByClassName('view-stylesheet');
	for (var i = 0; i < sheets.length; i++) {
        sheets[i].rel = 'alternate stylesheet';
	}

    var full_theme_name = 'view-'+chosen_theme+'-stylesheet';

    var theme_link = document.getElementById(full_theme_name);
    if (theme_link) {
        theme_link.rel = 'stylesheet';
    }
}

function editor_initializers() {
    applyViewMode();
    console.log("WARNING: TODO: We should make sure that clicking on collapsed thing goes 'inside' whatever tag instead of outside it");
}

$(document).ready(function() {
    document.getElementById('cycle_view').addEventListener('click', cycleViewMode);
    document.getElementById('inc_font').addEventListener('click', inc_font_size);
    document.getElementById('dec_font').addEventListener('click', dec_font_size);
    document.getElementById('def_font').addEventListener('click', function() {change_font_size('inherit');});

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

});

