# polkit v0.105 - legacy version for Debian Bullseye and lower

> **NOTE: This README is for the LEGACY version installed in Bullseye and lower!**
> 
> The highest version of polkit available in Bullseye is `0.105` which is installed by default since wheezy
> 
> This README is only kept for reference and does not apply for actual development!

polkit is used to authorize actions invoked via DBUS

This legacy version uses `.pkla` Policy and  `.conf` Authority files instead of Actions and Rules

*Be warned: Here be dragons! (and really confusing documentation)*

[Manual & Overview](https://www.freedesktop.org/software/polkit/docs/0.105/pklocalauthority.8.html)

[Developer Reference / API](https://www.freedesktop.org/software/polkit/docs/0.105/)

## Local Authority Configuration files

These config files define what group or users that can be used when administrator authentication is required

They can be found here

`/etc/polkit-1/localauthority.conf.d `

## .plka Policy files
A policy file describes one authorization entry 

* for local configuration

  `/etc/polkit-1/localauthority`

* for 3rd party packages

  `/var/lib/polkit-1/localauthority`

### Properties

#### Identity
A semi-colon separated list of globs to match identities. Each glob should start with unix-user: or unix-group: to specify whether to match on a UNIX user name or a UNIX group name. Netgroups are supported with the unix-netgroup: prefix, but cannot support glob syntax.

#### Action
A semi-colon separated list of globs to match action identifiers.

#### ResultAny
Like ResultActive but instead applies to any subject.
*This must be set to `yes` to authenticate actions invoked with the D-BUS API like rpi-nest-api does*

#### ResultActive
The result to return for subjects in an active local session that matches one or more of the given identities.
*Only applies to console session with user context - not suitable for our use case*

#### ResultInactive
Like ResultActive but instead applies to subjects in inactive local sessions.
*Only applies to console session with user context - not suitable for our use case*


#### ReturnValue

A semi-colon separated list of key/value pairs (of the form key=value) that are added to the details of authorization result on positive matches.


# Enable rpi-nest-api to change time

## Authority Config
Allow user `api` the be used when administrator authentication is required.
This does yet grant any permission

`/etc/polkit-1/localauthority.conf.d/52-rpi-nest-api.conf`
```
[Configuration]
AdminIdentities=unix-user:api
```

## Policy for Action
Configure that the user `api` is allowed to invoke any action of `org.freedesktop.timedate1` on any kind of session

`/etc/polkit-1/localauthority/10-vendor.d/org.freedesktop.timedate1.pkla`
```
[API Process Permissions]
Identity=unix-user:api
Action=org.freedesktop.timedate1.*
ResultAny=yes
```
