// https://webkit.org/blog/6784/new-video-policies-for-ios/
// we wouldn't need this, except netlify has no byte range support and iOS / safari
// requires it for video
// https://community.netlify.com/t/add-support-for-range-header-for-large-media-files/5733
function gifFallback(video) {
    var img = video.querySelector('img');
    if (img) {
        img.src = img.dataset.src;
        video.parentNode.replaceChild(img, video);
    }
}

/* lazyloading youtube */
var ytInjected = false;
function playYT(wrapper, event) {
    console.log(wrapper, event);
    var preYTInjected = ytInjected
    // inject youtube API if we haven't already
    if (!preYTInjected) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        ytInjected = true;
    }
    var videoID = wrapper.getAttribute("data-id");
    var videoDiv = wrapper.children[0];
    // cleanup old chlidren
    // TODO: this probably could be cleaner?
    wrapper.children[1].remove();
    wrapper.children[1].remove();
    videoDiv.onclick = null;
    videoDiv.classList = "";
    if (!preYTInjected) {
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