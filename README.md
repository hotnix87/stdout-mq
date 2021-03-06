# stdout-mq
[![Build Status](https://travis-ci.com/StyleT/stdout-mq.svg?branch=master)](https://travis-ci.com/StyleT/stdout-mq)

Pino-mq will take all messages received on process.stdin and send them over a message bus using JSON serialization;

## Installation

```
npm install -g stdout-mq
```

## Quick Example

Bash pipes:
```
node app.js 2>&1 | stdout-mq -u "amqp://guest:guest@localhost/" -q "pino-logs"
```

Via sub-process, optimized for use with Docker:
```
stdout-mq -u "amqp://guest:guest@localhost/" -q "pino-logs" --spawnProcess="node app.js"
```

## Command line switches

- `--type` (`-t`): MQ type of transport to be used (default 'RABBITMQ')
- `--uri` (`-u`): uri for connecting to MQ broker
- `--queue` (`-q`): queue to be used for sending messages
- `--fields` (`-f`): comma separated fields for filtering messages before sending
- `--exchange` (`-e`): exchange name to be used in case of rabbitmq transport
- `--config` (`-c`): path to config file (JSON); switches take precedence
- `--generateConfig` (`-g`): create pino-mq.json config file with default options
- `--help` (`-h`): display help
- `--version` (`-v`): display version
- `--wrapWith` (`-ww`): wrap a message with custom data where %DATA% will be replaced with a message e.g. `{"data": "%DATA%", "customProp": "customData"}`
- `--spawnProcess` (`-sp`): Spawns a sub-process using specified command & listens it's stdout/stderr

## Configuration JSON File
by using `--generateConfig` it will create `pino-mq.json` file with all available configuration 
options;

```
{
 "type": "RABBITMQ",
 "uri": "amqp://guest:guest@localhost/",
 "exchange": "",
 "queue": "stdout-mq",
 "fields": []
}
```

## Broker connection
* `uri` option will follow URI specification for defining connection to a host:

    ```
    <protocol>://[user[:password]@]host[:port][/path][?query]
    ```
    where `protocol`, `path` and `fragment` will be specific for each type of broker

## Configuration via environment variables
You may specify `MQ_PROTOCOL`, `MQ_LOGIN`, `MQ_PASSWORD`, `MQ_HOST` as env variables, these variables are going to be used to create URI for connecting to MQ broker, in this way, you can avoid using `--uri` (`-u`) param in CLI

## Queues configuration
queue configuration has a priority in defining behaviour for stdout-mq; if more than one is specified, configuration will take this precedence:

1. `queue` all messages will be sent on this queue

#### RabbitMQ specific options
For RabbitMQ type there is an extra option: 
* `--exchange`: if you want to use a specific exchange for your queues or you want to use topics instead of queues than you have to pass it to pino-mq configuration; topics are a more powerful distribution mechanism than queues and explaining it is beyond the scope of this module ([RabbitMQ Topics tutorial](https://www.rabbitmq.com/tutorials/tutorial-five-javascript.html))


## Fields filtering
in case is needed to filter log messages fields you can use `fields` option:
* from command line:
    * `--fields "time,level,msg"`
* from configuration json file:
    * `"fields":["time","level","msg"]`

## LICENSE
[Apache-2.0 License](https://github.com/StyleT/stdout-mq/blob/master/LICENSE.txt)
