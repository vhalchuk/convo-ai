import { EnhancedError, EnhancedErrorParams } from "@/lib/enhanced-error";

export class SSEError extends EnhancedError {
    constructor(params: EnhancedErrorParams) {
        super(params);
    }
}
