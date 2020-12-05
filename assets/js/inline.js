var ytAlreadyInjected = false;
function playYT(s) {
    var oldYTAlreadyInjected = ytAlreadyInjected
    // inject youtube API if we haven't already
    if (!oldYTAlreadyInjected) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        ytAlreadyInjected = true;
    }
    var videoID = s.getAttribute("data-id");
    var wrapper = s.parentElement;
    var videoDiv = wrapper.children[0];
    // cleanup old chlidren
    // TODO: this could be simpler
    var obj = wrapper.children[1];
    var play = wrapper.children[2];
    obj.remove();
    play.remove();
    videoDiv.onclick = null;
    videoDiv.classList = "";
    createVid = function () {
        var player = new YT.Player(videoDiv, {
            videoId: videoID,
            // TODO: mobile?
            playerVars: { 'autoplay': 1 },
            width: "100%",
            height: "100%",
            events: {
                'onReady': function (event) {
                    event.target.playVideo();
                },
            },
        });
    }
    if (!oldYTAlreadyInjected) {
        window.onYouTubeIframeAPIReady = function () {
            createVid();
        }
    } else {
        // TODO: what if it's injected already but still loadinig
        createVid();
    }
}