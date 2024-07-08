import uuid from 'react-native-uuid';

class SessionContext {
    static get QUESTION() { return 0; }
    static get ANSWER() { return 1; }
    static get OPTION() { return 2; }

    flag: number
    content: string

    constructor(flag: number, content: string) {
        this.flag = flag;
        this.content = content;
    }
}

class SessionEntity {
    private instanceId: string
    sessionId: string | null
    title: string
    context: SessionContext[]
    options: SessionContext[]

    constructor(
        sessionId: string = '',
        title: string = '',
        context: SessionContext[] = [],
        options: SessionContext[] = [],
    ) {
        this.instanceId = uuid.v4() as string;
        this.sessionId = sessionId;
        this.title = title;
        this.context = context;
        this.options = options;
    }

    public getInstanceId(): string {
        return this.instanceId;
    }
}

export {
    SessionContext,
    SessionEntity,
}