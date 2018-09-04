import {Command} from './command';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import chalk from 'chalk';
import Ora from 'ora';
import path from 'path';
import fs from 'fs';
import {PortainerClient} from '../portainer/Client';
import {StacksRepository} from '../portainer/Stacks';
import {
  StackCreateRequest,
  StacksCreateResponse,
  StacksUpdateResponse,
  StackUpdateRequest
} from '../portainer/api/Stacks';
import {SwarmRequest, SwarmResponse} from '../docker/api/Swarm';
import {Swarm} from '../docker/models/Swarm';
import {Stack, StackEnv} from '../portainer/models/Stack';

export class DeployStack extends Command {
  name = 'deployStack';
  description = 'Deploy stack to selected swarm cluster';
  example = 'Some example';
  args = [
    {
      name:        'url',
      type:        String,
      description: 'Portainer url',
      group:       'required',
      typeLabel:   'http://example.com/api'
    },
    {
      name:        'user',
      type:        String,
      description: 'Portainer username',
      group:       'required',
      typeLabel:   '<user>'
    },
    {
      name:        'password', type: String,
      description: 'Portainer password',
      group:       'required',
      typeLabel:   '<password>'
    },
    {
      name:        'stack',
      type:        String,
      description: 'Stack name',
      group:       'required',
      typeLabel:   '<stack>'
    },
    {
      name:        'endpoint',
      type:        Number,
      description: 'Endpoint id',
      group:       'required',
      typeLabel:   '<endpointID>'
    },
    {
      name:         'stackFile',
      type:         String,
      description:  'Docker stack file',
      group:        'required',
      typeLabel:    '<docker-stack.yml>',
      defaultValue: 'docker-stack.yml'
    },
    {
      name:        'env',
      type:        String,
      description: 'Environment variables for stack',
      typeLabel:   'ENV1=test',
      multiple:    true
    },
    {
      name:        'help',
      type:        Boolean,
      description: 'Show help'
    }
  ];
  client!: PortainerClient;

  async run(argv: string[]) {
    const {_all: {help, env}, required} = commandLineArgs(this.args, {argv});
    // validate input
    const emptyArguments = this.emptyArguments(required);
    if (emptyArguments || help) {
      if (emptyArguments) {
        console.log(chalk.red(`\nFields "${emptyArguments}" are empty, but required`));
        throw new Error('REQUIRED_FIELDS_ARE_EMPTY');
      }

      console.log(commandLineUsage(this.getHelp()));
    }

    const authProgress = Ora('Authenticating').start();
    this.client = new PortainerClient(required.url);
    try {
      await this.client.auth(required.user, required.password);
      authProgress.succeed('Authenticated');
    } catch (e) {
      authProgress.fail('Authentication failed');
      throw e;
    }

    const stacks = new StacksRepository(this.client);
    const stacksList = await stacks.getStacksList();
    const currentStack = stacksList.filterByName(required.stack);
    // If stack already published - update him
    if (currentStack) {
      await this.updateStack(currentStack, required, env);
    }
    // Or create new one
    else {
      await this.createStack(required, env);
    }
  }

  async updateStack(stack: Stack, params: { [name: string]: any }, varsInParams: string[]) {
    const updateProgress = Ora(`Updating stack "${stack.Name}"`).start();
    try {
      const env = this.buildEnv({
        newVars:      varsInParams,
        requiredVars: this.getStackEnvironments(params.stackFile),
        deployedVars: stack.Env
      });
      // get file data
      const file = this.getFile(params.stackFile);

      const request = new StackUpdateRequest(stack.Id, file, env, params.endpoint);
      const data = await this.client.execute(request, StacksUpdateResponse);
      // console.log(data);
      updateProgress.succeed(`Stack "${stack.Name}" successfully updated`);
    } catch (e) {
      updateProgress.fail(`Error occurred for updating stack "${stack.Name}"`);
      throw e;
    }
  }

  async createStack(params: { [name: string]: any }, varsInParams: string[]) {
    const stackName = params.stack;
    const updateProgress = Ora(`Creating new stack "${stackName}"`).start();
    try {
      const env = this.buildEnv({
        newVars:      varsInParams,
        requiredVars: this.getStackEnvironments(params.stackFile)
      });
      // get file data
      const file = this.getFile(params.stackFile);
      // swarm data
      const swarmResponse = await this.client.execute(new SwarmRequest(params.endpoint), SwarmResponse);
      const swarm = new Swarm(swarmResponse.data);

      const request = new StackCreateRequest(stackName, file, env, params.endpoint, swarm.ID);
      const data = await this.client.execute(request, StacksCreateResponse);
      updateProgress.succeed(`Stack "${stackName}" successfully created`);
    } catch (e) {
      updateProgress.fail(`Error occurred for create stack "${stackName}"`);
      throw e;
    }
  }

  buildEnv({newVars = [], deployedVars = [], requiredVars = []}: { newVars: string[], requiredVars: string[], deployedVars?: StackEnv[] }) {
    const envMap = new Map();
    const env: StackEnv[] = [];
    if (deployedVars.length) {
      deployedVars.forEach(({name, value}) => envMap.set(name, value));
    }
    if (newVars.length) {
      newVars
        .map(string => string.split('='))
        .forEach(([name, value]) => envMap.set(name, value));
    }
    const variables = Array.from(envMap.keys());
    const unusedVars = requiredVars.filter(v => variables.indexOf(v) === -1);
    if (unusedVars.length !== 0) {
      console.error(chalk.red(`\n Vars "${unusedVars}" used in stack file are not defined.`));
      throw new Error('Fill all vars');
    }
    // create objects with values
    envMap.forEach((value, name) => env.push({name, value}));

    return env;
  }

  getStackEnvironments(file: string): Array<string> {
    const string = this.getFile(file);
    const variables = new Set(string.match(/\${(\w+)}/g));
    return Array.from(variables.values()).map(v => v.replace(/\${(\w+)}/, '$1'));
  }

  getFile(filename: string) {
    const fullPath = path.resolve(process.cwd(), filename);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath).toString().replace(/\r/, '\\n');
    } else {
      throw new Error(`File ${fullPath} not found`);
    }
  }

  getHelp() {
    return {
      header:     'Options for deploy stack',
      optionList: this.args
    };
  }
}