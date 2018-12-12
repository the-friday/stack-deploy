export enum TaskStates {
  running = 'running',
  shutdown = 'shutdown',
  prepare = 'prepare'
}

export type Task = {
  ID: string,
  CreatedAt: string,
  UpdatedAt: string,
  Status: {
    Timestamp: string,
    State: string,
    Message: string,
    ContainerStatus: {
      ContainerID: string
    },
    Err: string
  },
  DesiredState: TaskStates
}