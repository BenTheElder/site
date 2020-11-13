---
markup: md
title: Self-Driving Debian
date: "2019-12-01"
draft: false
categories:
- <span class="emoji" style="background-image:url(/images/slackmoji/linux.png)" title=":linux:"/>:linux:</span>
- <span class="emoji" style="background-image:url(/images/slackmoji/debian.png)" title=":debian:"/>:debian:</span>
---

For my home server I've come to appreciate using it rather than maintaining it 😏

After replacing some parts starting over I really wanted it to be 
fully "self-driving" to the extent possible -- primarily meaning totally 
unattended and automatic updates. No manual maintenance.

## Automated Updates

[Debian] 10 "Buster" 🐶 ships with the [unattended-upgrades] package installed 
out of the box, but it needs a little configuring to achieve what we want.

Namely:

- Upgrade **all** packages regularly (by default only certain repos / packages are)
- Reboot when necessary (kernel updates)
- Cleanup unused packages (we don't want to clog the disk!)

The Debian [wiki page] for this unattended upgrades is pretty good, starting from
there I've hacked up a basic configuration to do this.

Running the following bash snippet as root (`su`) will configure this:

```bash
#!/usr/bin/env bash
# this scipt configures debian to automatically upgrade all the things
set -o errexit -o nounset -o pipefail

# configure options for automatic updates
cat <<EOF >/etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Origins-Pattern {
        // auto-upgrade all the things
        "origin=*";
}

// cleanup unused dependencies
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";

// Automatically reboot when necessary, even if users are logged in
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-WithUsers "true";
EOF

# configure upgrade interval
cat <<EOF >/etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

# go ahead and upgrade once
unattended-upgrade -d
```

## Automated Everything

To achieve the rest of "self-driving" I've embarked on the time-honored
tradition of writing a bunch of [custom shell scripts] to automate configuring /
provisioning my setup. <span class="emoji" style="background-image:url(/images/slackmoji/bash.png)" title=":bash:"/>:bash:</span>

None of this should be particularly surprising, but I think it bears re-iterating:

- Automate your setup. _Start_ with a script when you go to do each install / setup task. Don't do things manually, you'll need to do them again someday.
- Keep data storage on it's own disk(s) if you can. If not, at least a separate
partition. You should be able to totally scrap the host OS and start over whenever
you need.
- Keep your (non-secret!) configs, scripts etc. in git.
- Take notes! You'll want them later 🙂

## Addendum

I should also note: I am *not* yet using Kubernetes for the initial (re)setup unlike [last time].
For a single-node, single-admin server in my apartment running a few simple services I expect less maintenance without it currently. 

I'll revisit this when my usage changes such that leveraging it is more favorable, or
when a [GKE]-like upgrade experience becomes available for my lowly home usage.

The promise of my computers truly _working for me_ still eludes me ...
I've noticed that a few computing devices manage to do this (e.g. [chromecasts]), 
but generally I still feel like I spend way too much time updatinng computers, doing their bidding.

Someday we'll all have self-driving computing, and then us software developers can
focus on making it all too complicated again 🙃

[Debian]: https://www.debian.org/
[unattended-upgrades]: https://packages.debian.org/unattended-upgrades
[custom shell scripts]: https://github.com/BenTheElder/dotfiles/tree/master/server
[last time]: http://localhost:1313/posts/migrating-my-site-to-kubernetes/
[GKE]: https://cloud.google.com/kubernetes-engine/
[chromecasts]: https://en.wikipedia.org/wiki/Chromecast
[wiki page]: https://wiki.debian.org/UnattendedUpgrades