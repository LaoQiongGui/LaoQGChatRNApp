import uuid from 'react-native-uuid';

type ChatQuestionContentType =
    | 'Text'
    | 'Image'
    | 'Audio'
    | 'ImageOCR';

export interface ChatQuestionContent {
    type: ChatQuestionContentType,
    text?: string,
    imageUrl?: string,
}

type ContentType =
    | 'question'
    | 'answer'
    | 'option';

export interface SessionContext {
    type: ContentType,
    contents: string | ChatQuestionContent[],
}

export class ChatSessionEntity {
    private instanceId: string
    sessionId: string | null
    title: string
    contexts: SessionContext[]
    options: SessionContext[]

    constructor(
        title: string = '',
        contexts: SessionContext[] = [],
        options: SessionContext[] = [],
    ) {
        this.instanceId = uuid.v4() as string;
        this.sessionId = null;
        this.title = title;
        this.contexts = contexts;
        this.options = options;
    }

    public getInstanceId(): string {
        return this.instanceId;
    }
}
