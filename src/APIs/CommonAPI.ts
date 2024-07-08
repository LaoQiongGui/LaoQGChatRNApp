export interface Header {
    status: number,
    message_code: string,
    message_text: string,
}

export interface CommonRes<T> {
    common: Header,
    data: T
}
