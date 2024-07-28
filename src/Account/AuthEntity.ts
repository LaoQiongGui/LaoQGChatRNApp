import uuid from 'react-native-uuid';

export class UserInfo {
    userName: null | string
    password: null | string

    constructor(
        userName: string = '',
        password: string = '',
    ) {
        this.userName = userName;
        this.password = password;
    }
}

export class AuthInfo {
    private instanceId: string
    loginToken: null | string
    permission: null | string

    constructor(
        loginToken: string = '',
        permission: string = 'normal',
    ) {
        this.instanceId = uuid.v4() as string;
        this.loginToken = loginToken;
        this.permission = permission;
    }

    public getInstanceId(): string {
        return this.instanceId;
    }

    public copy(): AuthInfo {
        return new AuthInfo(String(this.loginToken), String(this.permission));
    }
}
