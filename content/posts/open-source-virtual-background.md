---
markup: md
title: Open Source Virtual Background
date: "2020-04-09"
draft: false
categories:
- <span class="emoji" style="background-image:url(/images/slackmoji/linux.png)" title=":linux:"/>:linux:</span>
- <span class="emoji" style="background-image:url(/images/emoji/emoji_u1f3a5.png)" title=":movie-camera:"/>:movie-camera:</span>
---

With many of us around the globe under [shelter in place] due to [COVID-19]
video calls have become a lot more common. In particular, [ZOOM] has 
[controversially] become very popular. Arguably Zoom's most interesting feature 
is the "[Virtual Background]" support which allows users to replace
the background behind them in their webcam video feed with any image (or video).

I've been using Zoom for a long time at work for Kubernetes open source meetings,
usually from my company laptop. With daily "work from home" I'm now inclined to
use my more powerful and ergonomic personal desktop for some of my open source work.

Unfortunately, Zoom's linux client only supports the "[chroma-key]" A.K.A. "[green screen]"
background removal method. This method requires a solid color backdrop, ideally
a green screen with uniform lighting.

Since I do not have a green screen I decided to simply implement my own background
removal, which was obviously better than cleaning my apartment or just using
my laptop all the time. <span class="emoji" style="background-image:url(/images/emoji/emoji_u1f600.png)" title=":grin:"/>:grin:</span>

It turns out we can actually get pretty decent results with off the shelf, open source
components and just a little of our own code.

## Reading The Camera

First thing's first: How are we going to get the video feed from our webcam for
processing?

Since I use Linux on my personal desktop (when not playing PC games) I chose to 
use the [OpenCV][OpenCV] [python bindings] as I'm already familiar with them and they include
useful image processing primatives in addition to [V4L2] bindings for reading from
webcams.

Reading a frame from the webcam with `python-opencv` is very simple:
```python
import cv2
cap = cv2.VideoCapture('/dev/video0')
success, frame = cap.read()
```

For better results with my camera before capturing set:
```python
# configure camera for 720p @ 60 FPS
height, width = 720, 1280
cap.set(cv2.CAP_PROP_FRAME_WIDTH ,width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT,height)
cap.set(cv2.CAP_PROP_FPS, 60)
```

Most video conferencing software seems to cap video to 720p @ 30 FPS or lower,
but we won't necessarily read every frame anyhow, this sets an upper limit.

Put the frame capture in a loop and we've got our video feed!
```python
while True:
    success, frame = cap.read()
```

We can save a test frame with just:
```python
cv2.imwrite("test.jpg", frame)
```

And now we can see that our camera works. Success!

{{< figure src="./2020-04-09-031036.jpg" caption="*don't mind my corona beard*" >}}

## Finding The Background

OK, now that we have a video feed, how do we identify the background so we can
replace it? This is the tricky part ...

While Zoom doesn't seem to have commented anywhere about how they implemented 
this, the way it behaves makes me suspect that a neural network is involved, 
it's hard to explain but the results look like one.
Additionally, I found an article about [Microsoft Teams] implementing [background blur] with a [convolutional neural network].

Creating our own network wouldn't be too hard in principle -- There are many 
articles and papers on the topic of [image segmentation] and plenty of open
source libraries and tools, but we need a fairly specialized dataset to get
good results. 

Specifically we'd need lots of webcam like images with the ideal
human foreground marked pixel by pixel versus the background.

Building this sort of dataset in prepartion for training a neural net probably would
be a *lot* of work. Thankfully a research team at Google has already done all of this hard
work and open sourced a pre-trained neural network for "person segmentation" 
called [BodyPix] that works pretty well! ❤️

BodyPix is currently only available in [TensorFlow.js] form, so the easiest
way to use it is from the [body-pix-node] library.

To get faster [inference][inference] (prediction) in the browser a [WebGL] backend is preferred, but in
[node] we can use the [Tensorflow GPU backend][tensorflow-gpu] 
(NOTE: this requires a [NVIDIA] Graphics Card, which I have).

To make this easier to setup, we'll start by setting up a small containerized
tensorflow-gpu + node environment / project. Using this with [nvidia-docker] is
much easier than getting all of the right dependencies setup on your host, it
only requires docker and an up-to-date GPU driver on the host.

<div class="tile no-padding sourceCode"><div class="details">bodypix/package.json<span style="float: right">JSON</span></div></div>

