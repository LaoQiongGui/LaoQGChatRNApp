export class Server {
    host: string
    port: number

    constructor(host: string, port: number) {
        this.host = host;
        this.port = port;
    }
}

// export const myServer = new Server('10.0.2.2', 12195);
export const myServer = new Server('101.43.102.43', 12195);