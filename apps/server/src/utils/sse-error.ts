import { EnhancedError, EnhancedErrorParams } from "@/utils/enhanced-error";

export class SSEError extends EnhancedError {
    constructor(params: EnhancedErrorParams) {
        super(params);

        Object.setPrototypeOf(this, new.target.prototype); // Ensures instanceof works correctly

        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}
