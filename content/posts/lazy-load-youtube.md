---
markup: md
title: Lazy Loading YouTube Videos
date: "2020-12-12"
categories:
- web
- 🎥
---

{{< note >}}First, let me acknowledge up-front that **this is neither a novel problem nor a
novel solution**. This is simply what I cobbled together to fit my own needs,
I thought I'd share about how this went / works.{{< /note >}}

# Why Lazy Load?

YouTube is a pretty ubiquitous for video hosting and very easy to embed.
For most videos you can just open the video on [youtube.com], click "share", click "embed", and finally copy + paste the generated `<iframe>` into your page source. Done!

Unfortunately standard embedded YouTube videos do have drawbacks ...

The drawback that kicked off this post is that they are still pretty bandwidth intensive even when not played, at nearly a megabyte (~820 kB) per video just to embed it in the page!


If you have a page with a single video this is not so bad, especially on a desktop
website, but on a 3G connection this is rather a lot.
Two videos is enough to completely consume a reasonable bandwidth budget for a webpage. Quoting from the chrome [lighthouse] docs:

> Aim to keep your total byte size below 1,600 KiB. This target is based on the amount of data that can be theoretically downloaded on a 3G connection while still achieving a [Time to Interactive](https://web.dev/interactive) of 10 seconds or less. [^1]


A fairly obvious approach to avoiding this is to replace the video embeds with
placeholders and then only load the video when the user clicks "play".
And indeed searching for "lazy load youtube video" surfaced many variations on this
technique, but none of the ones I looked at were quite what I was looking for to use
on static sites like this one (built with [hugo]).

In particular I have the following requirements:

- Placeholders must look recognizably lke the embedded video 
- Videos should ideally actually play after the user clicks "play"
- No frameworks, no compilation. Only static HTML, CSS, and minimal Javascript


# The Placeholder


One of the first useful tricks for building this is knowing that we can leverage 
predictable YouTube video thumbnail URLs like: `https://i3.ytimg.com/vi/$video_id/maxresdefault.jpg`

For example the video https://youtube.com/watch?v=rPppjjvjQlk would have a
thumbnail at
https://i3.ytimg.com/vi/rPppjjvjQlk/maxresdefault.jpg. Putting this in an `<img>`
tag gives us:

<img src="./rPppjjvjQlk-maxresdefault.jpg">

In theory all videos >= 720p resolution should have a `maxresdefault.jpg` thumbnail.

In reality, some videos seem to be missing it anyhow, such as https://youtube.com/watch?v=BPVO2mcfjJk, which gives us:

<img src="./maxresdefault-404.jpg">

... That doesn't look so good! (Also it's returning a [404])

To fix this, we can switch this video to the next-best qualty `hqdefault.jpg` thumnail instead, which gives us:

<img src="./BPVO2mcfjJk-hqdefault.jpg">

That's a bit better, but still leaves us with a problem: The native youtube embed will not show

To fix this we just need a little layout tweak + some css:

HTML:
```html
<!--wrapper div-->
<div class="video-wrapper lazyt">
  <!-- the placeholder image -->
  <img class="placeholder" src="https://i3.ytimg.com/vi/BPVO2mcfjJk/hqdefault.jpg">
</div>
```


CSS:
```css
/* style wrapper div for video embeds */
.video-wrapper {
  /*
  allow child element at width / height: 100%
  to responsively scale with 16:9 ratio
  https://css-tricks.com/aspect-ratio-boxes/
  */
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  background: black;
}
/* style lazy loaded youtube video placeholder image */
.lazyt img.placeholder {
  /* scale responsively with wrapper */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  /* let black bars be cropped */
  object-fit: cover;
}
```

Which gives us:
<div style="width: 100%; height: 0; padding-bottom: 56.25%; position: relative">
  <!-- the placeholder image -->
  <img style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; margin: 0; padding: 0; object-fit: cover;" src="./BPVO2mcfjJk-hqdefault.jpg">
</div>

That's more like it!

Now the placeholder preview image is all set, but it still doesn't look like a video.

An actual video embed currently looks like:
<img src="./embed-screenshot.png">

And has the key noticeable behaviors:
- Hovering turns the iconic YouTube play button from a translucent gray color to opaque red
- On desktop hovering has `cursor: pointer`
- Clicking ~anywhere on the video starts playback

