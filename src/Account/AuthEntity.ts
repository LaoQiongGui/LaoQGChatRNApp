import uuid from 'react-native-uuid';

class AuthEntity {
    private instanceId: string
    userName: null | string
    password: null | string
    loginToken: null | string
    permission: null | string

    constructor(
        userName: string = '',
        password: string = '',
        loginToken: string = '',
        permission: string = 'normal',
    ) {
        this.instanceId = uuid.v4() as string;
        this.userName = userName;
        this.password = password;
        this.loginToken = loginToken;
        this.permission = permission;
    }

    public getInstanceId(): string {
        return this.instanceId;
    }
}

export {
    AuthEntity,
}