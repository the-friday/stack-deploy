[![Docker Pulls](https://img.shields.io/docker/pulls/thefriday/stack-deploy.svg)](https://hub.docker.com/r/thefriday/stack-deploy/)
[![](https://images.microbadger.com/badges/image/thefriday/stack-deploy.svg)](https://microbadger.com/images/thefriday/stack-deploy "Get your own image badge on microbadger.com")

# Stack deploy

Command line application for deploying stack and updating services in Docker 
swarm clusters under [Portainer](https://github.com/portainer/portainer) control.

Supports the exit codes (`0` for successful and `1` for error), you can use it on ci/cd systems.

You can use it from cloned source as `npm start <command>` or as docker container `docker run --rm thefriday/stack-deploy <command>`

## Supported commands

`help` - show help information

`help <command>` - show help for command

`deployStack` - deploy/update stack to cluster, see options below.

`deployImage` - update service in cluster with new image (creating new services in plan). This command await start/fail 
new version of service and print it to console.


## Deploy stack

For deploy/update stack in cluster you can use next flags:

| Flag | Require / default value | Description |
| -----| --------| ------------|
| --url| true | Portainer url with `/api` suffix, example `http://example.com/api`|
| --user| true| Portainer username, please create dedicated user for this tool |
| --password | true | Portainer password |
| --stack | true | Stack name |
| --endpoint | true | Endpoint ID for deploy/update stack |
| --stackFile | false / docker-stack.yml | Stack file path|
| --env | false | Environment variables for stack file, not required if you dont use their). If you update stack, you can not add this keys for not changed variables. They are taken from deployed stack.
| --help | false | Show help for command |

**If use docker version** please mount directory with stack file into container and use path into container.

## Deploy service

For update service in cluster you can use next flags:

| Flag | Require / default value | Description |
| -----| --------| ------------|
| --url| true | Portainer url with `/api` suffix, example `http://example.com/api`|
| --user| true| Portainer username, please create dedicated user for this tool |
| --password | true | Portainer password |
| --stack | false | Stack name, if your service in stack - add stack name for name resolving |
| --endpoint | true | Endpoint ID for update service |
| --serviceName | true | Service name for update |
| --image | true | Image name/url for updating service |
| --help | false | Show help for command |

**Creating new services currently not available.**