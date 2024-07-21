import axios, { AxiosResponse } from "axios";
import { Server } from "../Common/Server";
import { ChatRes } from "./Chat";
import { CommonRes } from "./CommonAPI";
import { AuthEntity } from "../Account/AuthEntity";
import { LaoQGError } from "../Common/Errors";

export interface StartChatProps {
    server: Server,
    authInfo: AuthEntity,
    question: string,
}

export const StartChat = (props: StartChatProps): Promise<AxiosResponse<CommonRes<ChatRes>>> => {
    if (!props.authInfo.loginToken) {
        throw new LaoQGError(200, "请先登录。");
    }

    const url = `http://${props.server.host}:${props.server.port}/Chat/StartChat`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'LoginToken': props.authInfo.loginToken,
        },
        timeout: 120000,
    };
    const data = {
        Question: props.question,
    };

    console.log(url);
    return axios.post(url, data, config);
}