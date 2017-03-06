/**
 * prefix URL for all subreddits
 */
var URL = "http://www.reddit.com/r/";

/**
 * postfix URL for subreddits to get json response
 */
var DOTJSON = "/.json";

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


function buildSingleThreadTemplate(object) {
    var thumbnail, score, title, commentsLink, numComments, author, threadLink, nsfwTag;
    if (object.data.thumbnail === "self" || object.data.thumbnail === "") {
        thumbnail = "../images/Reddit-icon.png";
    } else {
        thumbnail = object.data.thumbnail;
    }
    title = object.data.title;
    author = object.data.author;

    score = scoreFormatter(object.data.score);
    commentLink = object.data.permalink;
    numComments = object.data.num_comments;
    console.log(typeof(numComments));
    threadLink = object.data.url;
    nsfwTag = object.data.over_18;

    var scoreSection = buildScoreTemplate(score);
    var thumbnailSection = buildThumbnailTemplate(thumbnail);

    var titleSection = buildTitleTemplate(title, threadLink);
    var commentSection = buildThreadInfoTemplate(commentsLink, numComments, author, nsfwTag);

    var template = "<div class='row'><div class='left-col col-xs-offset-1 col-xs-2'>" + scoreSection + thumbnailSection + "</div><div class='right-col col-xs-9'><div class='row'" + titleSection + "<div class='row'>" + commentSection + "</div></div>";
    // var template = "<div class='flex-row-container'><div class='left-col flex-item'>" + scoreSection + thumbnailSection + "</div><div class='right-col flex-item'>" + titleSection + "</div></div>";


    $("#sub-contents").append(template);
}


/**
 * Return template of score
 * @param {score} score : score of thread
 * @return {string} template : html template of score section
 */
function buildScoreTemplate(score) {
    var openDiv = "<div class='text-center'>";
    var scoreSection = "<span>" + score + "</span>";
    var closeDiv = "</div>";
    var template = openDiv + scoreSection + closeDiv;
    return template;
}

/**
 * Return template of thumbnail
 * @param {string} thumbnail : thumbnail link of the thread
 * @return {string} template : html template of thumbnail section
 */
function buildThumbnailTemplate(thumbnail) {
    var openDiv = "<div class='text-center'>";
    var thumbnailSection = "<img src='" + thumbnail + "' width='40' height='40'>"
    var closeDiv = "</div>";
    var template = openDiv + thumbnailSection + closeDiv;
    return template;
}

function buildTitleTemplate(title, url) {
    var openDiv = "<div class='text-left'>";
    var titleSection = "<a href='" + url + "' class='small-font'>" + title + "</a>";
    var closeDiv = "</div>";
    var template = openDiv + titleSection + closeDiv;
    return template;
}

function buildThreadInfoTemplate(commentLink, numComments, author, nsfwTag) {
    var commentSpan;
    var nsfwSection;
    if (numComments == 0) {
        commentSpan = "comment";
    } else if (numComments == 1) {
        commentSpan = "1 comment";
    } else {
        commentSpan = numComments + " comments";
    }
    var openDiv = "<div class='text-left row small-font'>";

    var commentSection = "<div class='col-xs-4'><a href='" + commentLink + "' class='no-decoration'>" + commentSpan + "</a></div>";
    var authorSection = "<div class='col-xs-4'><span>" + author + "</span></div>";

    if (nsfwTag) {
        nsfwSection = "<div class='col-xs-1'><span>NSFW</span></div>";
    } else {
        nsfwSection = "";
    }
    var template = openDiv + commentSection + authorSection + nsfwSection + "</div>";

    return template;

}


/**
 * format score if it is greater than 999
 * @param {number} score : score of thread
 * @return {string} score : if num > 999, then return abbreviation of score (19000 -> 19k)
 */
function scoreFormatter(score) {
    return score > 999 ? (score / 1000).toFixed(1) + 'k' : score;
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
    console.log(children);
    buildSingleThreadTemplate(children[0]);
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