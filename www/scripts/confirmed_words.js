function newWordsInitialize() {
    $( function() {
        $("#date_from").datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", new Date());
        $("#date_to").datepicker({dateFormat: 'yy-mm-dd'}).datepicker("setDate", "+1");
    } );


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

function addNewWord(word_obj) {
    let tr = document.createElement("tr");
    let td_word = document.createElement("td");
    let td_phoneme = document.createElement("td");

    let btn_word = document.createElement("button");
    let btn_phoneme = document.createElement("button");

    td_word.setAttribute("id", "word-"+word_obj.word);

    btn_word.setAttribute("class", "edit-button");
    btn_phoneme.setAttribute("class", "edit-button");

    btn_word.appendChild(document.createTextNode(word_obj.word));
    btn_phoneme.appendChild(document.createTextNode(word_obj.pronunciation));

    td_word.appendChild(btn_word);
    td_phoneme.appendChild(btn_phoneme);


    tr.appendChild(td_word);
    tr.appendChild(td_phoneme);

    td_word.setAttribute("class", "word-col");
    td_phoneme.setAttribute("class", "phoneme-col");

    let target = document.getElementById("new-word-table");
    target.appendChild(tr);
}

function fetchWordsSpeechId(speech_id) {
    let path = "http://asr-server.althingi.is/~lirfa/Lirfa/api/newWords/?speechID=" + speech_id;
    fetchWords(path);
}

function fetchWordsDates(start_date, end_date) {
    let path = "http://asr-server.althingi.is/~lirfa/Lirfa/api/confirmWords/?startDate=" + start_date + "&pronunciation=1&json=4";
    fetchWords(path);
}

function fetchWords(path) {
    // clear the list first....
    $("#new-word-table").find("tr:not(:first)").remove();

    console.log("fetching words from " + path);
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
	if (this.readyState == 4) {
            if (this.status == 200) {
		let myObj = JSON.parse(this.responseText);
		initializeNewWords(myObj);
            } else {
		alert("Villa kom upp við að hlaða inn orðum");
            }
	}
    }
    xmlhttp.open("GET", path, true);
    xmlhttp.send();
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
