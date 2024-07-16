import axios, { AxiosResponse } from "axios";
import { Server } from "../Common/Server";
import { ChatRes } from "./Chat";
import { CommonRes } from "./CommonAPI";

export interface StartChatProps {
    server: Server,
    question: string,
}

export const StartChat = (props: StartChatProps): Promise<AxiosResponse<CommonRes<ChatRes>>> => {
    const url = `http://${props.server.host}:${props.server.port}/Chat/StartChat`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'LoginToken': '6b1b4459-2c6f-4938-bc8d-2a3ef0c0dba6',
        },
        timeout: 120000,
    };
    const data = {
        Question: props.question,
    };

    console.log(url);
    return axios.post(url, data, config);
}