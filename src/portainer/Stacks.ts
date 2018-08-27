import {PortainerClient} from "./Client";
import {StacksFilter, StacksListRequest, StacksListResponse} from "./api/Stacks";
import {StacksCollection} from "./models/StacksCollection";

export class StacksRepository {
    client: PortainerClient;

    constructor(client: PortainerClient) {
        this.client = client;
    }

    public async getStacksList(filter?: StacksFilter) {
        const data = await this.client.execute<StacksListResponse>(
            new StacksListRequest(filter),
            StacksListResponse
        );
        return new StacksCollection(data.items);
    }
}