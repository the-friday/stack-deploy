import {Request, RequestType, Response} from '../../utils/Request';

export class AuthRequest extends Request {
    path = '/auth';
    type = RequestType.POST;

    constructor(username: string, password: string) {
        super();
        this.body = {
            Username: username,
            Password: password
        }
    }
}

export class AuthResponse implements Response {
    public jwt: string;

    constructor({jwt}: Response) {
        // console.log(data);
        this.jwt = jwt;
    }
}