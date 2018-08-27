export const enum RequestType {
  GET = 'get',
  POST = 'post',
  PUT = 'put'
}

export type PathParams = {
  [name: string]: any;
}
export type Params = {
  [name: string]: any;
}

export interface Response {
  [name: string]: any;
}

export abstract class Request {
  public readonly type!: RequestType;
  public readonly path: string = '';
  public pathParams: PathParams = {};
  public body: Params | undefined;
  public query!: any;

  setParam(name: string, value: any): void {
    this.pathParams[name] = value;
  }
}