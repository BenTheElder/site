---
markup: md
title: Writing Safer Bash
date: "2019-04-08"
categories:
- <span class="emoji" style="background-image:url(/images/slackmoji/bash_fire.png)" title=":bash_fire:"/>:bash_fire:</span>
- <span class="emoji" style="background-image:url(/images/slackmoji/bash.png)" title=":bash:"/>:bash:</span>
---

[Bash] scripts are a really convenient way to write simple utilities.
Unfortunately many bash scripts in the wild are littered with bugs. Writing
reliable bash can be hard. I've been reviewing and fixing a lot of bash while
working on [cleaning up] the Kubernetes project's scripts and wanted to collect
some tips for writing more reliable scripts.

<img alt="BASH The Bourne-Again Shell" class="centered" src="./bash-logo-web.png">

## Use ShellCheck

[ShellCheck][shellcheck] is an excellent open source linter for shell 
capable of detecting many errors.

Many editors [have shellcheck extensions], personally I like the [VSCode extension].

Running your scripts through ShellCheck is a great way to catch many common bugs.
We opted to turn off [a few of the lints][disabled lints] when testing Kubernetes
pull requests, but generally these are useful and worth fixing.

## Enable Error Handling Options

Add the following snippet to the beginning of your scripts:

```bash
# enable common error handling options
set -o errexit
set -o nounset
set -o pipefail
```

- `set -o errexit` causes the script to exit immediately if a pipeline sets a 
non-zero status (exit code). This provides a basic mechanism to ensure that 
scripts fail unless you intended to ignore a failure. 
You can still intentionally ignore errors like: `some_failing_command || true`

- `set -o nounset` causes unset variables to be treat as errors and cause an exit.
This will help prevent using variables that were never assigned.

- `set -o pipefail` causes pipelines to retain / set hte last non-zero status.
Normally a pipeline will set the exit code of the last command instead. Without
setting this, `set -o errexit` may have surprising behavior like:  
```bash
# if foo_fails exits non-zero but bar_does_not_fail exits 0, this will not
# trigger errexit unless pipefail is also set
foo_fails | bar_does_not_fail
```

For more on these, read the bash manual page for [the set builtin].


## Avoid Common Gotchas

Bash has a few quirks that tend to be surprising to developers used to other
languages. These are a few common ones to be aware of.

### `export` and `local` always succeed

Though ShellCheck will capture this one (see [SC2155] for more details), it seems
to be common enough and misunderstood enough that I'm calling it out here.

Do this:
```bash
FOO=$(compute_foo)
export FOO
```

Not this:
```bash
export FOO=$(compute_foo)
```

Many people seem to be surprised to learn that `export` always sets the 
status to zero for the above line (I know I was!), meaning that even if 
`compute_foo` fails with a non-zero status, the line will succeed and errexit
will not be triggered.

This also applies to `local` and `readonly`, which should be written like:
```bash
local foo
foo=$(compute_foo)
```

and like:
```bash
foo=$(compute_foo)
readonly foo
```


### `local` is not so local

Unlike local variables in many other popular programming languages, `local`
variables in bash are visible to called functions. In other words, if function
`bar` declares local `foo` and then calls a function `echo_foo`, `echo_foo` will
be able to read the value of `foo`, whereas `bar`'s caller will not be able to
read `foo`.

Keep this behavior in mind when using `local`. For stronger isolation,
consider executing child calls in a subshell like `(echo_foo)`.

```bash
# `local` behavior example

echo_foo(){
    echo "${foo}"
}

bar() {
    local foo="foo"
    echo_foo
}

# prints `foo`
# locals are available to child functions
bar

# prints nothing (or errors with nounset)
# locals are not available to the caller
echo "${foo}" 

# prints nothing (or errors with nounset)
# locals are not visible to child processes
(echo_foo)
```


### Quoting is Hard

Quoting and parameter expansion (`"${FOO[@]}"`) behavior can be surprising.

Don't make assumptions about how strings and expansion work in bash, read the
manuals instead. Incorrect quoting and parameter expansion seem to be common
sources of bugs.

For this specifically I recommend reading:

- The bash [shell expansion] and [quoting] docs
- ShellCheck's entry on double quoting and word splitting: [SC2086]

### macOS ships old bash

Apple _still_ ships an old 3.X version of Bash in macOS. Meanwhile Bash 5.0 
[released][bash 5 release] in January.

