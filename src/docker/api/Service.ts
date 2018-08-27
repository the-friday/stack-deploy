import {Request, RequestType, Response} from '../../utils/Request';
import {Filter} from '../filter';
import {ServiceSpec} from '../models/Service';

export class ServiceListRequest extends Request {
  type = RequestType.GET;
  path = '/endpoints/{endpointId}/docker/services';

  constructor(endpointId: number, filter: Filter) {
    super();
    this.setParam('endpointId', endpointId);
    this.query = {filters: filter.toString()};
  }
}

export class ServiceListResponse implements Response {
  data: Object[];

  constructor(data: Object[]) {
    this.data = data;
  }
}

export class ServiceUpdateRequest extends Request {
  type = RequestType.POST;
  path = '/endpoints/{endpointId}/docker/services/{serviceId}/update';

  constructor(endpointId: number, serviceSpec: ServiceSpec, serviceId: string, version: number) {
    super();
    this.setParam('endpointId', endpointId);
    this.setParam('serviceId', serviceId);
    this.query = {version};
    this.body = serviceSpec;
  }
}

export class ServiceUpdateResponse implements Response {
  response: any;

  constructor(response: any) {
    this.response = response;
  }
}