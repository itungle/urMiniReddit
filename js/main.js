var URL = "http://www.reddit.com/r/";
var DOTJSON = ".json";

function init() {
    "use strict";
    $("#error-message").html("");
    console.log(document.getElementsByClassName("remove-button"));

    var subredditList;
    chrome.storage.sync.get("subreddits", function(data) {
        if (typeof data.subreddits == "undefined") {
            subredditList = {
                "all": URL + "all" + DOTJSON,
                "popular": URL + "popular" + DOTJSON,
                "random": URL + "random" + DOTJSON
            };
            chrome.storage.sync.set({ "subreddits": subredditList }, function() {
                displaySubredditBar(subredditList);
            });
        } else {
            subredditList = data.subreddits;
            console.log(subredditList);
            displaySubredditBar(data.subreddits);
        }
    });
};

function newSubredditTemplate(name) {
    var openDiv = "<div class='row'>";
    var removeBtnCol = "<div class='col-xs-2'>";
    var removeBtn = "<button type='button' class='btn btn-default btn-sm btn-danger remove-button' id='" + name + "'><span class='glyphicon glyphicon-minus-sign'></span></button>";
    var anchorCol = "<div class='col-xs-10'>";
    var anchorBtn = "<a class='btn btn-default btn-name-width ' role='button'>" + name + "</a>";
    var closeDiv = "</div>";
    var template = openDiv + removeBtnCol + removeBtn + closeDiv + anchorCol + anchorBtn + closeDiv + closeDiv;

    return template;
}


function displaySubredditBar(subreddits) {
    var nameBar = $("#menu");
    $(nameBar).empty();
    for (var name in subreddits) {
        var template = newSubredditTemplate(name);
        $(nameBar).append(template);
    }
}

var removeSubreddit = function() {
    console.log(this);
}

var addNewSubreddit = function() {
    var newName = $("#subreddit-name").val();
    $("#error-message").html("");
    chrome.storage.sync.get("subreddits", function(data) {
        var subreddits = data.subreddits;

        if (!(newName in subreddits)) {
            subreddits[newName] = URL + newName + DOTJSON;
            chrome.storage.sync.set({ "subreddits": subreddits }, function() {
                console.log("successfully added new subreddit");
                displaySubredditBar(subreddits);
            })
        } else {
            var errorMsg = "Subreddit already existed";
            $("#error-message").html(errorMsg).css('color', 'red');
        }
    })
}


var main = function() {
    //chrome.storage.sync.clear();
    init();
}


//.addEventListener("click", removeSubreddit);
document.getElementById("add-new-subreddit-btn").addEventListener("click", addNewSubreddit);
document.addEventListener("DOMContentLoaded", main);