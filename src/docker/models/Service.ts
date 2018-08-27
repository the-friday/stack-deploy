export type ServiceSpec = {
  Name: string;
  Labels: {
    [name: string]: string
  };
  TaskTemplate: {
    ForceUpdate: number;
    ContainerSpec: {
      Image: string,
      Isolation: string,
      Labels: {
        [name: string]: string
      },
      Priveleges: {
        [name: string]: string
      }
    }
    Networks: {},
    Placement: {},
    Resources: {}
    RestartPolicy: {},
    Runtime: string
  };
  Mode: object;
  UpdateConfig: object;
  Networks: object;
  EndpointSpec: object;
}

export class Service {
  CreatedAt!: string;
  UpdatedAt!: string;
  ID: string = '';
  UpdateStatus!: {
    CompletedAt: string,
    Message: string,
    StartedAt: string,
    State: string
  };
  Spec!: ServiceSpec;
  PreviousSpec!: ServiceSpec;
  Version!: {
    Index: number
  };

  constructor(data: object) {
    Object.assign(this, data);
  }

  getVersion(): number {
    return this.Version.Index;
  }

  getName(): string {
    return this.Spec.Name;
  }

  getConfig(): ServiceSpec {
    return {
      Name:         this.Spec.Name,
      Labels:       this.Spec.Labels,
      TaskTemplate: this.Spec.TaskTemplate,
      Mode:         this.Spec.Mode,
      UpdateConfig: this.Spec.UpdateConfig,
      Networks:     this.Spec.Networks,
      EndpointSpec: this.Spec.EndpointSpec
    };
  }
}