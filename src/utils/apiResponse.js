class ApiResponse {
    constructor(
        statusCode,
        message = "Success",
        data = null,
        meta = null
    ) {
        this.statusCode =
            Number.isInteger(statusCode) &&
            statusCode >= 100 &&
            statusCode <= 599
                ? statusCode
                : 200;

        this.success = this.statusCode >= 200 && this.statusCode < 300;
        this.message = message;
        this.data = data;
        this.meta = meta;
        this.timestamp = new Date().toISOString();

        Object.freeze(this);
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            success: this.success,
            message: this.message,
            data: this.data,
            meta: this.meta,
            timestamp: this.timestamp,
        };
    }
}

export default ApiResponse;