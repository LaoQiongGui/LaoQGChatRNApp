import axios from "axios";
import { Server } from "../Common/Server";
import { AuthInfo } from "../Account/AuthEntity";
import { LaoQGError } from "../Common/Errors";

export interface ChatProps {
    server: Server,
    authInfo: AuthInfo,
    sessionId: string,
    question: string,
}

export interface ChatRes {
    sessionId: string,
    answer: string,
}

export const Chat = async (props: ChatProps): Promise<ChatRes> => {
    // 输入参数检测
    check(props);

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

    const res = await axios.post(url, data, config);

    // 网络异常
    if (res.status !== 200) {
        throw new LaoQGError(300, "ECMRN00", "网络异常。");
    }

    // 后端业务异常
    if (res.data.common.status !== 0) {
        throw new LaoQGError(
            res.data.common.status,
            res.data.common.message_code,
            res.data.common.message_text
        );
    }

    // 未知业务异常
    if (!res.data.data) {
        throw new LaoQGError(200, "ECMRN00", "未知业务异常。");
    }

    // 正常返回
    return res.data.data;
}

const check = (props: ChatProps) => {
    // 检测提问内容是否为空
    if (!props.question) {
        throw new LaoQGError(100, "WCMRN00", "请输入提问内容");
    }

    // 登录检测
    if (!props.authInfo.loginToken) {
        throw new LaoQGError(200, "EAURN00", "请先登录。");
    }
}
