function init() {
    "use strict";
    chrome.storage.sync.get("subreddits", function(data) {
       if (typeof data.subreddits == "undefined") {
           console.log("nothing in storage");         
       } else {
           console.log("something in storage");
       }
       console.log(data.subreddits);
    });
};


$(document).ready(function() {
    console.log("ready");
    init();
    
    $("#addNewSubredditButton").on("click", function() {
       var subreddit = $("#subredditName").val();
       $("#subredits").append("<a>" + subreddit + "</a>");
    });
});