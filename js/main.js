/**
 * prefix URL for all subreddits
 */
var URL = "http://www.reddit.com/r/";

/**
 * postfix URL for subreddits to get json response
 */
var DOTJSON = ".json";

/**
 * initialize menu list using chrome storage sync.
 * And add event listener to the each remove btn
 */
function init() {
    "use strict";
    $("#error-message").html("");
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
            displaySubredditBar(data.subreddits);
        }
    });
};

/**
 * Create a template for new subreddit name to be added into menu
 * @param {String} name : name of subreddit the user want to add to menu list
 * @return {String} template : return a html string to be append in to menu
 */
function newSubredditNameTemplate(name) {
    var openDiv = "<div class='row'>";
    var removeBtnCol = "<div class='col-xs-2'>";
    var removeBtn = "<button type='button' class='glyphicon glyphicon-minus-sign btn btn-default btn-sm btn-danger remove-btns' id='" + name + "'></button>";
    var anchorCol = "<div class='col-xs-10'>";
    var anchorBtn = "<a class='btn btn-default btn-name-width show-threads-btns' role='button'>" + name + "</a>";
    var closeDiv = "</div>";
    var template = openDiv + removeBtnCol + removeBtn + closeDiv + anchorCol + anchorBtn + closeDiv + closeDiv;
    return template;
}


function newSubredditThreadTemplate(object) {
    var thumbnail, score, title, comments_link, num_comments, author, thread_link;
    thumbnail = object.data.thumbnail;
    score = object.data.score;
    comments_link = object.data.permalink;

}

/**
 * Dynamically add event into collection
 * @param {HTMLCollection} collection : collections of item to add into event
 * @param {Event} event : event to add into collection
 * @param {Function} function : function to happen when event goes off
 */
function addEventIntoCollection(collection, event, func) {
    var collection = document.querySelectorAll(collection);
    for (var i = 0; i < collection.length; i++) {
        collection[i].addEventListener(event, func);
    }
}

/**
 * Get subreddit data (object) and call display subreddit
 * @param {event} event : onClicked of subreddit name
 */
function getSubredditData(event) {
    var name = event.target.text;
    chrome.storage.sync.get("subreddits", function(data) {
        var subreddits = data.subreddits;
        var url = subreddits[name];
        console.log(name);
        console.log(url);
        $.ajax({
            type: "GET",
            url: url,
            success: function(data) {
                displayThreads(data);
            }
        });
    });
}

/**
 * Display threads of the clicked subreddit
 * @param {Object} data : object data of subreddits (title, threads, etc);
 */
function displayThreads(data) {
    var children = data.data.children;
    console.log(children[0]);
}

/**
 * Display the objects into subreddit menu list
 * @param {object} subreddits : object that has subreddit name as key and url as value 
 */
function displaySubredditBar(subreddits) {
    var nameBar = $("#menu");
    $(nameBar).empty();
    for (var name in subreddits) {
        var template = newSubredditNameTemplate(name);
        $(nameBar).append(template);
    }
    var removeBtnCollection = ".remove-btns";
    var showThreadsBtnCollection = ".show-threads-btns";
    addEventIntoCollection(removeBtnCollection, "click", removeSubreddit);
    addEventIntoCollection(showThreadsBtnCollection, "click", getSubredditData);
}

/**
 * Return if string contains special character
 * @param {string} name : user input of subreddit name
 * @return {boolean} return true if contains special characters, otherwise false.
 */
function isNameValid(name) {
    return !/[^A-Za-z0-9._-]/.test(name) && name.length < 21;
}

/**
 * Remove subreddit from the display and from the storage
 * @param {event} event : onClick of remove button
 */
function removeSubreddit(event) {
    var idToRemove = event.target.id;
    $("#" + idToRemove).closest(".row").remove();
    chrome.storage.sync.get("subreddits", function(data) {
        var subreddits = data.subreddits;
        delete subreddits[idToRemove];
        chrome.storage.sync.set({ "subreddits": subreddits });
    });
}

/**
 * Add new subreddit into menu list
 */
function addNewSubreddit() {
    var newName = $("#subreddit-name").val();
    $("#error-message").html("");
    var errorMsg;
    var isValid = isNameValid(newName);
    if (isValid) {
        chrome.storage.sync.get("subreddits", function(data) {
            var subreddits = data.subreddits;
            if (!(newName in subreddits)) {
                subreddits[newName] = URL + newName + DOTJSON;
                chrome.storage.sync.set({ "subreddits": subreddits }, function() {
                    console.log("successfully added new subreddit");
                    displaySubredditBar(subreddits);
                });
                $("#error-message").html("");
                $("#subreddit-name").val("");
            } else {
                errorMsg = "Subreddit already existed";
                $("#error-message").html(errorMsg).css('color', 'red');
            }
        });
    } else {
        errorMsg = "Invalid name";
        $("#error-message").html(errorMsg);
    }
}

/**
 * Main function to kick off when dom is loaded
 */
function main() {
    //chrome.storage.sync.clear();
    init();
}


//.addEventListener("click", removeSubreddit);
document.getElementById("add-new-subreddit-btn").addEventListener("click", addNewSubreddit);
document.addEventListener("DOMContentLoaded", main);