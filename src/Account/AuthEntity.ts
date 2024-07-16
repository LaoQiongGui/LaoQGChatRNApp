import uuid from 'react-native-uuid';

class AuthEntity {
    private instanceId: string
    userName: string
    password: string
    loginToken: string

    constructor(
        userName: string = '',
        password: string = '',
        loginToken: string = '',
    ) {
        this.instanceId = uuid.v4() as string;
        this.userName = userName;
        this.password = password;
        this.loginToken = loginToken;
    }

    public getInstanceId(): string {
        return this.instanceId;
    }
}

export {
    AuthEntity,
}