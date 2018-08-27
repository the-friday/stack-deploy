import {Request, RequestType, Response} from "../../utils/Request";

export class SwarmRequest extends Request {
    type = RequestType.GET;
    path = '/endpoints/{endpointId}/docker/swarm';

    constructor(endpointId: number) {
        super();
        this.setParam('endpointId', endpointId);
    }
}

export class SwarmResponse implements Response {
    data: Object;

    constructor(data: Object) {
        this.data = data;
    }
}