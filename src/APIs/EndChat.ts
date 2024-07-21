import axios, { AxiosResponse } from "axios";
import { Server } from "../Common/Server";
import { CommonRes } from "./CommonAPI";
import { AuthEntity } from "../Account/AuthEntity";
import { LaoQGError } from "../Common/Errors";

export interface EndChatProps {
    server: Server,
    authInfo: AuthEntity,
    sessionId: string,
}

export const EndChat = (props: EndChatProps): Promise<AxiosResponse<CommonRes<void>>> => {
    if (!props.authInfo.loginToken) {
        throw new LaoQGError(200, "请先登录。");
    }

    const url = `http://${props.server.host}:${props.server.port}/Chat/EndChat`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'LoginToken': props.authInfo.loginToken,
        },
        timeout: 6000,
    };
    const data = {
        SessionId: props.sessionId,
    };

    console.log(url);
    return axios.post(url, data, config);
}