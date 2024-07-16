import axios, { AxiosResponse } from "axios";
import { Server } from "../Common/Server";
import { CommonRes } from "./CommonAPI";

export interface EndChatProps {
    server: Server,
    sessionId: string,
}

export const EndChat = (props: EndChatProps): Promise<AxiosResponse<CommonRes<void>>> => {
    const url = `http://${props.server.host}:${props.server.port}/Chat/EndChat`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'LoginToken': '6b1b4459-2c6f-4938-bc8d-2a3ef0c0dba6',
        },
        timeout: 6000,
    };
    const data = {
        SessionId: props.sessionId,
    };

    console.log(url);
    return axios.post(url, data, config);
}