```json
{
    "name": "bodypix",
    "version": "0.0.1",
    "dependencies": {
        "@tensorflow-models/body-pix": "^2.0.5",
        "@tensorflow/tfjs-node-gpu": "^1.7.1"
    }
}
```
<p></p>

<div class="tile no-padding sourceCode"><div class="details">bodypix/Dockerfile<span style="float: right">Dockerfile</span></div></div>

```Dockerfile
# Base image with TensorFlow GPU requirements
FROM nvcr.io/nvidia/cuda:10.0-cudnn7-runtime-ubuntu18.04
# Install node
RUN apt update && apt install -y curl make build-essential \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get -y install nodejs \
    && mkdir /.npm \
    && chmod 777 /.npm
# Ensure we can get enough GPU memory
# Unfortunately tfjs-node-gpu exposes no gpu configuration :(
ENV TF_FORCE_GPU_ALLOW_GROWTH=true
# Install node package dependencies
WORKDIR /src
COPY package.json /src/
RUN npm install
# Setup our app as the entrypoint
COPY app.js /src/
ENTRYPOINT node /src/app.js
```

Now to serve the results... **WARNING**: I am not a node expert! This is just
my quick evening hack, bear with me :-)

The following simple script replies to an HTTP `POST`ed image with a binary mask
(an 2d array of binary pixels, where zero pixels are the background).

{{< titledcode lang="javascript" title="bodypix/app.js" >}}
const tf = require('@tensorflow/tfjs-node-gpu');
const bodyPix = require('@tensorflow-models/body-pix');
const http = require('http');
(async () => {
    const net = await bodyPix.load({
        architecture: 'MobileNetV1',
        outputStride: 16,
        multiplier: 0.75,
        quantBytes: 2,
    });
    const server = http.createServer();
    server.on('request', async (req, res) => {
        var chunks = [];
        req.on('data', (chunk) => {
            chunks.push(chunk);
        });
        req.on('end', async () => {
            const image = tf.node.decodeImage(Buffer.concat(chunks));
            segmentation = await net.segmentPerson(image, {
                flipHorizontal: false,
                internalResolution: 'medium',
                segmentationThreshold: 0.7,
            });
            res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
            res.write(Buffer.from(segmentation.data));
            res.end();
            tf.dispose(image);
        });
    });
    server.listen(9000);
})();
{{< /titledcode >}}

We can use [numpy] and [requests] to convert a frame to a mask from our
python script with the following method:
```python
def get_mask(frame, bodypix_url='http://localhost:9000'):
    _, data = cv2.imencode(".jpg", frame)
    r = requests.post(
        url=bodypix_url,
        data=data.tobytes(),
        headers={'Content-Type': 'application/octet-stream'})
    # convert raw bytes to a numpy array
    # raw data is uint8[width * height] with value 0 or 1
    mask = np.frombuffer(r.content, dtype=np.uint8)
    mask = mask.reshape((frame.shape[0], frame.shape[1]))
    return mask
```

Which gives us a result something like:

<img src="./mask.jpg">

While I was working on this, I spotted this tweet:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">This is definitely the BEST background for video calls. 💯 <a href="https://t.co/Urz62Kg32k">pic.twitter.com/Urz62Kg32k</a></p>
<img src="https://pbs.twimg.com/media/EUn1cBxUwAAi6gv?format=jpg&name=large">
&mdash; Ashley Willis (McNamara) (@ashleymcnamara) <a href="https://twitter.com/ashleymcnamara/status/1245796639408701440?ref_src=twsrc%5Etfw">April 2, 2020</a></blockquote>


Now that we have the foreground / background mask, it will be easy to replace
the background.

After grabbing the awesome "Virtual Background" picture from that twitter thread and 
cropping it to a 16:9 ratio image ...

<img src="./background.jpg">

... we can do the following:

```python
# read in a "virtual background" (should be in 16:9 ratio)
replacement_bg_raw = cv2.imread("background.jpg")

# resize to match the frame (width & height from before)
width, height = 720, 1280
replacement_bg = cv2.resize(replacement_bg_raw, (width, height))

# combine the background and foreground, using the mask and its inverse
inv_mask = 1-mask
for c in range(frame.shape[2]):
    frame[:,:,c] = frame[:,:,c]*mask + replacement_bg[:,:,c]*inv_mask
```

Which gives us:

<img src="./masked.jpg">

