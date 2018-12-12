import {Command} from './command';
import {Filter} from '../docker/filter';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import chalk from 'chalk';
import Ora from 'ora';
import {PortainerClient} from '../portainer/Client';
import {StacksRepository} from '../portainer/Stacks';
import {
  ServiceListRequest,
  ServiceListResponse,
  ServiceUpdateRequest,
  ServiceUpdateResponse
} from '../docker/api/Service';
import {Service} from '../docker/models/Service';
import {TaskRequest, TaskResponse} from '../docker/api/Task';
import {TaskStates} from '../docker/models/Task';

export class DeployService extends Command {
  name = 'deployService';
  description = 'Deploy image to selected stack';
  example = '';
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
      name:        'password',
      type:        String,
      description: 'Portainer password',
      group:       'required',
      typeLabel:   '<password>'
    },
    {
      name:        'stack',
      type:        String,
      description: 'Stack name',
      typeLabel:   '<stack>'
    },
    {
      name:        'serviceName',
      type:        String,
      description: 'Service name from stack file',
      group:       'required',
      typeLabel:   '<service>'
    },
    {
      name:        'endpoint',
      type:        Number,
      description: 'Endpoint id',
      group:       'required',
      typeLabel:   '<endpointID>'
    },
    {
      name:        'image',
      type:        String,
      description: 'New image',
      group:       'required',
      typeLabel:   '<image>'
    },
    {
      name:        'help',
      type:        Boolean,
      description: 'Show help'
    }
  ];
  client!: PortainerClient;

  async run(argv: string[]): Promise<any> {
    const {_all: {help,}, _all: args, required} = commandLineArgs(this.args, {argv});
    // validate input
    const emptyArguments = this.emptyArguments(required);
    if (emptyArguments || help) {
      if (emptyArguments) {
        console.log(chalk.red(`\nFields "${emptyArguments}" are empty, but required`));
        throw new Error('REQUIRED_FIELDS_ARE_EMPTY');
      }
      console.log(commandLineUsage(this.getHelp()));
      return;
    }

    const authProgress = Ora('Authenticating').start();
    this.client = new PortainerClient(args.url);
    try {
      await this.client.auth(args.user, args.password);
      authProgress.succeed('Authenticated');
    } catch (e) {
      authProgress.fail('Authentication failed');
      throw e;
    }

    if (args.stack) {
      const stacks = new StacksRepository(this.client);
      const stacksList = await stacks.getStacksList();
      const currentStack = stacksList.filterByName(args.stack);
      // If stack already published - update him
      if (!currentStack) {
        throw new Error(`Stack with name "${args.stack}" not found`);
      }
    }
    const serviceName = this.getServiceName(args);
    const filter = new Filter();
    filter.add('name', serviceName);
    const data = await this.client.execute<ServiceListResponse>(
      new ServiceListRequest(args.endpoint, filter),
      ServiceListResponse
    );
    const currentService = data.data.length ? new Service(data.data[0]) : null;
    if (!currentService) {
      throw new Error(`Service "${serviceName}" not found"`);
    }
    const result = await this.updateService(currentService, args.image, args.endpoint);
  }

  getServiceName(params: any) {
    if (params.stack) {
      return `${params.stack}_${params.serviceName}`;
    } else {
      return params.serviceName;
    }
  }

  async updateService(service: Service, image: string, endpointId: number) {
    const ora = Ora(`Updating service "${service.getName()}"`).start();
    try {
      const config = service.getConfig();
      // As explained in https://github.com/docker/swarmkit/issues/2364 ForceUpdate can accept a random
      // value or an increment of the counter value to force an update.
      config.TaskTemplate.ForceUpdate++;
      if (image) {
        config.TaskTemplate.ContainerSpec.Image = image;
      }

      const result = await this.client.execute<ServiceUpdateResponse>(
        new ServiceUpdateRequest(endpointId, config, service.ID, service.getVersion()),
        ServiceUpdateResponse
      );

      if (result.response.Warnings === null) {
        await this.checkUpdateStatus(service, endpointId);
      } else {
        console.warn(ora.warn(`Warning when updating service "${service.getName()}": ${result.response.Warnings}`));
        console.warn(result);
      }

      ora.succeed(`Service "${service.getName()}" successfully updated`);
    } catch (e) {
      ora.fail(e);
    }
  }

  checkUpdateStatus(service: Service, endpointId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let taskId: string = '';
      const interval = setInterval(async () => {
        let filter = new Filter();
        // build filter for task
        if (!taskId) {
          filter.add('service', service.ID);
          filter.add('_up-to-date', 'true');
        } else {
          filter.add('id', taskId);
        }
        // getting task
        const result = await this.getTasksForService(endpointId, filter);
        const task = result.tasks[0];
        taskId = task.ID;
        if (task.DesiredState === TaskStates.shutdown) {
          clearInterval(interval);
          reject(`Update failed "${task.Status.Err || 'canceled'}"`);
        } else if (task.Status.Message === 'started' && task.Status.State === 'running') {
          clearInterval(interval);
          resolve(true);
        }
      }, 5000);
    });
  }

  async getTasksForService(endpointId: number, filter: Filter): Promise<TaskResponse> {
    return await this.client.execute<TaskResponse>(
      new TaskRequest(endpointId, filter),
      TaskResponse
    );
  }

  getHelp() {
    return {
      header:     'Options for deploy image',
      optionList: this.args
    };
  }
}