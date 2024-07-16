import axios, { AxiosResponse } from "axios";
import { Server } from "../Common/Server";
import { CommonRes } from "./CommonAPI";

export interface ChatProps {
    server: Server,
    sessionId: string,
    question: string,
}

export interface ChatRes {
    sessionId: string,
    answer: string,
}

export const Chat = (props: ChatProps): Promise<AxiosResponse<CommonRes<ChatRes>>> => {
    const url = `http://${props.server.host}:${props.server.port}/Chat/Chat`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'LoginToken': '6b1b4459-2c6f-4938-bc8d-2a3ef0c0dba6',
        },
        timeout: 120000,
    };
    const data = {
        SessionId: props.sessionId,
        Question: props.question
    };

    console.log(url);
    return axios.post(url, data, config);
}