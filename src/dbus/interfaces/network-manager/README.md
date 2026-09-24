# NetworkManager D-Bus Interface

# Type confusion

Watch out for subtle and hard to find differences in types across network-manager

Ususally the types for the D-Bus API can be found in the [D-Bus API Reference](https://networkmanager.dev/docs/api/latest/spec.html)

But some types, especially the connection settings used by the methods in `org.freedesktop.NetworkManager.Settings.Connection`
are different.
These methods expect objects as documented in [nm-settings-dbus](https://networkmanager.dev/docs/api/latest/nm-settings-dbus.html)

But the documentation still warns about possible differences to the actual expected types:
```
  Note that there are different manifestations of these properties. We have them
  on the D-Bus API (`man nm-settings-dbus`), in keyfile format (`man nm-settings-keyfile`)
  in libnm's NMConnection and NMSetting API, and in nmcli (`man nm-settings-nmcli`).
  There are similarities between these, but also subtle differencs. For example,
  a property might not be shown in nmcli, or a property might be named different
  on D-Bus or keyfile. Also, the data types may differ due to the differences of the
  technology.

  This list of properties is not directly the properties as they are in any of
  those manifestations. Instead, it's a general idea that this property exists in
  NetworkManager. Whether and how it is represented in nmcli or keyfile, may differ.
  The XML however aims to provide information for various backends.
```
[from the Network Manager SourceCode](https://gitlab.freedesktop.org/NetworkManager/NetworkManager/-/blob/main/src/libnm-core-impl/gen-metadata-nm-settings-libnm-core.xml.in)

## For future reference
The D-Bus Interface for NetworkManager is extremely complex.
Although all tasks can be achieved with it, the developers suggest to use their
GLib/GObject library `libnm` for more complex problems

https://networkmanager.dev/docs/libnm/latest/usage.html
```shell
$ sudo apt install libnm-dev
```

The bindings could be implemented in Node.js with `node-gtk`
```js
  const gtk = require('node-gtk')
  const Gio = gtk.require('Gio', '2.0');
  const GLib = gtk.require('GLib', '2.0');
  const NM = gtk.require('NM', '1.0');
```
