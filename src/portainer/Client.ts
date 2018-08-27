import {HttpClient} from "../utils/HttpClient";
import {AuthRequest, AuthResponse} from "./api/Auth";

export class PortainerClient extends HttpClient {
    public async auth(login: string, password: string) {
        const authResponse = await this.execute<AuthResponse>(
            new AuthRequest(login, password),
            AuthResponse
        );
        this.setToken(authResponse.jwt);
        return true;
    }
}