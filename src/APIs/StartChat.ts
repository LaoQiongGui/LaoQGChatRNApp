import axios from "axios";
import DeviceInfo from "react-native-device-info";
import { AuthInfo } from "../Account/AuthEntity";
import { ChatQuestionContent } from "../Chat/ChatSessionEntity";
import { LaoQGError } from "../Common/Errors";
import { Server } from "../Common/Server";
import { ChatRes } from "./Chat";

export interface StartChatProps {
    server: Server,
    authInfo: AuthInfo,
    questionContents: ChatQuestionContent[],
}

export const StartChat = async (props: StartChatProps): Promise<ChatRes> => {
    // 输入参数检测
    check(props);

    const url = `http://${props.server.host}:${props.server.port}/Chat/StartChat`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Version': DeviceInfo.getVersion(),
            'LoginToken': props.authInfo.loginToken,
        },
        timeout: 120000,
    };
    const data = {
        contents: props.questionContents,
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

const check = (props: StartChatProps) => {
    // 检测提问内容是否为空
    if (!props.questionContents) {
        throw new LaoQGError(100, "WCMRN00", "请输入提问内容");
    }

    // 登录检测
    if (!props.authInfo.loginToken) {
        throw new LaoQGError(200, "EAURN00", "请先登录。");
    }
}
