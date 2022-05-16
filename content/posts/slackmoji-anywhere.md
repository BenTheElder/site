---
markup: md
title: Slackmoji Anywhere
date: "2018-09-09"
categories:
- web
- '<span class="emoji" style="background-image:url(/images/slackmoji/ship_it_parrot.gif)" title=":ship_it_parrot:">:ship_it_parrot:</span>'
- '<span class="emoji" style="background-image:url(/images/Slack_Mark_Web_Cropped.png)" title=":slack:">:slack:</span>'
---
I use [slack](https://slack.com/) a **lot** to communicate [with other Kubernetes contributors](https://kubernetes.slack.com),
and I'm a fan of the [emoji reaction feature](https://get.slack.help/hc/en-us/articles/206870317-Emoji-reactions) 
for reacting to posts without notifying everyone in the group.
Positive emoji responses in particular are a simple way to acknowledge messages and make discussions 
more friendly and welcoming.

<img src="/images/slack_react_example.png" class="centered" style="max-width:295px;" />
<span class="centered centered-text">slack emoji reaction example (thanks <a href="https://github.com/dims">dims</a>!)</span>


A particularly fun part of this feature is [custom emoji support](https://get.slack.help/hc/en-us/articles/206870177-Add-custom-emoji), commonly known as "slackmoji",
which allows adding arbitrary images (and even gifs!) treated like any other emoji.
The [Kubernetes slack instance](https://kubernetes.slack.com) currently has **more than three-hundred custom emoji**,
and there are entire websites [dedicated to cataloging slackmoji](https://slackmojis.com/).
Slack is a web app and implements all emoji, custom or otherwise, with [shortcodes](https://www.webpagefx.com/tools/emoji-cheat-sheet/) replaced with images of the corresponding emoji.
With a bit of CSS we can easily mimic slackmoji and put them anywhere*

\* anywhere on the web, where we can control html and styling :^)

First we need to some HTML to style, Slack uses a `<span>` element for slackmoji,
which makes sense semantically as inline styled text. 
For the standard emoji "[Dog Face](https://emojipedia.org/dog-face/)" with shortcode `:dog:`
we can use the following HTML:

```html
<span class="emoji" title=":dog:">:dog:</span>
```

Now we'll need to make it look like the dog emoji with some styling:

```css
span.emoji {
  /* inline block allows us to set width and height */
  display: inline-block;
  /* the emoji is 1x1 character in size */
  height: 1em;
  width: 1em;
  /* We don't want the shortcode to overflow the emoji size */
  overflow: hidden;
  white-space: nowrap;
  /* Center the emoji image, we'll be using a background in a moment ... */
  vertical-align: middle;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  /* make the image slightly larger and aligned with the text */
  font-size: 1.2em;
  line-height: 1;
  margin-top: -0.1em;
  text-align: left;
  /* make sure the text is selectable */
  user-select: all;
  -webkit-user-select: all; /* Chrome/Safari */
  -moz-user-select: all; /* Firefox */
  -ms-user-select: all; /* IE10+ */
  /* try to hide the actual text, we want the emoji to appear selected */
  color: transparent;
  text-shadow: none;
}
```

Now we just need to add an image for `:dog:` to the span. We can use
something like Google's open [Noto Color Emoji](https://www.google.com/get/noto/help/emoji/)
font, which will give us an image for the "dog face" codepoint ([U+1F436](https://unicode.org/emoji/charts/full-emoji-list.html#1f436)) like:

<img class="centered" src="/images/emoji/emoji_u1f436.png"></img>

We can then update the `<span>` to use the image like:
```html
<span style="background-image:url(/dog.png)" class="emoji" title=":dog:">:dog:</span>
```

Giving us this: <span style="background-image:url(/images/emoji/emoji_u1f436.png)" class="emoji" title=":dog:">:dog:</span>

Which will:

  - display the `:dog:` emoji similar to slack
  - show `:dog:` on hover using the `title` tag
  - copy as the `:dog:` shortcode because we put `:dog:` inside the span
  - render inline as a single character, despite the inner text

For this site I use some additional CSS to make the highlight look as expected:

```css
/* set a consistent highlight color for the site */
/* we use #b4d5fe which is default in most browsers on macOS, */
/* and a pretty good choice, but adjust it to 25% transparent, */
/* for non-webkit browsers so we can still see the emoji image */
/* webkit will control the highlight color transparency itself */
::selection {
  background-color: rgba(180,213,254,0.75);
}
::-webkit-selection {
  background-color: #b4d5fe;
}
/* firefox for android does not seem to know ::selection */
::-moz-selection {
  background-color: rgba(180,213,254,0.75);
}
/* emoji text needs to stay transparent */
span.emoji::selection {
  color: transparent!important;
}
/* repeat for firefox on android */
span.emoji::-moz-selection {
  color: transparent!important;
}
```

~~This seems to work in Webkit based browsers (Chrome, Safari, etc.) at least, 
highlighting is slightly off on Firefox in varying ways depending on the platform,
but still works and the shortcodes copy correctly.~~

**Update**: Thanks to some sleuthing with [matter123](https://github.com/matter123) this
has been improved and now works pretty well in Firefox, Edge, Chrome, Safari ...

Finally, here are a few of my favourite slackmoji:

<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/ship_it_parrot.gif)" title=":ship_it_parrot:">:ship_it_parrot:</span> - `:ship_it_parrot:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/this_is_fine.jpg)" title=":this_is_fine:">:this_is_fine:</span> - `:this_is_fine:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/sig-testing.png)" title=":sig-testing:">:sig-testing:</span> - `:sig-testing:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/bikeshed.gif)" title=":bikeshed:">:bikeshed:</span> - `:bikeshed:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/k8s.png)" title=":k8s:">:k8s:</span> - `:k8s:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/heart_eyes_k8s.png)" title=":heart_eyes_k8s:">:heart_eyes_k8s:</span> - `:heart_eyes_k8s:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/parrotk8s.gif)" title=":parrotk8s:">:parrotk8s:</span> - `:parrotk8s:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/gopher_dance.gif)" title=":gopher_dance:">:gopher_dance:</span> - `:gopher_dance:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/picard_facepalm.png)" title=":picard_facepalm:">:picard_facepalm:</span> - `:picard_facepalm:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/unicorn.png)" title=":unicorn:">:unicorn:</span> - `:unicorn:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/left-shark.gif)" title=":left-shark:">:left-shark:</span> - `:left-shark:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/right-shark.gif)" title=":right-shark:">:right-shark:</span> - `:right-shark:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/bash.png)" title=":bash:">:bash:</span> - `:bash:`</span>
<span class="nowrap"><span class="emoji" style="background-image:url(/images/slackmoji/bash_fire.png)" title=":bash_fire:">:bash_fire:</span> - `:bash_fire:`</span>


(Along with the standard `:+1:`, smiles, etc. <span class="emoji" style="background-image:url(/images/emoji/emoji_u1f604.png)" title=":smile:">:smile:</span>)


Happy <span class="emoji" style="background-image:url(/images/Slack_Mark_Web_Cropped.png)" title=":slack:">:slack:</span>-moji-ing!  <span class="emoji" style="background-image:url(/images/emoji/emoji_u1f643.png)" title=":upside_down_smile:">:upside_down_smile:</span>


<div style="clear: both;"></div>
