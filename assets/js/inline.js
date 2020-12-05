var ytAlreadyInjected = false;
window.playYT = function (wrapper, event) {
    console.log(wrapper, event);
    var oldYTAlreadyInjected = ytAlreadyInjected
    // inject youtube API if we haven't already
    if (!oldYTAlreadyInjected) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        ytAlreadyInjected = true;
    }
    var videoID = wrapper.getAttribute("data-id");
    var videoDiv = wrapper.children[0];
    // cleanup old chlidren
    // TODO: this probably could be cleaner?
    wrapper.children[1].remove();
    wrapper.children[1].remove();
    videoDiv.onclick = null;
    videoDiv.classList = "";
    if (!oldYTAlreadyInjected) {
        window.onYouTubeIframeAPIReady = function () {
            createVid(videoDiv, videoID);
        }
    } else {
        // TODO: what if it's injected already but still loading?
        createVid(videoDiv, videoID);
    }
}

function createVid(videoDiv, videoID) {
    var player = new YT.Player(videoDiv, {
        videoId: videoID,
        playerVars: { 'autoplay': 1, 'origin': window.location.href },
        width: "630px",
        height: "355px",
        events: {
            'onReady': function (event) {
                event.target.playVideo();
            },
        },
    });
}