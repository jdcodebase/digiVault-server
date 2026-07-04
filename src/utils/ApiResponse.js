class ApiResponse{
    constructor(statusCode,message,data=null){
        this.statusCode = statusCode;
        this.success = statusCode >= 200 && statusCode < 300;
        this.message = message;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    toJSON(){
        return {
            statusCode: this.statusCode,
            success: this.success,
            message: this.message,
            data: this.data,
            timestamp: this.timestamp
        };
    }
}

export default ApiResponse;