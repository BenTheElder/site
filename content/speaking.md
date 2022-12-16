---
markup: md
type: misc
title: Speaking
---

I'm a novice speaker with a few [KubeCon](https://www.cncf.io/kubecon-cloudnativecon-events/) talks / workshops and a couple
of smaller internal (company) talks under my belt. A complete list of my talks
is maintained below, with recordings when available.

## KubeCon NA 2022

Besides a Kubernetes Contributor Summit talk and two maintainer track talks, I also helped staff the Contributor Summit and participated in a as a member of the Kubernetes Steering Committee in two Steering AMA panels (one at the summit and one at the main conference).

I also joined the CNCF Governing Board meeting on Thursday to discuss Kubernetes Project Infrastructure funding and staffing. It was a busy week.

### Why We Moved the Kubernetes Image Registry

I spoke with Adolfo García Veytia, and Arnaud Meukam about https://registry.k8s.io, an effort Kubernetes undertook to improve The Project's container image hosting sustainability.

{{< lazyYoutube id="9CdzisDQkjE" title="KCSNA22 - Why We Moved the Kubernetes Image Registry" >}}

### Kubernetes Infra SIG: Intro And Updates

I spoke with Arnaud Meukam about what's up in [SIG K8s-Infra](https://git.k8s.io/community/sig-k8s-infra/README.md). We both ran over from the CNCF Governing board meeting – Dims couldn't make it as he stayed behind to continue discussing.

{{< lazyYoutube id="mJAC4asDCOw" title="Kubernetes Infra SIG: Intro And Updates - Davanum Srinivas, Arnaud Meukam, Benjamin Elder" >}}

### SIG Testing: Intro And Updates

As a Chair and Tech Lead of SIG Testing I spoke with Michelle Shepardson, Chao Dai, and Antonio Ojea Garcia about the SIG.

{{< lazyYoutube id="CdKBl6CncHg" title="SIG Testing: Intro And Updates - Benjamin Elder & Michelle Shepardson & Chao Dai, Antonio Garcia" >}}

## Open Source Productivity Day on Google Open Source Live

