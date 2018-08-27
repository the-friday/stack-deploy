import {Request, RequestType, Response} from "../../utils/Request";
import {StackEnv, StackType} from "../models/Stack";

export class StacksFilter {
    EndpointID!: string;
    SwarmID!: string;

    toString(): string {
        return JSON.stringify({"EndpointID": this.EndpointID, "SwarmID": this.SwarmID});
    }
}

export class StacksListRequest extends Request {
    type = RequestType.GET;
    path = '/stacks';

    constructor(filter?: StacksFilter) {
        super();
        this.query = filter;
    }
}

export class StacksListResponse implements Response {
    items: [Object];

    constructor(data: [Object]) {
        this.items = data;
    }
}

export class StackUpdateRequest extends Request {
    type = RequestType.PUT;
    path = '/stacks/{id}';

    constructor(id: number, fileContent: string, env: Array<StackEnv>, endpointId: number) {
        super();
        this.setParam('id', id);
        this.query = {
            endpointId
        };
        this.body = {
            Env: env,
            StackFileContent: fileContent,
            Prune: true
        };
    }
}

export class StacksUpdateResponse implements Response {
    data: Object;

    constructor(data: Object) {
        this.data = data;
    }
}

export class StackCreateRequest extends Request {
    type = RequestType.POST;
    path = '/stacks';

    constructor(name: string, fileContent: string, env: Array<StackEnv>, endpointId: number, swarmId: string) {
        super();
        this.query = {
            'type': StackType.Swarm,
            'method': 'string',
            'endpointId': endpointId,
        };
        this.body = {
            Name: name,
            StackFileContent: fileContent,
            Env: env,
            SwarmID: swarmId
        }
    }
}

export class StacksCreateResponse implements Response {
    data: Object;

    constructor(data: Object) {
        this.data = data;
    }
}
