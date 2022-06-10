---
markup: md
title: Digging Into etcd
date: "2019-12-01"
draft: true
categories:
- OSS
- <span class="emoji" style="background-image:url(/images/kubernetes_logo.svg)" title=":kubernetes:"/>:kubernetes:</span>
- <span class="emoji" style="background-image:url(/images/slackmoji/etcd.png)" title=":etcd:"/>:etcd:</span>
---

# What Is etcd?

[etcd], **/ˈɛtsiːdiː/**, per the official site is:

> A distributed, reliable key-value store for the most critical data of a distributed system

Per [the FAQ][etcd-FAQ] etcd's name means "**d**istributed **`etc`** directory". With `etc` being a reference to the [Unix directory] for system-wide configuration [/etc], and `d` being a reference to "distributed" [^1].
The `d` is perhaps also a pun on the long history of naming [daemons]
with a `d` suffix (see: `httpd`, `ntpd`, `systemd`, `containerd`, ...), though I've not yet found proof of this.

[Kubernetes] uses etcd as the [backing store for cluster data][k8s-uses-etcd],
which drove my own interest in learning more about it. Clearly a lot of clusters out there are using etcd for critical data storage,
but how does it work? Why etcd?

# History

For a history of etcd see: coreos.com/blog/history-etcd ([Archived](/archive/archive.today/fkwUC))

For bonus points: [www.wired.com/2013/08/coreos-the-new-linux/](https://www.wired.com/2013/08/coreos-the-new-linux/) ([Archived](/archive/archive.today/xKN1A))

Roughly: etcd was created out of a desire for a distributed data store addressing
the following issues:

- Google's [Chubby Paper] was public, but Chubby itself was / is not.

- Zookeeper was expensive to run, didn't scale down, and couldn't be interacted
with via common simple tools like [curl].

Initially etcd was developed by coreOS for their `fleet` container orchestration system,
but it was quickly adopted for other uses and later donated to the [CNCF].


# Architecture

## Overview

- `etcd` is a [Go] binary with a seperate CLI (`etcdctl`).

- etcd exposes a [gRPC] service along with an HTTP JSON API.

- Data is persisted in multiversion key-value format, stored on disk.

- Typically one, three, or five replicas are used.

- Each replica stores the full dataset, following the leader.

## Data Model

etcd's upstream [data model] documentation is instructive here, I highly recommend reading this document.

### Storage

Data is stored with a [memory-mapped][memory-mapped] [B+ tree] using [bbolt], a fork of [bolt], inspired by [LMDB].

## Consensus

Leader election is used to maintain a single leader replica, all requests
are routed to the leader internally and comitted only after acheiving consensus
on the request.

[Raft] is the [consensus algorithm] used both requests and for leader elections. 
The official [raft site][Raft] is a a good reference for understanding how this works. 
Another great resource linked from the official site is [thesecretlivesofdata.com/raft/].

etcd's [raft implementation][etcd-raft-implementation] is widely used and 
contains some useful documentation.

# TODO

- elaborate on Kubernetes's usage
- talk more aboult multiversion and revisions
- talk more about data model
- talk more about supported operations

# Additional Resources

The Carnegie Mellon Database Group "Database of Databases" site has a great page
on etcd at [dbdb.io/db/etcd][dbdb-etcd]


[^1]: As more clearly evidenced an [in older version of the etcd docs](https://etcd.io/docs/v3.1/learning/why/):
    > The name “etcd” originated from two ideas, the unix “/etc” folder and “d"istributed systems. The “/etc” folder is a place to store configuration data for a single system whereas etcd stores configuration information for large scale distributed systems. Hence, a “d"istributed “/etc” is “etcd”.

    This "Why etcd" page doesn't exist in currently supported versions.

[/etc]: https://tldp.org/LDP/Linux-Filesystem-Hierarchy/html/etc.html
[etcd]: https://etcd.io/
[etcd-FAQ]: https://etcd.io/docs/v3.5/faq/
[daemons]: https://en.wikipedia.org/wiki/Daemon_(computing)
[data model]: https://etcd.io/docs/v3.5/learning/data_model/
[Kubernetes]: https://kubernetes.io/
[k8s-uses-etcd]: https://kubernetes.io/docs/concepts/overview/components/#etcd
[Chubby Paper]: https://static.googleusercontent.com/media/research.google.com/en//archive/chubby-osdi06.pdf
[curl]: https://curl.haxx.se/
[Raft]: https://raft.github.io/
[consensus algorithm]: https://en.wikipedia.org/wiki/Consensus_algorithm
[CNCF]: https://www.cncf.io/
[write-ahead logging]: https://en.wikipedia.org/wiki/Write-ahead_logging
[dbdb-etcd]: https://dbdb.io/db/etcd
[gRPC]: https://grpc.io/
[thesecretlivesofdata.com/raft/]: http://thesecretlivesofdata.com/raft/
[etcd-raft-implementation]: https://github.com/etcd-io/etcd/tree/4b755e8935e626d35e9ab9ee2b25906a658846c2/raft#raft-library
[LMDB]: https://en.wikipedia.org/wiki/Lightning_Memory-Mapped_Database
[bolt]: https://github.com/boltdb/bolt
[bbolt]: https://github.com/etcd-io/bbolt
[memory-mapped]: https://en.wikipedia.org/wiki/Memory-mapped_file
[B+ tree]: https://en.wikipedia.org/wiki/B%2B_tree
[Go]: https://go.dev
[Unix Directory]: https://en.wikipedia.org/wiki/Unix_filesystem#Conventional_directory_layout

