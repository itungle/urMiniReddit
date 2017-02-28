var URL = "http://www.reddit.com/r/";
var DOTJSON = ".json";

function init() {
    "use strict";
    var subredditList;
    chrome.storage.sync.get("subreddits", function(data) {
        if (typeof data.subreddits == "undefined") {
            subredditList = {
                "popular": URL + "popular" + DOTJSON,
                "random": URL + "random" + DOTJSON,
                "all": URL + "all" + DOTJSON
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

function displaySubredditBar(subreddits) {
    var nameBar = $("#item-list");
    $(nameBar).empty();
    for (var name in subreddits) {
        $(nameBar).append("<div><a class='anchor-margin'>" + name + "</a></div>");
    }
}

var addNewSubreddit = function() {
    var newName = $("#subredditName").val();
    console.log(newName);
    chrome.storage.sync.get("subreddits", function(data) {
        var subreddits = data.subreddits;
        if (subreddits[newName] === "undefined") {
            subreddits[newName] = URL + newName + DOTJSON;
            chrome.storage.sync.set({ "subreddits": subreddits }, function() {
                console.log("success");
                displaySubredditBar(subreddits);
                console.log(subreddits);
            })
        } else {
            var errorMsg = "Subreddit existed in your list";
        }
    })
}


var main = function() {
    //chrome.storage.sync.clear();
    init();
}
document.getElementById("addNewSubredditButton").addEventListener("click", addNewSubreddit);
document.addEventListener("DOMContentLoaded", main);