The raw mask is clearly not tight enough due to the performance trade-offs
we made with our BodyPix parameters but .. so far so good!



This background gave me an idea ...

## Making It Fun

Now that we have the masking done, what can we do to make it look better?

The first obvious step is to smooth the mask out, with something like:

```python
def post_process_mask(mask):
    mask = cv2.dilate(mask, np.ones((10,10), np.uint8) , iterations=1)
    mask = cv2.erode(mask, np.ones((10,10), np.uint8) , iterations=1)
    return mask
```

This can help a bit, but it's pretty minor and just replacing the background
is a little boring, since we've hacked this up ourselves we can do anything
instead of just a basic background removal ...

Given that we're using a Star Wars "virtual background" I decided to create 
hologram effect to fit in better. This also lets lean into blurring the mask.

First update the post processing to:
```python
def post_process_mask(mask):
    mask = cv2.dilate(mask, np.ones((10,10), np.uint8) , iterations=1)
    mask = cv2.blur(mask.astype(float), (30,30))
    return mask
```

Now the edges are blurry which is good, but we need to start building the hologram
effect.

Hollywood holograms typically have the following properties:

- washed out / monocrhomatic color, as if done with a bright laser
- scan lines or a grid like effect, as if many beams created the image
- "ghosting" as if the projection is done in layers or imperfectly reaching the correct distance

We can add these step by step.

First for the blue tint we just need to apply an OpenCV colormap:
```python
# map the frame into a blue-green colorspace
holo = cv2.applyColorMap(frame, cv2.COLORMAP_WINTER)
```

Then we can add the scan lines with a halftone-like effect:

```python
# for every bandLength rows darken to 10-30% brightness,
# then don't touch for bandGap rows.
bandLength, bandGap = 2, 3
for y in range(holo.shape[0]):
    if y % (bandLength+bandGap) < bandLength:
        holo[y,:,:] = holo[y,:,:] * np.random.uniform(0.1, 0.3)
```

Next we can add some ghosting by adding weighted copies of the current effect,
shifted along an axis:

```python
# shift_img from: https://stackoverflow.com/a/53140617
def shift_img(img, dx, dy):
    img = np.roll(img, dy, axis=0)
    img = np.roll(img, dx, axis=1)
    if dy>0:
        img[:dy, :] = 0
    elif dy<0:
        img[dy:, :] = 0
    if dx>0:
        img[:, :dx] = 0
    elif dx<0:
        img[:, dx:] = 0
    return img

# the first one is roughly: holo * 0.2 + shifted_holo * 0.8 + 0
holo2 = cv2.addWeighted(holo, 0.2, shift_img(holo1.copy(), 5, 5), 0.8, 0)
holo2 = cv2.addWeighted(holo2, 0.4, shift_img(holo1.copy(), -5, -5), 0.6, 0)
```

Last: We'll want to keep *some* of the original color, so let's combine
the holo effect with the original frame similar to how we added the ghosting:

```python
holo_done = cv2.addWeighted(img, 0.5, holo2, 0.6, 0)
```

A frame with the hologram effect now looks like:

<img src="./holo-frame.jpg">

On it's own this looks pretty <span class="emoji" style="background-image:url(/images/emoji/emoji_u1f937.png)" title=":shrug:"/>:shrug:</span>

But combined with our virtual background it looks more like:

<img src="./holo-masked.jpg">

There we go! <span class="emoji" style="background-image:url(/images/emoji/emoji_u1f389.png)" title=":tada:"/>:tada:</span> (I promise it looks cooler with motion / video <span class="emoji" style="background-image:url(/images/emoji/emoji_u1f643.png)" title=":upside_down_face:">:upside_down_face:</span>)

## Outputting Video

Now we're just missing one thing ... We can't actually use this in a call yet.

To fix that, we're going to use [pyfakewebcam] and [v4l2loopback] to create a fake webcam device.

We're also going to actually wire this all up with docker.

First create a `requirements.txt` with our dependencies:

{{< titledcode lang="Dockerfile" title="fakecam/requirements.txt">}}
numpy==1.18.2
opencv-python==4.2.0.32
requests==2.23.0
pyfakewebcam==0.1.0
{{< /titledcode >}}

And then the `Dockerfile` for the fake camera app:

