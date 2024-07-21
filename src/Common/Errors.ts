export class LaoQGError extends Error {
    private statusCode: number;
    private messageCode: string;

    constructor(statusCode: number, messageCode: string, messageText: string) {
        super(messageText);
        this.statusCode = statusCode;
        this.messageCode = messageCode;
    }

    public toString(): string {
        if (this.statusCode < 100) {
            return `${this.messageCode}: ${this.message}`;
        } else if (this.statusCode < 200) {
            return `警告(${this.messageCode}): ${this.message}`;
        } else {
            return `错误(${this.messageCode}): ${this.message}`;
        }
    }

    public getStatusCode(): number {
        return this.statusCode;
    }

    public getMessageCode(): string {
        return this.messageCode;
    }

    public getMessageText(): string {
        return this.message;
    }
}