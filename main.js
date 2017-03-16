var MyNoteApp = MyNoteApp || {};
MyNoteApp = function () {
    var sessionKey = "myNotes",
        dvNoteList = '#note-list',
        ulNotesId = 'ul#notes',
        ulLiNotesId = 'ul#notes li',
        dvNoteContentId = '#note-content',
        dvNoteDetailsId = '#note-details',
        dvNoteOptionsId = '#note-options',
        bttnDeleteId = '#bttn-delete';
    var init = function (args) {
        MyNoteApp._args = args;
        //load notes from session, if any
        loadNotes();

        //bind add note event
        bindAddNotes();
        //bind color radio button event
        bindColorOptionChange();
        //bind delete note event
        bindDeleteNote();
        //bind note title and detail click events
        bindNoteClick();
        bindNoteReset();
        //bind click events on lists
        bindLiMouseUp();
        //auto save
        bindAutoSave();
    }
    var loadNotes = function (callback) {
        var notesArr = getNotesFromSession();
        if (notesArr.length > 0) {
            displayNotesList(notesArr);
            if (notesArr.length > 0) {
                var thisLi = $(ulLiNotesId)[0];
                displaySelectedNote(thisLi);
            }
        }
        else
            addNewNote();

        setTimeout(function () { setFocusToEditNote(); }, 500);
    }
    var bindAddNotes = function () {
        $('#add-note').on('click', function (e) {
            e.preventDefault();
            //add new note list with empty title and content
            addNewNote();
        });
    }
    var bindColorOptionChange = function () {
        //bind onclick
        $('input[name="colorOption"]').on('change', function (e) {
            setSelectedListColor(e);
        });
    }
    var bindDeleteNote = function () {
        //bindDelete
        $(document).on('click', bttnDeleteId, function (e) {
            e.preventDefault();
            thisElem = e.target;
            var noteId = $(thisElem).attr("data-selectednoteid");
            if (noteId) { deleteNote(noteId); }
            else alert("All notes have been deleted!");
        });
    }
    var bindNoteClick = function () {
        $(document).on('click', 'div#detail-title, div#detail-note', function (e) {
            e.preventDefault();
            divToTextarea(e);
        });
    }
    var bindNoteReset = function () {
        $(document).on('blur', 'textarea#detail-title, textarea#detail-note', function (e) {
            e.preventDefault();
            resetToDiv(e);
        });
    }
    var bindLiMouseUp = function () {
        var list = $(ulLiNotesId);
        $(document).on('mouseup', ulLiNotesId, function (e) {
            e.preventDefault();
            displaySelectedNote(this);
        });
    }
    var bindAutoSave = function () {
        var timer;
        $(document).on('input change', 'textarea#detail-title, textarea#detail-note', function (e) {
            var thisElem = this;
            if (timer) clearTimeout(timer);
            timer = setTimeout(function () {
                $(document.getElementById('message')).html('Saving your notes...');
                updateNotes(thisElem, displayMessage);

            }, 1000);
        });
    }

    var setActiveLi = function (thisLi) {
        $(ulLiNotesId).removeClass('activeLi');
        $(thisLi).addClass('activeLi');
    }
    var getNotesFromSession = function () {
        //read from session
        if (typeof (Storage) !== "undefined") {
            var storedNotes = sessionStorage.getItem(sessionKey);
            if (storedNotes) {
                // passes the stored json back into an array of note objects
                var notesArr = JSON.parse(storedNotes);
                return notesArr;
            }
            else {
                return [];
            }
        } //return array
    }
    //populate notes list with all from notesArr	
    var displayNotesList = function (notesArr) {
        var count = notesArr.length;
        if (count > 0) {
            for (var i = 0; i < count; i++) {
                var currNote = notesArr[i];

                //append li
                var notesUl = document.getElementById("notes");
                var note = document.createElement("li");
                note.setAttribute("id", "note-" + i);
                note.setAttribute("class", currNote.CssClass);

                var span_title = document.createElement("span");
                span_title.setAttribute("class", "title");
                span_title.innerHTML = currNote.Title

                var span_note = document.createElement("span");
                span_note.setAttribute("class", "short-note");
                span_note.innerHTML = currNote.Content;

                note.appendChild(span_title);
                note.appendChild(span_note);
                notes.appendChild(note);
            }
        }
    }
    var displaySelectedNote = function (selectedNote) {
        var listSpans = $(selectedNote).find('span');
        var count = listSpans.length;
        if (listSpans) {
            var selectedNoteId = $(selectedNote)[0].id;
            var noteDetails = document.getElementById('note-details');
            noteDetails.setAttribute('data-selectedNoteId', selectedNoteId);
            $(noteDetails).html('');

            //set selected note id on delete button as well for later reference
            var bttnDelete = document.getElementById('bttn-delete');
            bttnDelete.setAttribute('data-selectedNoteId', selectedNoteId);

            //div for title in details
            var detailTitleDiv = document.createElement('div');
            detailTitleDiv.setAttribute('id', 'detail-title');
            detailTitleDiv.setAttribute('class', 'bottom-border');
            detailTitleDiv.innerHTML = listSpans[0].innerHTML;

            //span for notes in details
            var detailNoteDiv = document.createElement('div');
            detailNoteDiv.setAttribute("id", 'detail-note');
            detailNoteDiv.innerHTML = listSpans[1].innerHTML;

            noteDetails.appendChild(detailTitleDiv);
            noteDetails.appendChild(detailNoteDiv);

            //set selected notes color radio button 			
            var noteColor = $(selectedNote)[0].className;
            setSelectedColorBttn(noteColor);
            setFocusToEditNote();
            setActiveLi($(selectedNote)[0]);
        }
    }
    var addNote = function (cssClass, noteTitle, noteContent) {
        var noteArr = getNotesFromSession();
        //add new note to the beginning of the array
        noteArr.unshift({ CssClass: cssClass, Title: noteTitle, Content: noteContent });
        return noteArr;
    }
    var setNotesInSession = function (notesArr) {
        //remove from session first 
        sessionStorage.removeItem(sessionKey);
        //set in session
        var jsonStr = JSON.stringify(notesArr);
        sessionStorage.setItem(sessionKey, jsonStr);
    }
    var addNewNote = function () {
        var noteArr = addNote("blue", "[Enter your new title here...]", "[Enter your new note here ...]");
        setNotesInSession(noteArr);
        refreshAll(noteArr);
    }
    var setSelectedListColor = function (e) {
        var selectedNoteId = $(dvNoteDetailsId).data("selectednoteid");
        var noteListItem = $(ulNotesId).find('#' + selectedNoteId);
        $(noteListItem[0]).removeClass();
        var selectedColor = getSelectedRadioutton().value;
        $(noteListItem[0]).addClass(selectedColor);
        updateNotes(e.target, displayMessage);
    }
    var setSelectedColorBttn = function (noteCssClass) {
        var radioGroup = $('input[name="colorOption"]');
        //remove checked radio button first
        $('input[name="colorOption"]:checked').removeAttr('checked');

        for (var i = 0; i < radioGroup.length; i++) {
            var thisClassName = $(radioGroup[i]).val();
            //if (thisClassName == noteCssClass) {
            if (noteCssClass.indexOf(thisClassName) > -1) {
                radioGroup[i].setAttribute("checked", "checked");
                return; //no need to traverse further
            }
        }
    }
    var getSelectedRadioutton = function () {
        return $('input[name="colorOption"]:checked')[0];
    }
    var deleteNote = function (noteId) {
        var noteIdx = getIndexFromNoteId(noteId);
        var noteArr = getNotesFromSession();
        if (noteArr.length > 0) {
            noteArr.splice(noteIdx, 1);

            setNotesInSession(noteArr);
            if (noteArr.length == 0) {
                displayMessage('All notes have been deleted! <strong> Start typing to add new note.</strong>');
                addNewNote();
                return;
            }
            refreshAll(noteArr);
            displayMessage('<i>Note deleted!</i>')
        }
    }
    var divToTextarea = function (e) {
        var thisElem = e.target;
        var dvHtml = $(thisElem).html();
        var editableTextArea = document.createElement('textarea');
        editableTextArea.setAttribute('placeholder', 'Enter your note here...');
        editableTextArea.setAttribute('id', $(thisElem)[0].id);
        $(editableTextArea).val(dvHtml);
        $(thisElem).replaceWith(editableTextArea); //replaces the required div with textarea
        $(editableTextArea).focus();
    }
    var resetToDiv = function (e) {
        var thisElem = e.target;
        var html = $(thisElem).val();
        var dv = document.createElement('div');
        dv.setAttribute('id', $(thisElem)[0].id);
        $(dv).html(html);
        $(thisElem).replaceWith(dv);
    }
    var setFocusToEditNote = function () {
        document.getElementById('detail-title').click();
    }
    var updateNotes = function (elem, callback) {
        thisElem = elem.id;
        var isElemTitle = (thisElem == 'detail-title' && $('#' + thisElem).is("textarea"));
        var isElemNote = (thisElem == 'detail-note' && $('#' + thisElem).is("textarea"));
        var noteId = $(dvNoteDetailsId).attr('data-selectednoteid');
        console.log("from update notes " + noteId);
        var noteIdx = getIndexFromNoteId(noteId);
        var noteArr = getNotesFromSession();
        if (noteArr) {
            var cssClass = getSelectedRadioutton().value,
                noteTitle = isElemTitle ? $('#detail-title')[0].value : $('#detail-title').html(),
                noteContent = isElemNote ? $('#detail-note')[0].value : $('#detail-note').html(),
                updateLiId = $(dvNoteDetailsId).attr('data-selectednoteid');

            var note = { CssClass: cssClass, Title: noteTitle, Content: noteContent };
            noteArr[noteIdx] = note;

            setNotesInSession(noteArr);
            //refresh list 
            refreshNotes(noteArr);

            setActiveLi($('li#' + noteId)[0]);
        }

        if (callback) { callback(); }
    }
    var displayMessage = function (message) {
        if (!message) message = 'Notes last saved at ' + new Date().toLocaleString();
        $(document.getElementById('message')).html(message);
    }
    var refreshNotes = function (notesArr) {
        //clear list first
        $(ulNotesId).empty();
        //display notes
        displayNotesList(notesArr);
    }
    var refreshAll = function (notesArr) {
        $(ulNotesId).empty();
        //display notes
        displayNotesList(notesArr);

        displaySelectedNote($(ulLiNotesId)[0]);
    }
    var getIndexFromNoteId = function (noteId) {
        var idx = noteId.indexOf('-');
        if (idx > 0)
            return noteId.substring(idx + 1);
    }

    return {
        init: init
    }
}();

window.onload = MyNoteApp.init();
