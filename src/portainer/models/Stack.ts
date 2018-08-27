export const enum StackType {
    Swarm = 1,
    Compose = 2
}

export class StackEnv {
    'Name': string;
    'Value': string;
}

export class Stack {
    /**
     * Stack identifier
     */
    'Id': number;
    /**
     * Stack name
     */
    'Name': string;
    /**
     * Stack type. 1 for a Swarm stack, 2 for a Compose stack
     */
    'Type': StackType;
    /**
     * Endpoint identifier. Reference the endpoint that will be used for deployment
     */
    'EndpointID': number;
    /**
     * Path to the Stack file
     */
    'EntryPoint': string;
    /**
     * Cluster identifier of the Swarm cluster where the stack is deployed
     */
    'SwarmID': string;
    /**
     * Path on disk to the repository hosting the Stack file
     */
    'ProjectPath': string;
    /**
     * A list of environment variables used during stack deployment
     */
    'Env': Array<StackEnv>;


    constructor(data: Object) {
        Object.assign(this, data);
    }
}