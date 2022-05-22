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
<div class="full-page-width" style="background-color: #1155b3; padding: 0; padding-bottom: 1em; padding-top: 1em; margin-top: 0; margin-bottom: 1em">
  <div><img src="./prow_diagram.svg" title="Prow Diagram" width="1100px" style="width: 1100px; max-width: 100%; margin: 0 auto; display: block" /></div>
  <!--diagram attribution-->
  <!--min-margin hack-->
  <div style="margin: 0; width: calc(100% - 1em); padding-left: .5em; padding-right: .5em; margin-bottom: -.25em;">
    <div class="card" style="margin-top: 0; background: white">
      <p class="no-margin"><span class="bold italic">Prow</span> - extended nautical metaphor. <a href="https://blog.golang.org/gopher">Go Gopher</a> originally by <a href="http://reneefrench.blogspot.com/">Renee French</a>, <a href="https://github.com/golang-samples/gopher-vector#gopher">SVG version</a> by <a href="https://twitter.com/tenntenn">Takuya Ueda</a>, modified under the <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0 license</a>. Ship's wheel from <a href="https://github.com/kubernetes/kubernetes/blob/master/logo/logo.svg">Kubernetes logo</a> by <a href="http://www.hockin.org/~thockin/">Tim Hockin</a>.</p>
    </div>
  </div>
</div>

[The Kubernetes project](https://kubernetes.io/) does [*a lot*](http://velodrome.k8s.io/dashboard/db/bigquery-metrics?orgId=1) of testing, **on the order of 10000 jobs per day** covering everything from build and unit tests, to end-to-end testing on real clusters deployed from source all the way up to ~5000 node [scalability and performance tests](https://k8s-testgrid.appspot.com/sig-scalability-gce#Summary).

{{< figure src="./test_metrics.33pct.png" alt="a grafana dashboard screenshot showing over 10,000 jobs / day, with around an 80% pass-rate" caption="Velodrome [job metrics](http://velodrome.k8s.io/dashboard/db/bigquery-metrics?orgId=1)" >}}

The system handling all of this leverages Kubernetes, naturally, and of-course has a number
 of nautically-named components. This system is [*Prow*](https://github.com/kubernetes/test-infra/tree/master/prow), and is used to manage automatic validation and merging of
 human-approved pull requests and to verify branch-health leading up to each release.

With Prow each job is a single-container [pod](https://kubernetes.io/docs/concepts/workloads/pods/pod/), created in a dedicated build and test cluster by "plank", a micro-service running in the services cluster. 
Each Prow component (roughly outlined above, along with [TestGrid](http://testgrid.k8s.io)) is a small Go service structured around managing these one-off single-pod "ProwJobs".  

Using Kubernetes frees us from worrying about most of the resource management and scheduling / bin-packing of these jobs once they have been created and has generally been a pleasant experience.  

Prow / "hook" also provides [a number of GitHub automation plugins<](http://prow.k8s.io/plugin-help.html)
 used to provide things like issue and pull request [slash commands](https://github.com/kubernetes/test-infra/blob/master/commands.md) for applying and removing labels, opening and closing issues, etc.
 This has been particularly helpful since [GitHub's permissions model is not particularly granular](https://help.github.com/articles/repository-permission-levels-for-an-organization/) and we'd like contributors to be able to label issues without write permissions. 🙃
<br>
<br>
If any of this sounds interesting to you come check out [Prow's source code](https://github.com/kubernetes/test-infra/tree/master/prow) and join our [SIG Testing](https://github.com/kubernetes/community/blob/master/sig-testing/README.md) meetings for more. 


# Notes

  - There are many other tools that didn't make the diagram or dicussion above, you can find these and more about everything at <a href="https://github.com/kubernetes/test-infra">github.com/kubernetes/test-infra</a>.
 
  - These are all open source, except TestGrid, which is actually a <a href="https://testgrid.k8s.io">publicly hosted</a> and <a href="https://github.com/kubernetes/test-infra/tree/master/testgrid/config">configured</a> version of an internal tool developed at Google. We hope to open source a more performant rewrite of Testgrid sometime in Spring 2018.
 
  - A number of other projects / groups including [OpenShift](https://www.openshift.com/), [Istio](https://istio.io/), and [Jetstack](https://www.jetstack.io/) are also using and contributing (greatly!) to Prow and the rest of Kubernetes "test-infra".

{{% update date="August 2018" %}}Work on open-sourcing TestGrid still ongoing. TestGrid must be ported off of many Google internal libraries and is primarily staffed by one engineer currently, who must also maintain it, so this is taking longer than we hoped. We still intend to open source TestGrid and are making progress, slowly.{{% /update %}} 

{{% update date="August 2019" %}}The TestGrid repo is now created at [github.com/GoogleCloudPlatform/testgrid](https://github.com/GoogleCloudPlatform/testgrid), [Michelle](https://github.com/michelle192837) received approval and has started migrating the code. 🎉{{% /update %}}
