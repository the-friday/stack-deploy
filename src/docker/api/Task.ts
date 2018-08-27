import {Request, RequestType, Response} from '../../utils/Request';
import {Filter} from '../filter';
import {Task} from '../models/Task';

export class TaskRequest extends Request {
  type = RequestType.GET;
  path = '/endpoints/{endpointId}/docker/tasks';

  constructor(endpointId: number, filter: Filter) {
    super();
    this.setParam('endpointId', endpointId);
    this.query = {filters: filter.toString()};
  }
}

export class TaskResponse implements Response {
  tasks: Task[];

  constructor(tasks: Task[]) {
    this.tasks = tasks;
  }
}