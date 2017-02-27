function init() {
    getSubRedditList();
}

function getSubRedditList() {
    "use strict";
    var subredditList = [];
    chrome.storage.sync.get("subreddits", function(data) {
        if (typeof data.subreddits == "undefined") {
            subredditList.push("popular");
            subredditList.push("all");
            subredditList.push("random");
        } else {
            subredditList = data.subreddits;
        }
        console.log(data.subreddits);
    });
    // console.log(subredditList.toString());
    return subredditList;
};


$(document).ready(function() {
    console.log("ready");

    console.log(subredditList.toString());
    $("#addNewSubredditButton").on("click", function() {
        var subreddit = $("#subredditName").val();
        $("#subredits").append("<a>" + subreddit + "</a>");
    });
});