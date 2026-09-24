# D-Bus Module

D-Bus is a message bus system, that enables us to communicate with other system processes and especially with 
systemd services.

[D-Bus Documentation](https://www.freedesktop.org/wiki/Software/dbus/)

For every action that the API process cannot do on its own, due to its restricted runtime permissions, it can ask 
the right systemd daemon to do it.

This is done by invoking the correct D-BUS interface of the systemd daemon and authorizing the request via 
a preconfigured *polkit rule*

[See Polkit README.md for details](./polkit/polkit-v0.115-README.md)

# Development
Every systemd service that we want to call via D-BUS has its interfaces and methods implemented in an own NestJS service 
that can simply be injected in any other component in the application.

All functionality for one systemd service should be implemented in one NestJS service even if it has multiple D-BUS interfaces.
If it might be useful for customers or others, consider adding a CLI command to invoke the functionality.

The boilerplate/glue code for D-Bus interfaces can be automatically generated. See chapter below for details

Every service must have JSDoc header with a short description and a link to the official documentation of the D-BUS interface!
If possible, also add an example on how to invoke the implemented functionality with `dbus-send` or other native commands.

## Generate code for D-BUS interfaces
dbus-final has a feature to generate templates JS or TS classes from D-Bus Introspection XMLs

In rpi-nest-api these generated classes are called `Proxy` and should be named according to their D-BUS interface.
The filenames should include the postfix/extension `.proxy.ts` e.g. the file for `FooBarProxy` `should be foo-bar.proxy.ts` 

To generate these classes you will need to checkout the dbus-final repository.

```shell
$ git clone https://github.com/Jelmerro/dbus-final.git
$ npm install
```

To generate the class for a specific D-Bus Service Interface use e.g.

```shell
node bin/generate-client-interfaces.js --system --template ./templates/typescript-class.ts.hbs --output ./foo-bar.proxy.ts org.freedesktop.NetworkManager /org/freedesktop/NetworkManager/Settings/5
```

### Changes in generate code
As the generated classes do not have proper return types and also some missing imports, the generated code must be adapted to match our needs.

As example and for reference see [../network-manager/code-gen/settings-connection.proxy.ts](./ConnectionSettings.ts)


## Useful scripts & commands
To make testing and exploring D-BUS interfaces on a device easier, a collection of useful scripts and CLI commands
can be found in the [scripts/ folder](./scripts)

If you find any useful script feel free to add it there. 
