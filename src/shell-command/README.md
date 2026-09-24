# *DEPRECATED* --> Migrate to D-BUS and/or use `pkexec` instead of `sudo`

# Shell Command Module
The ShellCommandService in this module wraps the access to all features that need to invoke a shell script or executable.
As these files are usually only present on the rpi-nest devices, this module exports mocks of its services on all 
environments except on `production`.


## Security Concerns
The process hosting this module must have the necessary permissions to execute the target scripts/executables.
As this might require more permissions than the rpi-nest-api itself, we should consider to host this module in a separate
microservice process and invoke it via internal request mechanism like IPC Sockets

### pkexec - The sudo for D-Bus
[pkexec](https://polkit.pages.freedesktop.org/polkit/pkexec.1.html) can be used to authorise execution
of commands as root user just like `sudo`
For authorization `pkexec` uses polkit rules just like any other D-Bus interface would.

[For rules see](src/dbus/polkit/rules/00-pkexec.ts)

## Child Process Service
This service spawns the child processes in which the target scripts/executables run.
It should never be used directly outside this module, which is why it is not exported.

## Command Services
Command services are specific implementations of the functionality of a target script/executable.
They are facades that provide access to the  "API" of the target script/executable.
Every target scripts/executable must have its own command service to expose its functionality.

