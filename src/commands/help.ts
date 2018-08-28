import {Command} from './command';
import commandLineUsage, {Content, OptionList, Section} from 'command-line-usage';
import commandLineArgs from 'command-line-args';

export class Help extends Command {
  name = 'help';
  description = 'Shows this help message, or help with a specific command';
  defaultOption = true;
  args = [{
    name:          'command',
    typeLabel:     '<command>',
    type:          String,
    description:   'Show help for command',
    defaultOption: true,
  }];

  commands: Map<string, Command>;

  constructor(commands: Map<string, Command>) {
    super();
    this.commands = commands;
  }

  async run(argv: string[]) {
    const parsedArgs = commandLineArgs(this.args, {argv});
    const commandName = parsedArgs.command;
    if (commandName && commandName !== 'help') {
      const command = this.commands.get(commandName);
      if (command) {
        // @ts-ignore
        return this.help(command.getHelp());
      } else {
        console.warn(`Command ${commandName} not found.`);
      }
    }
    this.help();
  }

  help(commandHelp?: any) {
    const commandsContent: Array<{
      [name: string]: any | string
    }> = [];
    this.commands.forEach((command) => {
      commandsContent.push({
        name:    command.name,
        summary: command.description
      });
    });

    const sections = [
      {
        header:  'Deployer app',
        content: 'Deploy docker stacks, images using portainer api'
      }
    ];
    if (commandHelp) {
      Array.isArray(commandHelp) ? sections.push(...commandHelp) : sections.push(commandHelp);
    }
    // @ts-ignore
    sections.push({
      header:  'Command List',
      content: commandsContent
    });
    const usage = commandLineUsage(sections);
    console.log(usage);
    console.log('Run `stack help <command>` for help with a specific command');
  }
}