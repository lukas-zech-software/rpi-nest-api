# rpi-nest-api CLI

The rpi-nest-api provides a executable commandline interface
to make its functionality available via terminal e.g. with SSH sessions or scripts..

To get started run:

`$ ./tools/rpi-nest-cli --help`

## Authentication
The CLI does not require *any* authentication as it does not simply call the API but invokes the
underling logic directly.

Access and execution rights are determined by the UNIX file permissions and the user context.
If the user can execute the CLI he is assumed to have the required permissions.

**TODO: Check if different permissions for different command files are possible**

## Available commands
Every module of the rpi-nest-api can expose its functionality via its own sub-commands that are registered
with the `DefaultCommand`.

For example `rpi-nest-cli users` will invoke the `UsersCommand` that provides functions to manage users via the `UserService`
Individual commands are grouped hierarchically in *namespace* commands, that have no functionality on ots own, but provide a common
entrypoint for its subcommands.

E.g. `rpi-nest-cli users` does nothing but print out the available subcommands like `rpi-nest-cli users add`.

## Development
To create a new command first decide if it fits in an existing namespace command like `UsersCommand`.
If not, create a new namespace command and register this as sub-command in the `DefaultCommand` or another
namespace command.

Then register the new command which implements the actual functionality with the appropriate namespace command.
You must also register any new command with the appropriate NestJS module to make it available in the DI container.

## Testing
Currently there are no tests for the CLI as the functionality is just a minimal wrapper around already tested logic.
This may change depending on how complex future commands might be.
