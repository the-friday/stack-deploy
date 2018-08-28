import {Command} from './commands/command';
import commandLineArgs from 'command-line-args';
/**
 * Commands
 */
import {DeployStack} from './commands/deployStack';
import {DeployService} from './commands/deployService';
import {Help} from './commands/help';

export class Updater {
  commands = new Map();

  constructor() {
    // register commands
    this.addCommand(new DeployStack());
    this.addCommand(new DeployService());
    this.addCommand(new Help(this.commands));
  }

  addCommand(command: Command) {
    this.commands.set(command.name, command);
  }

  run(argv: string[]) {
    const helpCommand = this.commands.get('help');
    const parsedArgs = commandLineArgs([{name: 'command', defaultOption: true}], {
      argv,
      stopAtFirstUnknown: true
    });
    const command = this.commands.get(parsedArgs.command);
    const args = parsedArgs._unknown || [];
    if (!command) {
      return helpCommand.run();
    }

    command.run(args);
  }
}
