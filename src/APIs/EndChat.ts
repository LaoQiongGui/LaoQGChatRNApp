import { Server } from "../Common/Server";

export interface EndChatProps {
    server: Server,
    sessionId: string,
}

export const EndChat = (props: EndChatProps): Promise<Response> => {
    const url = `http://${props.server.host}:${props.server.port}/Chat/EndChat`;
    const data = {
        SessionId: props.sessionId,
    };

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}