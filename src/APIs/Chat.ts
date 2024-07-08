import { Server } from "../Common/Server";

export interface ChatProps {
    server: Server,
    sessionId: string,
    question: string,
}

export interface ChatRes {
    sessionId: string,
    answer: string,
}

export const Chat = (props: ChatProps): Promise<Response> => {
    const url = `http://${props.server.host}:${props.server.port}/Chat/Chat`;
    const data = {
        SessionId: props.sessionId,
        Question: props.question
    };

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}