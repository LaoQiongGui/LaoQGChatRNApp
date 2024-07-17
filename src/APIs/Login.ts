import axios, { AxiosResponse } from "axios";
import { Server } from "../Common/Server";
import CryptoJS from 'crypto-js';
import { CommonRes } from "./CommonAPI";

export interface LoginProps {
    server: Server,
    userName: string,
    password: string,
}

export interface LoginRes {
    loginToken: string,
    permission: string,
}

export const Login = (props: LoginProps): Promise<AxiosResponse<CommonRes<LoginRes>>> => {
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

    console.log(url);
    return axios.post(url, data, config);
}