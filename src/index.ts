import 'source-map-support/register';
import {Updater} from './updater';
import chalk from 'chalk';

process.on('uncaughtException', (err) => {
  console.error(chalk.redBright(err.message));
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error(chalk.redBright(reason.message));
  if (process.env.NODE_ENV === 'development') {
    console.log(reason);
  }
  process.exit(1);
});

let argv = process.argv;
// if process started from NPM - get args from npm
if (process.env.npm_config_argv) {
  const npmArgv = JSON.parse(process.env.npm_config_argv);
  argv = npmArgv.original;
  // remove first argument
  argv.shift();
}
const updater = new Updater();
updater.run(argv);
