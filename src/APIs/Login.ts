import axios from "axios";
import { Server } from "../Common/Server";
import CryptoJS from 'crypto-js';
import { LaoQGError } from "../Common/Errors";

export interface LoginProps {
    server: Server,
    userName: string,
    password: string,
}

export interface LoginRes {
    loginToken: string,
    permission: string,
}

export const Login = async (props: LoginProps): Promise<LoginRes> => {
    // 输入参数检测
    check(props);

    const url = `http://${props.server.host}:${props.server.port}/Auth/Login`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 6000,
    };
    const data = {
        Username: props.userName,
        Password: CryptoJS.MD5(props.password).toString()
    };

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

    // 未知业务异常
    if (!res.data.data) {
        throw new LaoQGError(200, "ECMRN00", "未知业务异常。");
    }

    // 正常返回
    return res.data.data;
}

const check = (props: LoginProps) => {
    // 账号密码格式检测
    if (!props.userName || !props.password) {
        throw new LaoQGError(100, "WCMRN00", "账号密码不能为空。");
    }

    // 账号密码格式检测
    if (props.userName.length < 8 || props.password.length < 8) {
        throw new LaoQGError(100, "WCMRN00", "账号或密码长度至少为8。");
    }
}