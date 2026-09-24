# Archived - this repository  serves only as showcase for some of my work. It is not maintained and as
# it has not been updated in quite some time. Probably a lot of the dependencies are broken. 

# rpi-nest-api - HTTP API to configure Raspberry Pi devices

# Description
rpi-nest-api is a NodeJS based API that provides functions to control and configure Raspberry Pi devices.
It is publicly exposed via HTTPS and provides a REST API, its specification and documentation for clients.

It's specification serves as catalogue for all officially provided and supported functions and how they can be used. 
Therefore the specification is a very important part of this project, as it is the main source of information for users.

The API servers its own documentation which is generated from the actual implementation and therefore always matches.
For more details [see](#api-documentation)

# General

## NestJS
This application is build with the NestJS framework
Nest (NestJS) is a framework for building efficient, scalable Node.js server-side applications based on Express.js

As NestJS enforces strict architecture, project structure and coding conventions it is mandatory to read the documentation
https://docs.nestjs.com/

## API Documentation
The NestJS Application dynamically generates a OpenAPI specification when it starts.
This specification always represent the actual API of the server as it is derived from the code that actually registers
the routes and their expected schemas.
Therefore the documentation is always correct for this server instance.
To achieve this, the application implements the [`@nestjs/swagger` module](https://docs.nestjs.com/openapi/introduction)
and its [CLI Plugin](https://docs.nestjs.com/openapi/cli-plugin)
The System Tests validate, that the implementation actually behaves like the generated API specification asserts

The documentation can be explored in a web interface that is available at http://<device-name-or-ip>:<api-port>/api-docs

With the default values the URL would be http://rpi-nest.local:3000/api-docs

## API Conventions
As the API is the public interface of the device, it is very important to establish rules and guidelines how the API is designed
These rules also help developers by guiding where and how new features should be implemented.

The API should follow the rules described in the Open Source [REST API Standards](https://github.com/SPSCommerce/sps-api-standards)  
as is a very detailed, sensible and well documented baseline.
Any exceptions should be documented here and should be configured in the [Spectral Linting Configuration](.spectral.yml)

The **generated** API specification is verified and linted according to these rules.
To make sure the **generated** API specification is valid, the server code must be implemented correctly, so it will
generate a valid specification.

# Testing
There are multiple test levels:
* Unit Tests
* Integration Tests
* System Test

For more details about each level, see chapters below 

To run all tests use
`$ npm run test`

## Unit Tests
This tests are written as code and validate specific parts of the code on a very atomic level
They are implemented with Jest and reside in the *.spec.ts files in the source folder next to the components they are testing 

To run the unit tests use
`$ npm run test:unit`

## Integration Tests
This tests are written as code and validate the whole application with only external services like database or shell scripts mocked 
They are also implemented with Jest and reside in the tests/integration/ folder 

To run the unit tests use
`$ npm run test:integration`

## System Tests
These tests are not implemented explicitly but are derived from the generated API specification.
This is done by [Dredd — HTTP API Testing Framework](https://dredd.org/en/latest/index.html)
which takes the API specification an executes HTTP requests against a running instance of the application to ensure
that the server responds to all routes defined in the API specification with the expected response


**Note:** Dredd is only installed on demand via `npx` and not part of the devDependencies as it contains some
very outdated dependencies that should not be part of this project

To run the unit tests use
`$ npm run test:spec`

## Environments
The code and the documentation mention different environments:

* **development**
    This refers to the local environment of a developer's machine

* **testing**
    This means any environment that currently executes (unit or integration) tests. Either CI pipeline or local machine  

* **production**
    This means **any** real rpi-nest device - no matter if its a developers test device or a customers device in productive use


### Environment Variables
These environment variables must be set locally:
* `NODE_ENV` - Defines the environment. For local develop set this to `development` 
* `JWT_SECRET` - A random string used as secret for crypto. Set to any string

All environment variables can be provided by a `.env` file in the project root.

Use `$ npm run dev:init-environment` to create a default `.env` file for local development   
The `.env` file is ignored by git 

If an environment specific `.env` file for the current NODE_ENV e.g. `.env.development` is present this file
will also be loaded and merged with the default file.


**NOTE:** The script `test:init-environment` creates a `.env.testing` file for integration and system tests.
This file takes precedence over the default `.env` file **if** NODE_ENV is set to `testing`!

## CLI

The rpi-nest-api provides a executable commandline interface
to make its functionality also available via shell e.g. with SSH sessions or scripts.
As it is only accessibly by authenticated local UNIX users with the necessary permissions, the CLI does not use the
authentication layer of the REST API and calls the internal functions directly.

To get started run:

```shell
$ ./tools/rpi-nest-cli --help
```

For details see the (CLI README)[src/cli/README.md]

# Development
The project can be started locally or in a Docker container but always remember
that a real physical rpi-nest device will always behave differently!
The software must **always** be tested on a real device be it is considered functional.

As certain functionalities are only available on physical rpi-nest devices, on all other environments,
these things will be automatically replaced with mocks that will try to behave like on the real device 
but return predefined test data.

## Test Users
The database will be initialized with the default "admin" user which will have the 
*device default password* obtained from the `pi-serial` command.

In non-production environments the mock implementation of `pi-serial` is used which always returns
the hardcoded `const TEST_DEFAULT_PASSWORD` {@see src/shell-command/command-services/pi-serial-command.service.ts}

In a new initialized dev/testing environment you can use these credentials:
```json
{
  "username": "admin",
  "password": "test-default-password"
}
```

## Start locally
To start the project in your local environment for development use
```shell
$ npm install
$ npm run dev:init-environment
$ npm start
```

## Start in Docker
The Docker container will mount the local `src/` and `test/` folder 
and start the NestJS application with `--watch`

```shell
$ npm run docker:start:dev
```

### Docker Image
The docker image is built with all dependencies installed and prebuilt native addons.
If the dependencies are changed the image must be rebuilt and published manually.

To do so run:
```shell
$ npm run docker:publish:base
```

## Deploy to rpi-nest device
Before you can deploy rpi-nest-api to a real rpi-nest device for the first time you must run the setup script once.   
This will create the service user, directories and install the systemd service.

You must also make sure that all necessary dependencies are installed on the target.
See [Requirements](#requirements)

The script expects the DNS name or IP address of the target device either as first argument or set in the environment variable `RPI`
```
$ tools/target/setup/setup-new-target.sh RPI_DEVICE_NAME_OR_IP
```

Once the device was setup, you can build and deploy the application with 
```
$ tools/target/deploy/deploy-to-target.sh RPI_DEVICE_NAME_OR_IP
```

### Requirements
To build, test and run this project you will need to have these tools installed on the device

* `node` >= 18.0
* `npm` >= 9.5
* `polkitd` >= 122


#### Install NodeJs
To install NodeJs v18 LTS on a rpi-nest device running Bullseye or earlier use

```shell
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash - && sudo apt-get install -y nodejs
```

[See here for alternative install instructions](https://nodejs.org/en/download/package-manager)

**Note: `npm` is usually bundled with Node.js and does not need to be installed separately**

#### Install polkitd
From Debian Bookworm polkitd v122 is installed by default.
If you want to install it on Bullseye you need to add the Bookworm repositories to `/etc/apt/sources.list`
```shell
deb http://deb.debian.org/debian bookworm main contrib non-free
deb http://deb.debian.org/debian-security/ bookworm-security main contrib non-free
deb http://deb.debian.org/debian bookworm-updates main contrib non-free
```
then install polkitd package
```shell
apt update && apt install -y polkitd
# reboot the system as conflicting systemd daemons are not replaced properly
sudo reboot
# then check the version of polkitd
systemctl status polkit 
# Started polkitd version 122
```

If you get errors about missing public keys during `apt update` try to add the keys manually
```shell
# W: GPG error: http://security.debian.org/debian-security stable-security InRelease: The following signatures couldn't be verified because the public key is not available: NO_PUBKEY 54404762BBB6E853 NO_PUBKEY BDE6D2B9216EC7A8
gpg --keyserver keyserver.ubuntu.com --recv-keys 54404762BBB6E853 BDE6D2B9216EC7A8 648ACFD622F3D138 0E98404D386FA1D9 F8D2585B8783D481 0E98404D386FA1D9 6ED0E7B82643E131
# For each of those key run
gpg --armor --export 54404762BBB6E853 | sudo apt-key add -
# ...
# Try apt update again 
apt update
```
