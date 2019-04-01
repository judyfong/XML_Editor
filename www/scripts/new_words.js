var _in_edit_modal = false;

function newWordsInitialize() {
    $( function() {
        $("#date_from").datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", "-3");
        $("#date_to").datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", "+1");
    } );

    let get_speech_words_btn = document.getElementById("search-speech-button");
    get_speech_words_btn.onclick = function(click_evt) {
        let speech_id = document.getElementById("speech-id").value;
        fetchWordsSpeechId(speech_id);
    }

    let search_btn = document.getElementById("search-dates-button");
    search_btn.onclick = function(click_evt) {
        let start = document.getElementById("date_from").value;
        let end = document.getElementById("date_to").value;

        //    start = start.replace(/\//g, '-');
        //    end = end.replace(/\//g, '-');

        if (!start || !end) {
            alert("Dagsetningu vantar!");
            return;
        }

        fetchWordsDates(start, end);
    }
}

function getFakeNewWordlist() {
    obj1 = {
        "word": "fræðafólks",
        "phoneme": "f r aiː ð a f ou l̥ k s",
        "context": "unninn í ákveðnu samráði milli fræðafólks fatlaðs fólks og stjórnvalda þannig"
    };
    obj2 = {
        "word": "kerfiskalla",
        "phoneme": "cʰ ɛ r v ɪ s kʰ a t l a",
        "context": "við eigum ekki að láta kerfiskalla ráða því hvaða leið við"
    };
    obj3 = {
        "word": "Þýðingamiðstöðinni",
        "phoneme": "θ iː ð i ŋ k a m ɪ ð s t œ ð ɪ n ɪ",
        "context": "að það hafi verið hjá Þýðingamiðstöðinni sem gerðar voru ákveðnar breytingar"
    };
    return [obj1, obj2, obj3];
}

function insertElementAtCursor(symbol, ignore="") {
    let element = document.getElementById("edit-input-field");
    let start = element.selectionStart;
    let end = element.selectionEnd;
    let value = element.value;
    let before = value.substring(0, start);
    let after = value.substring(end, value.length);
    element.value = (before + symbol + after);
    element.selectionStart = element.selectionEnd = start + symbol.length;
    element.focus();
}

function createEditDialog(evt) {
    let current_text = evt.target.innerHTML;

    // check which parent we have to decide which symbol selector to show
    let target = evt.target;
    let parent_class = target.parentNode.getAttribute("class");

    switch (parent_class) {
        case 'word-col':
            createSpecialCharacterInserter("symbol-inserter-container");
            break;
        case 'phoneme-col':
            createPhonemeInserter("phoneme-inserter-container");
            break;
    }

    let save_handler = function (save_evt) {
        let replacement = document.getElementById("edit-input-field").value;
        target.innerText = replacement;
        closeWordEditModal(save_evt);
        let original = document.getElementById("edit-modal-original");
        original.innerText = replacement;
    };

    let content = document.getElementById("edit-modal-content");

    let heading = document.createElement("h2");
    let current_span = document.createElement("span");
    current_span.setAttribute("id", "edit-modal-original");
    current_span.appendChild(document.createTextNode(current_text));
    heading.appendChild(document.createTextNode("Breyting: "));
    heading.appendChild(current_span);

    let container = document.createElement("div");

    let input = document.createElement("input");
    input.setAttribute("id", "edit-input-field");
    input.setAttribute("class", "edit-input");
    input.setAttribute("type", "text");
    input.setAttribute("value", current_text);

    let save_btn = document.createElement("button");
    save_btn.setAttribute("id", "edit-modal-save");
    save_btn.setAttribute("class", "save-button");
    save_btn.appendChild(document.createTextNode("Breyta"));

    save_btn.addEventListener('click', save_handler);

    container.appendChild(input);
    container.appendChild(save_btn);

    content.appendChild(heading);
    content.appendChild(container);

    showWordEditModalOverlay(save_handler);
}

function addNewWord(word_obj) {
    let tr = document.createElement("tr");
    let td_word = document.createElement("td");
    let td_phoneme = document.createElement("td");
    let td_context = document.createElement("td");
    let td_submit = document.createElement("td");

    let btn_word = document.createElement("button");
    let btn_phoneme = document.createElement("button");

    td_word.setAttribute("id", "word-"+word_obj.word);

    btn_word.setAttribute("class", "edit-button");
    btn_phoneme.setAttribute("class", "edit-button");

    btn_word.appendChild(document.createTextNode(word_obj.word));
    btn_phoneme.appendChild(document.createTextNode(word_obj.pronunciation));

    btn_word.addEventListener("click", createEditDialog);
    btn_phoneme.addEventListener("click", createEditDialog);

    td_word.appendChild(btn_word);
    td_phoneme.appendChild(btn_phoneme);
    td_context.appendChild(document.createTextNode(word_obj.context));

    submit_btn = document.createElement("button");
    submit_btn.setAttribute("class", "save-button");
    submit_btn.appendChild(document.createTextNode("Vista"));
    td_submit.appendChild(submit_btn);
    //
    submit_btn.addEventListener("click", function() {
        // TODO: double check submit functionality
        saveWord(td_word.id, td_word.innerText, td_phoneme.innerText);
        // remove the row
        tr.parentNode.removeChild(tr);
    });

    delete_btn = document.createElement("button");
    delete_btn.setAttribute("class", "delete-button");
    delete_btn.appendChild(document.createTextNode("Eyða"));
    td_submit.appendChild(delete_btn);
    //
    delete_btn.addEventListener("click", function() {
        // TODO: double check delete functionality
        deleteWord(td_word.id);
        // remove the row
        tr.parentNode.removeChild(tr);
    });

    tr.appendChild(td_word);
    tr.appendChild(td_phoneme);
    tr.appendChild(td_context);
    tr.appendChild(td_submit);

    td_word.setAttribute("class", "word-col");
    td_phoneme.setAttribute("class", "phoneme-col");
    td_context.setAttribute("class", "context-col");

    let target = document.getElementById("new-word-table");
    target.appendChild(tr);
}