{{< titledcode lang="Dockerfile" title="fakecam/Dockerfile">}}
FROM python:3-buster
# ensure pip is up to date
RUN pip install --upgrade pip
# install opencv dependencies
RUN apt-get update && \
    apt-get install -y \
      `# opencv requirements` \
      libsm6 libxext6 libxrender-dev \
      `# opencv video opening requirements` \
      libv4l-dev
# install our requirements
WORKDIR /src
COPY requirements.txt /src/
RUN pip install --no-cache-dir -r /src/requirements.txt
# copy in the virtual background
COPY background.jpg /data/
# run our fake camera script (with unbuffered output for easier debug)
COPY fake.py /src/
ENTRYPOINT python -u fake.py
{{< /titledcode >}}

We're going to need to install `v4l2loopback` from a shell:
```shell
sudo apt install v4l2loopback-dkms
```

And then configure a fake camera device:
```shell
sudo modprobe -r v4l2loopback
sudo modprobe v4l2loopback devices=1 video_nr=20 card_label="v4l2loopback" exclusive_caps=1
```

We need the `exclusive_caps` setting for some apps (chrome, zoom) to work, the label
is just for our convenience when selecting the camera in apps, and the video number
just makes this `/dev/video20` if available, which is unlikely to be already in use.

Now we can update our script to create the fake camera:
```python
# again use width, height from before
fake = pyfakewebcam.FakeWebcam('/dev/video20', width, height)
```

We also need to note that `pyfakewebcam` expects images in `RGB` (red, green, blue)
while our OpenCV operations are in `BGR` (blue, green, red) channel order.

We can fix this before outputting and then send a frame with:
```python
frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
fake.schedule_frame(frame)
```

All together the script looks like:

{{< titledcode lang="Python" title="fakecam/fake.py">}}
import os
import cv2
import numpy as np
import requests
import pyfakewebcam

def get_mask(frame, bodypix_url='http://localhost:9000'):
    _, data = cv2.imencode(".jpg", frame)
    r = requests.post(
        url=bodypix_url,
        data=data.tobytes(),
        headers={'Content-Type': 'application/octet-stream'})
    mask = np.frombuffer(r.content, dtype=np.uint8)
    mask = mask.reshape((frame.shape[0], frame.shape[1]))
    return mask

def post_process_mask(mask):
    mask = cv2.dilate(mask, np.ones((10,10), np.uint8) , iterations=1)
    mask = cv2.blur(mask.astype(float), (30,30))
    return mask

def shift_image(img, dx, dy):
    img = np.roll(img, dy, axis=0)
    img = np.roll(img, dx, axis=1)
    if dy>0:
        img[:dy, :] = 0
    elif dy<0:
        img[dy:, :] = 0
    if dx>0:
        img[:, :dx] = 0
    elif dx<0:
        img[:, dx:] = 0
    return img

def hologram_effect(img):
    # add a blue tint
    holo = cv2.applyColorMap(img, cv2.COLORMAP_WINTER)
    # add a halftone effect
    bandLength, bandGap = 2, 3
    for y in range(holo.shape[0]):
        if y % (bandLength+bandGap) < bandLength:
            holo[y,:,:] = holo[y,:,:] * np.random.uniform(0.1, 0.3)
    # add some ghosting
    holo_blur = cv2.addWeighted(holo, 0.2, shift_image(holo.copy(), 5, 5), 0.8, 0)
    holo_blur = cv2.addWeighted(holo_blur, 0.4, shift_image(holo.copy(), -5, -5), 0.6, 0)
    # combine with the original color, oversaturated
    out = cv2.addWeighted(img, 0.5, holo_blur, 0.6, 0)
    return out

def get_frame(cap, background_scaled):
    _, frame = cap.read()
    # fetch the mask with retries (the app needs to warmup and we're lazy)
    # e v e n t u a l l y c o n s i s t e n t
    mask = None
    while mask is None:
        try:
            mask = get_mask(frame)
        except requests.RequestException:
            print("mask request failed, retrying")
    # post-process mask and frame
    mask = post_process_mask(mask)
    frame = hologram_effect(frame)
    # composite the foreground and background
    inv_mask = 1-mask
    for c in range(frame.shape[2]):
        frame[:,:,c] = frame[:,:,c]*mask + background_scaled[:,:,c]*inv_mask
    return frame

# setup access to the *real* webcam
cap = cv2.VideoCapture('/dev/video0')
height, width = 720, 1280
cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)
cap.set(cv2.CAP_PROP_FPS, 60)

