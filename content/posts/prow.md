---
markup: md
date: "2017-12-26"
title: Prow
subtitle: Testing the way to Kubernetes Next
categories:
- OSS
- <span class="emoji" style="background-image:url(/images/slackmoji/gopher.svg)" title=":go:"/>:go:</span>
- <span class="emoji" style="background-image:url(/images/kubernetes_logo.svg)" title=":kubernetes:"/>:kubernetes:</span>
---
<!--prow diagram-->
<div class="full-page-width" style="background-color: #1155b3; padding: 0; padding-bottom: 1em; padding-top: 1em; margin-top: -.25em;">
  <div><img src="/images/prow_diagram.svg" title="Prow Diagram" width="1100px" style="width: 1100px; max-width: 100%; margin: 0 auto; display: block" /></div>
  <!--diagram attribution-->
  <!--min-margin hack-->
  <div style="margin: 0; width: calc(100% - 1em); padding-left: .5em; padding-right: .5em; margin-bottom: -.25em;">
    <div class="card" style="margin-top: 0; background: white">
      <p class="no-margin"><span class="bold italic">Prow</span> - extended nautical metaphor. <a href="https://blog.golang.org/gopher">Go Gopher</a> originally by <a href="http://reneefrench.blogspot.com/">Renee French</a>, <a href="https://github.com/golang-samples/gopher-vector#gopher">SVG version</a> by <a href="https://twitter.com/tenntenn">Takuya Ueda</a>, modified under the <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0 license</a>. Ship's wheel from <a href="https://github.com/kubernetes/kubernetes/blob/master/logo/logo.svg">Kubernetes logo</a> by <a href="http://www.hockin.org/~thockin/">Tim Hockin</a>.</p>
    </div>
  </div>
</div>

<!--hack for markdown-->
<div style="display: none"></div>

<p><a href="https://kubernetes.io/">The Kubernetes project</a> does <a href="http://velodrome.k8s.io/dashboard/db/bigquery-metrics?orgId=1" class="italic">a lot</a> of testing, <span class="bold">on the order of 10000 jobs per day</span> covering everything from build and unit tests, to end-to-end testing on real clusters deployed from source all the way up to ~5000 node <a href="https://k8s-testgrid.appspot.com/sig-scalability-gce#Summary">scalability and performance tests</a>.</p>

<img src="/images/test_metrics.png" alt="Velodrome job metrics" title="Velodrome job metrics"></img>
<p class="centered-text"><a href="http://velodrome.k8s.io/dashboard/db/bigquery-metrics?orgId=1">Velodrome metrics</a></p>

The system handling all of this leverages Kubernetes, naturally, and of-course has a number
 of nautically-named components. This system is <a href="https://github.com/kubernetes/test-infra/tree/master/prow" class="italic">Prow</a>, and is used to manage automatic validation and merging of
 human-approved pull requests and to verify branch-health leading up to each release.

With Prow each job is a single-container <a href="https://kubernetes.io/docs/concepts/workloads/pods/pod/">pod</a>, created in a dedicated build and test cluster by "plank", a micro-service running in the services cluster. 
Each Prow component (roughly outlined above, along with <a href="http://testgrid.k8s.io">TestGrid</a>) is a small Go service structured around managing these one-off single-pod "ProwJobs".  

Using Kubernetes frees us from worrying about most of the resource management and scheduling / bin-packing of these jobs once they have been created and has generally been a pleasant experience.  

Prow / "hook" also provides <a href="http://prow.k8s.io/plugin-help.html">a number of GitHub automation plugins</a>
 used to provide things like issue and pull request <a href="https://github.com/kubernetes/test-infra/blob/master/commands.md">slash commands</a> for applying and removing labels, opening and closing issues, etc.
 This has been particularly helpful since <a href="https://help.github.com/articles/repository-permission-levels-for-an-organization/">GitHub's permissions model is not particularly granular</a> and we'd like contributors to be able to label issues without write permissions. <span  class="emoji" style="background-image:url(/images/emoji/emoji_u1f643.png)" title=":upside_down_face:">:upside_down_face:</span>
<br>
<br>
If any of this sounds interesting to you come check out <a href="https://github.com/kubernetes/test-infra/tree/master/prow">Prow's source code</a> and join our <a href="https://github.com/kubernetes/community/blob/master/sig-testing/README.md">SIG Testing</a> meetings for more. 

<hr>

Notes:

  - There are many other tools that didn't make the diagram or dicussion above, you can find these and more about everything at <a href="https://github.com/kubernetes/test-infra">github.com/kubernetes/test-infra</a>.
 
  - These are all open source, except TestGrid, which is actually a <a href="https://testgrid.k8s.io">publicly hosted</a> and <a href="https://github.com/kubernetes/test-infra/tree/master/testgrid/config">configured</a> version of an internal tool developed at Google. We hope to open source a more performant rewrite of Testgrid sometime in Spring 2018.
 
  - A number of other projects / groups including <a href="https://www.openshift.com/">OpenShift</a>, <a href="https://istio.io/">Istio</a>, and <a href="https://www.jetstack.io/">Jetstack</a> are also using and contributing (greatly!) to Prow and the rest of Kubernetes "test-infra".

---

**UPDATE (August 2018)**: Work on this is still ongoing. TestGrid must be ported off of many Google internal libraries and is primarily staffed by one engineer currently, who must also maintain it, so this is taking longer than we hoped. We still intend to open source TestGrid and are making progress, slowly. 

----

**UPDATE (August 2019)**: The TestGrid repo is now created at <a href="https://github.com/GoogleCloudPlatform/testgrid">github.com/GoogleCloudPlatform/testgrid</a>, Michelle received approval and has started migrating the code. 🎉
