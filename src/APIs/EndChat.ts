import axios from "axios";
import { Server } from "../Common/Server";
import { AuthInfo } from "../Account/AuthEntity";
import { LaoQGError } from "../Common/Errors";

export interface EndChatProps {
    server: Server,
    authInfo: AuthInfo,
    sessionId: string,
}

export const EndChat = async (props: EndChatProps): Promise<void> => {
    // 输入参数检测
    check(props);

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

    const res = await axios.post(url, data, config);

    // 网络异常
    if (res.status !==200) {
        throw new LaoQGError(300, "ECMRN00", "网络异常。");
    }

    // 后端业务异常
    if (res.data.common.status !==0) {
        throw new LaoQGError(
            res.data.common.status,
            res.data.common.message_code,
            res.data.common.message_text
        );
    }

    // 正常返回
    return;
}

const check = (props: EndChatProps) => {
    // 登录检测
    if (!props.authInfo.loginToken) {
        throw new LaoQGError(200, "EAURN00", "请先登录。");
    }
}