# setup the fake camera
fake = pyfakewebcam.FakeWebcam('/dev/video20', width, height)

# load the virtual background
background = cv2.imread("/data/background.jpg")
background_scaled = cv2.resize(background, (width, height))

# frames forever
while True:
    frame = get_frame(cap, background_scaled)
    # fake webcam expects RGB
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    fake.schedule_frame(frame)
{{< /titledcode >}}


Now build the images:
```shell
docker build -t bodypix ./bodypix
docker build -t fakecam ./fakecam
```

And run them like:
```shell
# create a network
docker network create --driver bridge fakecam
# start the bodypix app
docker run -d \
  --name=bodypix \
  --network=fakecam \
  -p 9000:9000 \
  --gpus=all --shm-size=1g --ulimit memlock=-1 --ulimit stack=67108864 \
  bodypix
# start the camera, note that we need to pass through video devices,
# and we want our user ID and group to have permission to them
# you may need to `sudo groupadd $USER video`
docker run -d \
  --name=fakecam \
  --network=fakecam \
  -u "$(id -u):$(getent group video | cut -d: -f3)" \
  $(find /dev -name 'video*' -printf "--device %p ") \
  fakecam
```

Now make sure to start this *before* opening the camera with any apps, and
be sure to select the "v4l2loopback" / `/dev/video20` camera in Zoom etc.

## The Finished Result

Here's a quick clip I recorded of this in action:

<video autoplay muted loop playsinline>
    <source src="./holo-demo.webma" type="video/webm">
    <source src="./holo-demo.mp4a" type="video/mp4" onerror="videoFallback(parentNode)">
    <img src="./holo-demo-lossy.gif">
</video>
<script>
// https://webkit.org/blog/6784/new-video-policies-for-ios/
// we wouldn't need this, except netlify has no byte range support and iOS / safari
// requires it for video
// https://community.netlify.com/t/add-support-for-range-header-for-large-media-files/5733
function videoFallback(video)
{
  var img = video.querySelector('img');
  if (img)
    video.parentNode.replaceChild(img, video);
}
</script>


Look! I'm dialing into the millenium falcon with an open source camera stack!

I'm pretty happy with how this came out. I'll definitely be joining all of my meetings this way in the morning. <span class="emoji" style="background-image:url(/images/emoji/emoji_u1f600.png)" title=":grin:"/>:grin:</span>

[shelter in place]: https://www.sfchronicle.com/local-politics/article/Bay-Area-must-shelter-in-place-Only-15135014.php
[COVID-19]: https://www.cdc.gov/coronavirus/2019-ncov/index.html
[ZOOM]: https://zoom.us/
[Virtual Background]: https://support.zoom.us/hc/en-us/articles/210707503-Virtual-Background
[controversially]: https://en.wikipedia.org/wiki/Zoom_Video_Communications#Criticism
[chroma-key]: https://en.wikipedia.org/wiki/Chroma_key
[green screen]: https://en.wikipedia.org/wiki/Green_screen_(disambiguation)
[OpenCV]: https://opencv.org/
[python bindings]: https://pypi.org/project/opencv-python/
[V4l2]: https://en.wikipedia.org/wiki/Video4Linux
[Microsoft Teams]: https://en.wikipedia.org/wiki/Microsoft_Teams
[background blur]: https://en.pingwest.com/a/1579
[convolutional neural network]: https://en.wikipedia.org/wiki/Convolutional_neural_network
[BodyPix]: https://blog.tensorflow.org/2019/11/updated-bodypix-2.html
[TensorFlow.js]: https://www.tensorflow.org/js
[body-pix-node]: https://www.npmjs.com/package/body-pix-node
[tensorflow-gpu]: https://www.tensorflow.org/install/gpu
[NVIDIA]: https://www.nvidia.com/en-us/
[inference]: https://blogs.nvidia.com/blog/2016/08/22/difference-deep-learning-training-inference-ai/
[WebGL]: https://en.wikipedia.org/wiki/WebGL
[node]: https://nodejs.org/en/
[nvidia-docker]: https://github.com/NVIDIA/nvidia-docker
[image segmentation]: https://en.wikipedia.org/wiki/Image_segmentation
[v4l2loopback]: https://github.com/umlaeute/v4l2loopback
[pyfakewebcam]: https://github.com/jremmons/pyfakewebcam
[numpy]: https://numpy.org/
[requests]: https://requests.readthedocs.io/en/master/