We can get a more obvious video placeholder by at least mimicking the play button.

It turns out this button is just an inline SVG with some CSS for the color change,
which we can emulate like so:

Updated HTML:
```html
<!--wrapper div-->
<div class="video-wrapper lazyt">
  <!-- the placeholder image -->
  <img class="placeholder" src="https://i3.ytimg.com/vi/BPVO2mcfjJk/maxresdefault.jpg">
  <!-- placeholder play button -->
  <button class="placeholder playbutton" aria-label="Play"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg></button>
</div>
```

Additional CSS:
```CSS
.lazyt.video-wrapper {
  /* so we can absolute position the button */
  position: relative;
  display: inline-block;
}
.lazyt .placeholder {
  /* indicate clickability */
  cursor: pointer;
}
.lazyt .placeholder.playbutton {
  /* center button in video */
  position: absolute;
  top: 50%;
  left: 50%;
  width: 68px;
  height: 48px;
  margin-left: -34px;
  margin-top: -24px;
  padding: 0;
  /* remove any button styling */
  background: transparent;
  color: transparent;
  user-select: none;
  border: none;
  outline: none;
}
/* mimic transparent gray => solid red on hover */
.lazyt .placeholder.playbutton .ytp-large-play-button-bg {
  opacity: .8;
  fill: #111;
  -moz-transition: opacity .25s cubic-bezier(0.0,0.0,0.2,1);
  -webkit-transition: opacity .25s cubic-bezier(0.0,0.0,0.2,1);
  transition: opacity .25s cubic-bezier(0.0,0.0,0.2,1);
}
.lazyt:hover .placeholder .ytp-large-play-button-bg {
  opacity: 1;
  fill: #f00;
  -moz-transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);
  -webkit-transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);
  transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);
}
```

Which gives us:

<div class="lazyt-v1 video-wrapper-v1">
  <!-- the placeholder image -->
  <img class="placeholder-v1" src="./BPVO2mcfjJk-hqdefault.jpg">
  <button class="placeholder-v1 playbutton-v1" aria-label="Play"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg-v1" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg></button>
</div>
<style>
/* style wrapper div for video embeds */
.video-wrapper-v1 {
  /*
  allow child element at width / height: 100%
  to responsively scale with 16:9 ratio
  https://css-tricks.com/aspect-ratio-boxes/
  */
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  background: black;
}
/* style lazy loaded youtube video placeholder image */
.lazyt-v1 img.placeholder-v1 {
  /* scale responsively with wrapper */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  /* let black bars be cropped */
  object-fit: cover;
}
.lazyt-v1.video-wrapper-v1 {
  /* so we can absolute position the button */
  position: relative;
  display: inline-block;
}
.lazyt-v1 .placeholder-v1 {
  /* indicate clickability */
  cursor: pointer;
}
.lazyt-v1 .placeholder-v1.playbutton-v1 {
  /* center button in video */
  position: absolute;
  top: 50%;
  left: 50%;
  width: 68px;
  height: 48px;
  margin-left: -34px;
  margin-top: -24px;
  padding: 0;
  /* remove any button styling */
  background: transparent;
  color: transparent;
  user-select: none;
  border: none;
  outline: none;
}
/* mimic transparent gray => solid red on hover */
.lazyt-v1 .placeholder-v1.playbutton-v1 .ytp-large-play-button-bg-v1 {
  opacity: .8;
  fill: #111;
  -moz-transition: opacity .25s cubic-bezier(0.0,0.0,0.2,1);
  -webkit-transition: opacity .25s cubic-bezier(0.0,0.0,0.2,1);
  transition: opacity .25s cubic-bezier(0.0,0.0,0.2,1);
}
.lazyt-v1:hover .placeholder-v1 .ytp-large-play-button-bg-v1 {
  opacity: 1;
  fill: #f00;
  -moz-transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);
  -webkit-transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);
  transition: opacity .1s cubic-bezier(0.0,0.0,0.2,1);
}
.video-wrapper-v1 iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
</style>

That's starting to look better.

We could continue trying to mimic every little visual detail, but those are likely to change
on us in the future anyhow, and it turns out later that we may want users to be
able to recognize that the video is not fully loaded yet, so we'll leave the placeholder here.

