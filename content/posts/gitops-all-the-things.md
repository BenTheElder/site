---
markup: md
title: GitOps All The Things!
date: "2018-09-23"
categories:
- '<span class="emoji" style="background-image:url(/images/slackmoji/allthethings.jpg)" title=":allthethings:">:allthethings:</span>'
- <span class="emoji" style="background-image:url(/images/kubernetes_logo.svg)" title=":kubernetes:"/>:kubernetes:</span>
- <span class="emoji" style="background-image:url(/images/slackmoji/git.png)" title=":git:"/>:git:</span>
---
You should use [GitOps] for everything. **Everything**.

GitOps is a recent-ish term for:

- use declarative configuration for your infrastructure (e.g. [Kubernetes])
- version all of your configuration in source control (I.E. [Git])
- use your source control to drive your infrastructure (I.E. use CI/CD = [Ops])

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">GitOps: versioned CI/CD on top of declarative infrastructure. Stop scripting and start shipping. <a href="https://t.co/SgUlHgNrnY">https://t.co/SgUlHgNrnY</a></p>&mdash; Kelsey Hightower (@kelseyhightower) <a href="https://twitter.com/kelseyhightower/status/953638870888849408?ref_src=twsrc%5Etfw">January 17, 2018</a></blockquote>


Why? - Well, do you like the sound of:

- having complete history of all your infrastructure configuration
- roll-backing broken configuration as easily as clicking "revert"
- having a consistent interface to your automation (IE source control and declarative configs)

We've been doing this to varying degrees for years with the Kubernetes project [Test Infrastructure] and it works _wonderfully_. Since our configs are in public source control anyone can file a PR to change them or inspect the historical configuration.

When things break (and they will, it happens), **having quick access to configuration history is invaluable**.
Being able to make fixes by sending a pull-request with configuration updates also makes for an excellent experience. Some of our tooling here has been quite rough, but as we bring things more in line with this model it is much easier to work with.

Following this model I've moved this site to [Hugo], [Netlify], and [GitHub] and managing it has never been easier (the official [Kubernetes website] uses [the same stack]).

For Kubernetes as an Open-Source community we're making strides towards a world where _everything_ is **publicly managed through declarative config**. With the meta "[Org]" project and [Peribolos] we now have "**Join the Kubernetes Organizations - [by Pull Request]**". I hope this can bring increased openness to the project by managing project membership, teams, repo configuration, and more via the same (public) GitOps model with **public requests for changes** and **public records of all changes** (via [git history]), and I'd encourage other organizations to take a look. 

If this sounds good to you, all of [the tooling] being developed for this is declarative, easy to use, and open-source. If you're interested, please reach out via email or Twitter (see [my homepage]), [Kubernetes SIG-Testing slack], or file a GitHub Issue with [test-infra].


GitOps all the things! <span class="emoji" style="background-image:url(/images/slackmoji/allthethings.jpg)" title=":allthethings:">:allthethings:</span>


[GitOps]: https://www.weave.works/technologies/gitops/
[Kubernetes]: https://kubernetes.io/
[Git]: https://git-scm.com/
[Ops]: https://en.wikipedia.org/wiki/DevOps
[Test Infrastructure]: https://github.com/kubernetes/test-infra
[test-infra]: https://github.com/kubernetes/test-infra
[Hugo]: https://gohugo.io/
[Netlify]: https://www.netlify.com/
[GitHub]: https://github.com/BenTheElder/site
[Kubernetes Website]: https://kubernetes.io/
[the same stack]: https://github.com/kubernetes/website
[Org]: https://github.com/kubernetes/org
[Peribolos]: https://github.com/kubernetes/test-infra/tree/master/prow/cmd/peribolos
[by Pull Request]: https://github.com/kubernetes/community/blob/master/community-membership.md#member
[git history]: https://github.com/kubernetes/org/commits/master
[the tooling]: https://github.com/kubernetes/test-infra
[my homepage]: /
[Kubernetes SIG-Testing slack]: https://kubernetes.slack.com/messages/C09QZ4DQB/
