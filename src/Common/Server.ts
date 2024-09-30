import { Platform } from "react-native";

export class Server {
    host: string
    port: number

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;
    }
}

// export const myServer = Platform.OS === 'windows' ? new Server('127.0.0.1', 12195) : new Server('10.0.2.2', 12195);
export const myServer = new Server('101.43.102.43', 12195);