This is very lightweight, with just a small amount of inline HTML / CSS / SVG, and one
relatively small thumbnail image. We've only taken a dependency on the YouTube thumbnail server.

# Actual Lazy Loading

OK, so now we have a youtube-video-embed-esque preview, now how do we load in
the video when the user clicks on it / "presses play"?

For this part, we *are* going to use javascript. My reasoning for this is that
actually playing youtube videos does require javascript, whereas creating a preview
should not / having the preview allows us to retain our layout and indicate to users
that they might want to enable javascript to allow YouTube to function.

To take action when the user clicks on the video we'll set an `onclick` handler
on the video wrapper div, like: `<div class="lazyt video-wrapper" onclick="playYT(this)">`

Now we just need to make the video load. To do this we could just inject an `<iframe>` in place
of the placeholders on click. This approach works pretty well actually. If we set the `autoplay=1` attribute on the embed url we can even get the video to play as expected, but not in all browsers.

To support autoplay in more browsers, we can instead use the YouTube [IFrame Player API],
loading the API itself once the user clicks on any video. 
The iframe player API supports controlling the embedded player from outside the iframe,
allowing us to trigger playback in most browsers.

Based on the API examples, I hacked up this:
```javascript
/* lazy loading youtube */
// WARNING: I am an infrastructure developer by trade.
// This javascript is probably rather terrible ...
// It works though 🤷‍♂️
var ytInjected = false;
function playYT(wrapper, videoID) {
    // we don't need to load the video again
    wrapper.onclick = null;
    // inject youtube API if we haven't already
    var preYTInjected = ytInjected
    if (!preYTInjected) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        ytInjected = true;
    }
    // inject the video, replacing the placeholder
    var videoDiv = wrapper.children[0];
    // TODO: this probably could be cleaner?
    wrapper.children[1].remove();
    wrapper.children[1].remove();
    videoDiv.classList = "";
    if (!preYTInjected) {
        // the API will call this when it's loaded
        window.onYouTubeIframeAPIReady = function () {
            createVid(videoDiv, videoID);
        }
    } else {
        // TODO: what if it's injected already but still loading? 🤔
        createVid(videoDiv, videoID);
    }
}

function createVid(videoDiv, videoID) {
    var player = new YT.Player(videoDiv, {
        videoId: videoID,
        // setting origin is helpful for local development IIRC
        playerVars: { 'autoplay': 1, 'origin': window.location.href },
        width: "630px",
        height: "355px",
        // autoplay on ready if possible
        // unintuitively this works in places where the playerVar does not
        events: { 'onReady': function (e) { e.target.playVideo(); }, },
    });
}
```

In the CSS we need to add rules scaling the `<iframe>` we're injecting:
```CSS
.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
```

In the HTML we just need to add an `onclick="playYT(this, 'BPVO2mcfjJk')"` attribute to the `<div class="lazyt videowrapper">` element.

And now finally we have:

<div class="lazyt-v1 video-wrapper-v1" onclick="playYTV1(this,'BPVO2mcfjJk')">
  <div></div>
  <!-- the placeholder image -->
  <img class="placeholder-v1" src="./BPVO2mcfjJk-hqdefault.jpg">
  <button class="placeholder-v1 playbutton-v1" aria-label="Play"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg-v1" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg></button>
</div>

And one with a `maxresdefault` thumb:

<div class="lazyt-v1 video-wrapper-v1" onclick="playYTV1(this,'rPppjjvjQlk')">
  <div></div>
  <!-- the placeholder image -->
  <img class="placeholder-v1" src="./rPppjjvjQlk-maxresdefault.jpg">
  <button class="placeholder-v1 playbutton-v1" aria-label="Play"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg-v1" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg></button>
</div>

<script type="text/javascript">
    /* lazy loading youtube */
// WARNING: I am an infrastructure developer by trade.
// This javascript is probably rather terrible ...
// It works though 🤷‍♂️
var ytInjected = false;
function playYTV1(wrapper, videoID) {
    // we don't need to load the video again
    wrapper.onclick = null;
    // inject youtube API if we haven't already
    var preYTInjected = ytInjected
    if (!preYTInjected) {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        ytInjected = true;
    }
    // inject the video, replacing the placeholder
    var videoDiv = wrapper.children[0];
    // TODO: this probably could be cleaner?
    wrapper.children[1].remove();
    wrapper.children[1].remove();
    if (!preYTInjected) {
        // the API will call this when it's loaded
        window.onYouTubeIframeAPIReady = function () {
            createVidV1(videoDiv, videoID);
        }
    } else {
        // TODO: what if it's injected already but still loading? 🤔
        createVidV1(videoDiv, videoID);
    }
}

