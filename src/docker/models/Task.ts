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
    ContainerStatus: {},
    Err: string
  },
  DesiredState: TaskStates
}