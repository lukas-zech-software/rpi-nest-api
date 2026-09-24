#!/bin/bash

## Helpful command for working with D-Bus
## For gdbus command install:
##  sudo apt-get install libglib2.0

# List all services currently registered on the Bus
dbus-list-all-services() {
  dbus-send --system --print-reply --dest=org.freedesktop.DBus  /org/freedesktop/DBus org.freedesktop.DBus.ListNames
}

# Show API specification of service
dbus-introspect(){
  gdbus introspect --system --dest "$1" --object-path "$2" org.freedesktop.DBus.Introspectable.Introspect
}

# Show properties of service with all paths to child properties resolved
dbus-introspect-properties-recurse(){
  gdbus introspect --system --only-properties --recurse "$1" --object-path "$2" org.freedesktop.DBus.Introspectable.Introspect
}

# Graphical tree view of all services on the bus
dbus-tree(){
  busctl tree
}

# Call a service method with parameters
dbus-send-method-call(){
  gdbus call --system --dest=org.freedesktop.NetworkManager  --object-path /org/freedesktop/NetworkManager/Settings/1 --method org.freedesktop.NetworkManager.Settings.Connection.GetSettings
  #old: dbus-send --system --type=method_call --print-reply --dest=org.freedesktop.NetworkManager  /org/freedesktop/NetworkManager org.freedesktop.DBus.Properties.GetAll string:"org.freedesktop.NetworkManager"
}