function createVidV1(videoDiv, videoID) {
    var player = new YT.Player(videoDiv, {
        videoId: videoID,
        // setting origin is helpful for local development IIRC
        playerVars: { 'autoplay': 1, 'origin': window.location.href },
        width: "630px",
        height: "355px",
        // autoplay on ready if possible
        // unintuitively this works in places where the playerVar does not
        events: { 'onReady': function (e) { e.target.playVideo(); }, },
    });
}
</script>

Pretty good!

# Optimization

In this state the videos work pretty well, and use a fraction of the bandwidth, the `maxresdefault.jpg` are something like 120 kB versus 820+ for the whole embed, not bad.

We can improve further by using the more efficient `webp` thumbnails when in compatible browsers (basically anything but Safari or IE [^2]), or you could consider only using the "hq" images.

The webp images are instead at:
`i3.ytimg.com/vi_webp/$video_id/$quality.webp`

To deal with browser compatibility we can use the `<picture>` element, wrapping our existing
`<img>` and adding `<source>` tags for webp and jpeg thumbnails.
In compatible browsers the sources will be preferred first to last by which
format is supported. In older browsers the `<picture>` wll be ignored and in
all browsers the `<img>` tag will be used for display.

The updated embed is then like:
```html
<div class="video-wrapper lazyt">
  <!-- the placeholder image -->
  <picture>
    <source type="image/webp" srcset="https://i3.ytimg.com/vi_webp/BPVO2mcfjJkmaxresdefault.webp">
    <source type="image/jpeg" srcset="https://i3.ytimg.com/vi/BPVO2mcfjJk/maxresdefault.jpg">
    <img class="placeholder" src="https://i3.ytimg.com/vi/BPVO2mcfjJk/maxresdefault.jpg" alt="click to play the video" type="image/jpeg">
  </picture>
  <!-- placeholder play button -->
  <button class="placeholder playbutton" aria-label="Play"><svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%"><path class="ytp-large-play-button-bg" d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#f00"></path><path d="M 45,24 27,14 27,34" fill="#fff"></path></svg></button>
</div>
```

These images are approximately 50% smaller in my limited sampling, our first example
drops from ~120 kB to ~60 kB.


# Wrap Up

I'm relatively happy with this approach, and will probably continue to refine it
and use it selectively.

There are a few remaining drawbacks:

1. Lazy loading the video takes some small additional time upon clicking play.

2. There's no way for the user to open the video on [youtube.com] without starting playback.

3. On iOS the video will not play after clicking the fake play button, the user must click the real play button after the video loads following clicking the fake one.

The first of these is largely ignorable / a small cost to pay for faster page loads.

The second is solvable by improving the placeholder design to add a video title / link similar to the real embedded video.

The last of these unfortunately does not seem to have a work-around, it relates to
how iOS / safari blocks auto-playing videos. On pretty much all other browsers
this implementation seems to work as expected.

Depending on your use-case, that last flaw may be a bit of a deal-breaker.
Currently I think this makes the most sense on pages with multiple videos, which
may not all be viewed by the average user.

It is also obviously painful to replace a small embed snippet with this when writing
pages by hand - I chose to implement a hugo [shortcode] (~templated snippet) to avoid this.
Similar functionality should be available in most site generators.

I'm also pretty certain that the javascript used here is *not* idiomatic, but
the concept and functionality should hold 🙃

[^1]: "Avoid enormous network payloads" [web.dev/total-byte-weight/](https://web.dev/total-byte-weight/)
[^2]: Support from all browsers except IE and Safari based on [caniuse.com/webp]

[lighthouse]: https://developers.google.com/web/tools/lighthouse
[hugo]: https://gohugo.io
[shortcode]: https://gohugo.io/content-management/shortcodes/
[404]: https://en.wikipedia.org/wiki/HTTP_404
[IFrame Player API]: https://developers.google.com/youtube/iframe_api_reference
[youtube.com]: https://youtube.com
[caniuse.com/webp]: https://caniuse.com/webp