import chalk from 'chalk';
import urlJoin from 'url-join';
import {PathParams, Request, RequestType, Response} from './Request';
import {agent, Response as SAResponse, ResponseError, SuperAgent, SuperAgentRequest} from 'superagent';

export class HttpClient {
  client: SuperAgent<SuperAgentRequest>;
  host: string;
  token: string | undefined;

  constructor(host: string, client?: SuperAgent<SuperAgentRequest>) {
    if (!client) {
      client = agent();
    }
    this.client = client;
    this.host = host;
  }

  public setToken(token: string) {
    if (token) {
      this.token = 'Bearer ' + token;
    }
  }

  public async execute<T extends Response>(params: Request, responseType: { new(data: any): T }): Promise<T> {
    return new Promise<T>((resolve) => {
      let request = this.prepareRequest(params);
      if (params.body) {
        request = request.send(params.body);
      }
      if (params.query) {
        request = request.query(params.query);
      }

      request.end((err: ResponseError, response: SAResponse) => {
        if (err) {
          const message = `Error executing request "${err.message}"`;
          console.error(chalk.redBright(message));
          throw err;
        } else {
          resolve(new responseType(response.body));
        }
      });
    });
  }

  private prepareRequest(request: Request): SuperAgentRequest {
    let superAgentRequest: SuperAgentRequest;
    const url = this.getUrl(request.path, request.pathParams);
    switch (request.type) {
      case RequestType.POST:
        superAgentRequest = this.client.post(url);
        break;
      case RequestType.PUT:
        superAgentRequest = this.client.put(url);
        break;
      default:
        superAgentRequest = this.client.get(url);
    }

    if (this.token) {
      superAgentRequest = superAgentRequest.set('Authorization', this.token);
    }
    if (request.isJSON) {
      superAgentRequest = superAgentRequest.set('Accept', 'application/json').set('Content-Type', 'application/json');
    }else{
      superAgentRequest = superAgentRequest.responseType('text')
    }
    
    return superAgentRequest;
  }

  private getUrl(path: string, pathParams: PathParams): string {
    let url = urlJoin(this.host, path);
    url = url.replace(/{([\w-]+)}/g, (fullMatch, key) => {
      var value;
      if (pathParams.hasOwnProperty(key)) {
        value = HttpClient.paramToString(pathParams[key]);
      } else {
        value = fullMatch;
      }
      return encodeURIComponent(value);
    });

    return url;
  }

  private static paramToString(param: any) {
    if (param == undefined || param == null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
  }
}