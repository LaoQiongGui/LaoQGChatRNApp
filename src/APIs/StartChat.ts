import { Server } from "../Common/Server";

export interface StartChatProps {
    server: Server,
    question: string,
}

export const StartChat = (props: StartChatProps): Promise<Response> => {
    const url = `http://${props.server.host}:${props.server.port}/Chat/StartChat`;
    const data = {
        Question: props.question,
    };

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}