Several useful features (mapfile, associative arrays, ...) are not
present or are more poorly behaved in Bash 3. If you intend to support macOS, be
prepared to be painfully aware of Mac's default shell.

For some of our scripts we simply check for and require a more recent bash
version, which may be installed with [Homebrew]. This is easy to check with
`$BASH_VERSINFO`:

```bash
# Check bash version
if ((${BASH_VERSINFO[0]}<4)); then
  echo
  echo "ERROR: Bash v4+ required."
  # Extra help for OSX
  if [[ "$(uname -s)" == "Darwin" ]]; then
    echo
    echo "Ensure you are up to date on the following packages:"
    echo "$ brew install md5sha1sum bash jq"
  fi
  echo
  exit 9
fi
```
(Excerpt from Kubernetes [hack/update-vendor-licenses.sh](https://github.com/kubernetes/kubernetes/blob/66329fcea955522f2eeb5ec13c90d3f5ae7928d5/hack/update-vendor-licenses.sh#L134-L146))

It is also worth noting that while most Linux distros ship GNU coreutils or 
something reasonably compatible, macOS ships many *BSD derived utilities.
`sed` differences alone have led to many scripts not being portable. Again we
simply require GNU sed in some cases and ask the user to install this with Homebrew.

## Recommended Reading

This post only touched on a few common problems, to write safer Bash I 
recommend reading these general references to understand it better:

- The GNU [Bash Reference Manual][Bash Reference Manual] (not surprisingly, the official reference is helpful)
- The Linux Documentation Project's [Advanced Bash-Scripting Guide].
- [The Bash Hackers Wiki]

You may also want to read Google's [Shell Style Guide].

## Final Note

Consider writing non-trivial utilities in another lanuage (or don't! bash is great!) :^)

Bash is a fun, useful, and easy to distribute.
It is also difficult to write complex, reliable programs in.
The Google Shell Style Guide has some fairly reasonable [recommendations about when to use Bash][when to use bash].

While you could probably implement your entire app in bash, it might not be the
best idea [^1] <span class="emoji" style="background-image:url(/images/slackmoji/bash_fire.png)" title=":bash_fire:"/>:bash_fire:</span>

{{< figure src="./Wargames_Ending.jpg" alt="wargames ending" caption="[WOPR](https://en.wikipedia.org/wiki/WarGames) on writing safe bash" >}}

[^1]: I'll probably do it someday anyhow, just for fun. I actually like bash a lot. It's just tricky to avoid trivial bugs.

[Bash]: https://en.wikipedia.org/wiki/Bash_(Unix_shell)
[cleaning up]: https://github.com/kubernetes/kubernetes/issues/72956
[shellcheck]: https://www.shellcheck.net/
[disabled lints]: https://github.com/kubernetes/kubernetes/blob/f873d2a0567057ebe8eaa19526513d4e265055e3/hack/verify-shellcheck.sh#L34-L41
[have shellcheck extensions]: https://github.com/koalaman/shellcheck#in-your-editor
[VSCode extension]: https://github.com/timonwong/vscode-shellcheck
[SC2155]: https://github.com/koalaman/shellcheck/wiki/SC2155
[SC2086]: https://github.com/koalaman/shellcheck/wiki/SC2086
[shell expansion]: https://www.gnu.org/software/bash/manual/html_node/Shell-Expansions.html#Shell-Expansions
[quoting]: https://www.gnu.org/software/bash/manual/html_node/Quoting.html
[Advanced Bash-Scripting Guide]: http://tldp.org/LDP/abs/html/index.html
[Bash Reference Manual]: https://www.gnu.org/software/bash/manual/html_node/index.html#SEC_Contents
[The Bash Hackers Wiki]: https://wiki.bash-hackers.org/
[Homebrew]: https://brew.sh/
[bash 5 release]: https://lists.gnu.org/archive/html/bug-bash/2019-01/msg00063.html
[arithmetic expansion]: https://www.gnu.org/software/bash/manual/html_node/Arithmetic-Expansion.html
[Shell Style Guide]: https://google.github.io/styleguide/shell.xml
[when to use bash]: https://google.github.io/styleguide/shell.xml?showone=When_to_use_Shell#When_to_use_Shell
[the set builtin]: https://www.gnu.org/software/bash/manual/html_node/The-Set-Builtin.html
[WOPR]: https://en.wikipedia.org/wiki/WarGames