In October 2021 I gave a short talk about [testing Kubernetes with KIND and Kubetest2](
https://opensourcelive.withgoogle.com/events/open-source-productivity-day?talk=session-2) with my colleauge [Amit Watve] for [Google Open Source Live](https://opensourcelive.withgoogle.com/)'s [Open Source Productivity Day](https://opensourcelive.withgoogle.com/events/open-source-productivity-day).

In my opinion this was unfortunately not some of my best speaking as I was distracted by a family emergency the day of recording. The KubeCon talks below are better.

## KubeCon NA 2019

I gave one talk and ran a workshop at [KubeCon NA 2019]. I also anchored a table
at a [mentoring session](https://kccncna19.sched.com/event/WV57/mentoring-networking-signup-to-be-a-mentee-or-a-mentor) and represented Kubernetes [SIG Testing] and
WG K8s Infra at the Kubernetes [Contributor Summit](https://events19.linuxfoundation.org/events/kubernetes-contributor-summit-north-america-2019/) [Meet & Greet](https://events19.linuxfoundation.org/events/kubernetes-contributor-summit-north-america-2019/program/schedule/).

### Deep Dive: KIND - Benjamin Elder & Antonio Ojea

We spoke about [KIND internals and the challenges ahead on the road to 1.0](https://kccncna19.sched.com/event/Uah7/deep-dive-kind-benjamin-elder-google-antonio-ojea-garcia-suse).

{{< lazyYoutube id="tT-GiZAr6eQ" title="Deep Dive: Kind - Benjamin Elder, Google & Antonio Ojea Garcia, SUSE" >}}

### A Kind Workflow for Contributing to Kubernetes - Benjamin Elder & Duffie Cooley & James Munnelly & Patrick Lang

We ran a hands on tutorial for contributing and testing your Kubernetes code with [KIND].

This is one of my favorites. 462 people registered as attending this workshop! I really enjoyed going around helping people get through the workshop instead of speaking for
most of the session.
Hopefully many of them learned something about contributing to Kubernetes and using KIND.

{{< lazyYoutube id="BPVO2mcfjJk" previewQuality="hq" title="Tutorial: A Kind Workflow for Contri... Benjamin Elder, Duffie Cooley, James Munnelly &amp; Patrick Lang" >}}

## KIND on The Kubernetes Podcast

I spoke with Craig Box and Adam Glick on the Kubernetes Podcast about [KIND].

Episode #69 – [kind, with Ben Elder](https://kubernetespodcast.com/episode/069-kind/)

## KubeCon EU 2019

I gave two talks at [KubeCon EU 2019] and participated as a mentor in one of the mentoring sessions, I also held a Kubernetes Contributor Summit Session on KIND (voted for / requested at the summit).

### Testing your K8s apps with KIND - Benjamin Elder & James Munnelly

We spoke about [KIND and testing your Kubernetes Applications][testing-k8s-apps-with-kind].

I was pretty jet-lagged for this talk but I was blown away by the response. I really
enjoyed this talk and the Q&A, and I love working with my good friend [James Munnelly].


{{< figure src="./IMG_20190523_110248.20pct.guetzli.jpg" alt="This was easily one of my most popular talks, 1229 people registered as attending and there was only standing room! 🤯" caption="This was easily one of my most popular talks, 1229 people registered as attending and there was only standing room! 🤯" >}}

{{< lazyYoutube id="8KtmevMFfxA" title="Testing your K8s apps with KIND - Benjamin Elder, Google & James Munnelly, Jetstack.io">}}

### Deep Dive: Testing SIG - Benjamin Elder & James Munnelly

We spoke about KIND and how we use it to test Kubernetes for the [SIG Testing Deep Dive][sig-testing-deep-dive-kind].

{{< lazyYoutube id="6m9frvTxK0o" title="Deep Dive: Testing SIG - Benjamin Elder, Google & James Munnelly, Jetstack" >}}

## KubeCon NA 2018

I gave one talk at [KubeCon NA 2018] and ran a Kubernetes Contributor Summit session on KIND (voted for / requested at the summit).

### Behind Your PR: How Kubernetes Uses Kubernetes to Run Kubernetes CI - Sen Lu & Benjamin Elder

I spoke with [Sen Lu][@krzyzacy] about The Kubernetes Project's
testing tools and infrastructure, including a brief discussion of [KIND] and running
it on Kubernetes's [Kubernetes-based CI infrastructure][prow].

{{< lazyYoutube id="pz0lpl6h-Gc" title="Behind Your PR: How Kubernetes Uses Kubernetes - Sen Lu & Benjamin Elder" >}}


[Amit Watve]: https://mobile.twitter.com/theamwat
[BenTheElder]: https://twitter.com/BenTheElder
[gsoc-kubernetes]: https://www.google-melange.com/archive/gsoc/2015/orgs/kubernetes/projects/bentheelder.html
[kube-proxy]: https://kubernetes.io/docs/reference/command-line-tools-reference/kube-proxy/
[Kubernetes]: https://kubernetes.io/
[summer-of-code]: https://summerofcode.withgoogle.com/
[kube-proxy-pr]: https://github.com/kubernetes/kubernetes/pull/9210
[test-infra]: https://github.com/kubernetes/test-infra
[kube-proxy-issue]: https://github.com/kubernetes/kubernetes/issues/3760#issue-55311134
[@krzyzacy]: https://github.com/krzyzacy
[KIND]: https://kind.sigs.k8s.io
[prow]: https://github.com/kubernetes/test-infra/blob/master/prow/README.md
[KubeCon NA 2018]: https://events19.linuxfoundation.org/events/kubecon-cloudnativecon-north-america-2018/
[KubeCon EU 2019]: https://events19.linuxfoundation.org/events/kubecon-cloudnativecon-europe-2019/
[KubeCon NA 2019]: https://events19.linuxfoundation.org/events/kubecon-cloudnativecon-north-america-2019/
[testing-k8s-apps-with-kind]: https://kccnceu19.sched.com/event/MPYy/testing-your-k8s-apps-with-kind-benjamin-elder-google-james-munnelly-jetstackio
[SIG Testing]: https://github.com/kubernetes/community/blob/master/sig-testing/README.md
[sig-testing-deep-dive-kind]: https://kccnceu19.sched.com/event/MPkC/deep-dive-testing-sig-benjamin-elder-google-james-munnelly-jetstack
[my dog]: https://twitter.com/BobbyTheHound
[my wife]: https://twitter.com/BenTheElder/status/1370522702927175681?s=20
[James Munnelly]: https://twitter.com/jamesmunnelly