function fetchWordsSpeechId(speech_id) {
    let path = "http://asr-server.althingi.is/~lirfa/Lirfa/api/newWords/?speechID=" + speech_id;
    fetchWords(path);
}

function fetchWordsDates(start_date, end_date) {
    let path = "http://asr-server.althingi.is/~lirfa/Lirfa/api/newWords/?startDate=" + start_date + "&endDate=" + end_date;
    fetchWords(path);
}

function fetchWords(path) {
    // clear the list first....
    $("#new-word-table").find("tr:not(:first)").remove();

    console.log("fetching words from " + path);
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let myObj = JSON.parse(this.responseText);
            initializeNewWords(myObj);
        } else {
            alert("Villa kom upp við að hlaða inn orðum");
        }
    }
    xmlhttp.open("GET", path, true);
    xmlhttp.send();
}


function deleteWord(originalWord) {
    let path = "http://asr-server.althingi.is/~lirfa/Lirfa/api/confirmWords/";
    let postdata = {"word": [
        { "originalWord": originalWord.replace('word-', ''), "delete": true }
    ] };
    console.log("deleting word " + postdata);
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let myObj = JSON.parse(this.responseText);
            console.log("DELETED WORD RESPONSE:");
            console.log(myObj);
            console.log("TODO: Something with it, notify the user");
        }
    }
    xmlhttp.open("POST", path, true);
    xmlhttp.send(JSON.stringify(postdata));
}

function saveWord(originalWord, confirmedWord, pronunciation) {
    let path = "http://asr-server.althingi.is/~lirfa/Lirfa/api/confirmWords/";
    let postdata = {"word": [
        { "originalWord": originalWord.replace('word-', ''), "confirmedWord": confirmedWord, "pronunciation": pronunciation }
    ] };
    console.log("saving word:", postdata);
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let myObj = JSON.parse(this.responseText);
            console.log("SAVED WORD RESPONSE:");
            console.log(myObj);
            console.log("TODO: Something with it, notify the user");
        }
    }
    xmlhttp.open("POST", path, true);
    xmlhttp.send(JSON.stringify(postdata));
}

function initializeNewWords(new_word_list) {
    if (new_word_list.length > 0) {
        for (let i = 0 ; i < new_word_list.length; ++i) {
            addNewWord(new_word_list[i]);
        }
    } else {
        alert("Engin orð voru fundin við leitarskilyrðin.");
    }
}

function closeWordEditModal(evt) {
    // this ugly hack ensures that the modal can be closed ONLY by:
    // - clicking outside of the content
    // - clicking the close button
    // - escape button
    // - (deleting the elements in the DOM, but that's OK)
    if (!evt.key || evt.key != 'Escape') {
        let target = evt.target;
        if (!target) { return; }
        let id = target.id;
        switch (id) {
            case 'edit-modal':
            case 'modal-close':
            case 'edit-modal-save':
                break
            default:
                return;
        }
    }
    // make sure the user wants to close it!
    let original = document.getElementById("edit-modal-original").innerText;
    let changed = document.getElementById("edit-input-field").value;
    if (original != changed) {
        if (!confirm("Loka án þess að vista breytingu?", "Já", "Nei")) {
            return;
        }
    }

    let modal = document.getElementById('edit-modal');
    modal.classList.add("closed");
    node = document.getElementById('edit-modal-content');
    let child = node.firstChild;
    while (child) {
        node.removeChild(child);
        child = node.firstChild;
    }
    node = document.getElementById("symbol-inserter-container");
    child = node.firstChild;
    while (child) {
        node.removeChild(child);
        child = node.firstChild;
    }
    _in_edit_modal = false;
}

function showWordEditModalOverlay(save_handler) {
    _in_edit_modal = true;
    let modal = document.getElementById('edit-modal');

    modal.classList.remove("closed");

    let close_btn = document.getElementById("modal-close");
    close_btn.onclick = closeWordEditModal;
    modal.onclick = closeWordEditModal;
    key_handler = createModalKeyListener(save_handler);
    document.addEventListener('keypress', key_handler);
    input = document.getElementById('edit-input-field');
    // Move focus to the input field
    input.focus();
    // hack to move the cursor to the end
    let val = input.value;
    input.value = '';
    input.value = val;
}

function createModalKeyListener(save_handler) {
    return function (evt) {
        if (!_in_edit_modal) {
            return;
        }
        switch(evt.key) {
            case 'Escape':
                closeWordEditModal(evt);
                break
            case 'Enter':
                save_handler(evt);
                break;
        }
    }
}
