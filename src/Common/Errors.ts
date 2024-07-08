export class LaoQGError extends Error {
    messageCode: number;

    constructor(messageCode: number, messageText: string) {
        super(messageText);
        this.messageCode = messageCode;
    }

    public toString(): string {
        return `${this.messageCode < 200 ? "WARNING" : "ERROR"}(${this.messageCode}): ${this.message}`
    }

    public getMessageCode(): number {
        return this.messageCode;
    }

    public getMessageText(): string {
        return this.message;
    }
}