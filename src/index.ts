import 'source-map-support/register'
import {Updater} from './updater';
import chalk     from 'chalk';

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

const updater = new Updater(process.argv);
updater.run();
