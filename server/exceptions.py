class AuthenticationError(Exception):
    """Raised when authentication fails"""
    def __init__(self, message="Authentication failed"):
        super().__init__(message)


class RateLimitError(Exception):
    """Raised when rate limit is exceeded"""
    def __init__(self, message="Rate limit exceeded"):
        super().__init__(message)


class ServiceError(Exception):
    """Raised when service fails"""
    def __init__(self, message="Service error occurred"):
        super().__init__(message)