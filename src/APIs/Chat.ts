import axios, { AxiosResponse } from "axios";
import { Server } from "../Common/Server";
import { CommonRes } from "./CommonAPI";
import { AuthEntity } from "../Account/AuthEntity";
import { LaoQGError } from "../Common/Errors";

export interface ChatProps {
    server: Server,
    authInfo: AuthEntity,
    sessionId: string,
    question: string,
}

export interface ChatRes {
    sessionId: string,
    answer: string,
}

export const Chat = (props: ChatProps): Promise<AxiosResponse<CommonRes<ChatRes>>> => {
    if (!props.authInfo.loginToken) {
        throw new LaoQGError(200, "请先登录。");
    }

    const url = `http://${props.server.host}:${props.server.port}/Chat/Chat`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'LoginToken': props.authInfo.loginToken,
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