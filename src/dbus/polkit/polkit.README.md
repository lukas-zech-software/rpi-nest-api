# polkit v0.115 and higher (v122 in bookworm stable)

> **NOTE: This README does not apply to the version installed in Bullseye or lower!**
> 
> The highest version of polkit available in Bullseye is `0.105`   
> see the legacy README for that

polkit is used to authorize actions invoked via D-BUS

**Warning: Here be dragons! (and really confusing documentation)**

[Manual & Overview](https://polkit.pages.freedesktop.org/polkit/polkit.8.html)

[Developer Reference / API](https://polkit.pages.freedesktop.org/polkit/)

## TODO: Deployment
At the moment the is no defined way of deploying the API and therefore it is not clear how the
*.rules files will later be deployed on the targets in production.

Currently the `deploy.sh` script simply copies them via `sudo`

## Actions
https://polkit.pages.freedesktop.org/polkit/polkit.8.html#polkit-declaring-actions

A D-BUS interface for a service ("mechanism") needs to declare "actions" for the 
methods it offers so that polkit can be used to authenticate calls to these methods.

The available actions are stored in
`/usr/share/polkit-1/actions`

They are defined in XML files with the extension `.policy` (obviously)

All actions currently loaded by polkitd can be listed with this command
```shell
$ pkaction
```

The actions are usually documented along with the D-BUS interface.
For example the D-Bus interface for `systemd-timedated.service` is `org.freedesktop.timedate1`
and it provides the action `org.freedesktop.timedate1.set-time` for its method `SetTime`
https://www.freedesktop.org/software/systemd/man/org.freedesktop.timedate1.html

## Rules
https://polkit.pages.freedesktop.org/polkit/polkit.8.html#polkit-rules

A rule is a piece of logic that will be executed when an D-BUS service's method is triggered that requires authorization and has
an according action defined.

Rules are implemented in ECMAScript 5 (a.k.a. "old" Javascript). They are simple functions that are invoked with 
parameters about the called method and user context etc. and return a `polkit.Result` object that describes if the call
is authorized and execution may continue or not.

Rules are stored in either of these locations:
1. `/etc/polkit-1/rules.d/10-auth.rules`
2. `/usr/share/polkit-1/rules.d/10-auth.rules`
3. `/etc/polkit-1/rules.d/15-auth.rules`
4. `/usr/share/polkit-1/rules.d/20-auth.rules`

They are defined in files with the extension `.rules`

To enable the rpi-nest-api to successfully invoke methods that require authorization, we need to implement rules that will
authorise those calls.

These rules can be found in `/src/dbus/polkit/rules/10-rpi-nest-api.ts` which will be compiled, renamed and deployed to `/etc/polkit-1/rules.d/10-rpi-nest-api.rules`  

### Rule Development
The rules are implemented in Typescript just like the rest of the application.
Obviously there are no typings available for the polkit Javascript interface, which is why we created own typings according to the documentation.

**Note:** These typings might be incomplete or contain errors. If in doubt check the [documentation](https://polkit.pages.freedesktop.org/polkit/polkit.8.html#polkit-rules-polkit)

### ReleaseNotes about compatibility with newer versions using JS based rules
```
policykit-1 (121+compat0.1-2) experimental; urgency=medium

  This version of polkit changes the syntax used for local policy rules:
  it is now the same JavaScript-based format used by the upstream polkit
  project and by other Linux distributions.

  System administrators can override the default security policy by
  installing local policy overrides into /etc/polkit-1/rules.d/*.rules,
  which can either make the policy more restrictive or more
  permissive. Some sample policy rules can be found in the
  /usr/share/doc/polkitd/examples directory. Please see polkit(8) for
  more details.

  Some Debian packages include security policy overrides, typically to
  allow members of the sudo group to carry out limited administrative
  actions without re-authenticating. These packages should install their
  rules as /usr/share/polkit-1/rules.d/*.rules. Typical examples can be
  found in packages like flatpak, network-manager and systemd.

  Older Debian releases used the "local authority" rules format from
  upstream version 0.105 (.pkla files with an .desktop-like syntax,
  installed into subdirectories of /etc/polkit-1/localauthority
  or /var/lib/polkit-1/localauthority). The polkitd-pkla package
  provides compatibility with these files: if it is installed, they
  will be processed at a higher priority than most .rules files. If the
  polkitd-pkla package is removed, .pkla files will no longer be used.

 -- Simon McVittie <smcv@debian.org>  Wed, 14 Sep 2022 21:33:22 +0100
```
