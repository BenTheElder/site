---
markup: md
date: "2018-03-04"
title: Brewing With Kubernetes
htmlTitle: 'Brewing With Kubernetes'
categories:
-  <span class="emoji" style="background-image:url(/images/emoji/emoji_u2615.png)" title=":coffee:">:coffee:</span>
- <span class="emoji" style="background-image:url(/images/kubernetes_logo.svg)" title=":kubernetes:"/>:kubernetes:</span>
---

My coffee pot is now a node in my home Kubernetes cluster, and it's awesome.
<img src="./optim/coffeebot.25pct.jpg" title="my coffee pot"/>
More specifically the Raspberry Pi wired to [my CoffeePot controller](https://github.com/bentheelder/mrcoffeebot) now runs on Kubernetes thanks to [kubeadm](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/) in a cluster with [the node running my site](/posts/migrating-my-site-to-kubernetes).

I've set up a public <a href="/projects/coffee">live status page</a>* displaying all of the sensor data as well as the last update time, with control restricted to users on my local network. I've done this simply by proxying the status endpoint and not the rest of the `coffeebot` service. I'm also busily adding back support for scheduling brewing as well as alarms via [the Google Calendar API](https://developers.google.com/google-apps/calendar/quickstart/go), listening to a dedicated `coffee` calendar on my personal account.

<hr/>
* As of September 2018 I've migrated to static site hosting and taken this page down for the moment.
<hr/>

## Background

This might look a little ridiculous, but deploying (and debugging!) software updates to my coffeepot with `kubectl` has been *fantastic*.

If you know me then you know that I'm not a morning person and that I tend to sleep in more on the weekends, so a simple same-time-every-day alarm clock type coffee maker simply wasn't cutting it. When I needed to build a "smart device" for a college course (CS 3651 *Prototyping Intelligence Appliances*) I created the original incarnation of this based around an [Mbed](https://www.mbed.com/en/) and an old Android phone I had on hand. The phone since died, so I finally decided to fix this up and upgrade to a full Linux box, and here we are.

{{< figure src="./optim/IMG_20160804_150506.25pct.jpg" caption="The original Mr. Coffee Bot" alt="photo of the original Mr. Coffee Bot project from college" >}}

## Getting the Raspberry Pi Into my Cluster

Installing Kubernetes / `kubeadm` was straightforward enough, I just followed [the official instructions](https://kubernetes.io/docs/setup/independent/install-kubeadm/). However I hit a few small roadblocks related to multi-architecture support:

1) I was originally using [Calico](https://www.projectcalico.org/) for my overlay network, which only supports amd64, not arm.

I opted to solve this by re-creating my cluster, this time using [Weave Net](https://www.weave.works/docs/net/latest/overview/) which has out of the box support for amd64, arm, arm64 and ppc64le.

2) `kube-proxy` was deployed with a DaemonSet pointing to an amd64 specific image, and couldn't run on the Raspberry Pi.

I solved this by editing the existing DaemonSet to have a `nodeSelector` for `beta.kubernetes.io/arch: amd64` and creating a copy with `arm` substituted for `amd64` throughout the DaemonSet based on [this gist](https://gist.github.com/squidpickles/dda268d9a444c600418da5e1641239af).

These two rough spots are definitely not ideal, but also weren't particularly difficult to work around. Hopefully [we'll fix #2 in particular](https://github.com/kubernetes/kubeadm/issues/51) by publishing all of the core components with multi-architecture images.

<hr/>
<strong>UPDATE (AUGUST 2021)</strong>: This has since been fixed upstream, these images are properly multi-arch and kubeadm references the manifest list instead of architecture specific images.
<hr/>

## Leveraging Kubernetes

I use Kubernetes to:

- check the logs from anywhere with `kubectl logs ...`
- update by pushing a docker image and `kubectl apply -f coffeebot-deployment.yaml`
- connect the software's API to my web server by creating a [Service](https://kubernetes.io/docs/concepts/services-networking/service/) I can "magically" access at `http://coffeebot-service.default` from any node in the cluster
- automatically restart the service when it fails for any reason
  - count restarts (useful for verifying that the service *hasn't* been failing)
- expose a separate local-users-only control plane by exposing a different container port with a [nodePort](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport) bound to 80 (on a different service not publicly exposed or proxied)
- conveniently and securely access the service(s) from anywhere with `kubectl proxy`


## Safety ⚠️

It's worth noting that I did take a number of safety precautions when connecting an electric heater to the internet, Kubernetes powered or otherwise:

1) The public API is proxied by my existing webserver running on a different node and is read-only. I originally intended to implement [RFC 2324](https://www.ietf.org/rfc/rfc2324.txt) but this seemed... safer, and the only fun status code is actually for *teapots* anyhow.

2) Web controls are only exposed on a completely different service / port that is only available on my private WiFi / LAN.

3) The heater has an original-from-manufacturer [thermal fuse](https://en.wikipedia.org/wiki/Thermal_cutoff#Thermal_fuse) inline with the power mounted to the hotplate that will blow if temperature ratings are exceeded.

4) The actual microcontroller controlling the heater power (via solid state relay) has a hardware watchdog timer that will reboot it after five seconds passes without processing a valid command from the client (over USB serial)

Similarly the heater is explicitly disabled on boot, and every time one second passes without receiving an enable command from the client

5) The original power switch is still part of the circuit, which can be shut off manually and has a visible light when power is flowing.

## Conclusion

Using Kubernetes standardizes deploying software, managing network services, and monitoring applications. It turns out all of these things are very handy for over-re-engineering your $18 coffee maker.

And yet: Is this overkill? Absolutely. 🙃

I hope this will be useful and / or interesting to someone. I'm off to brew some more coffee ☕️