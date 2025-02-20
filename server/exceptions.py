class ChatServiceError(Exception):
    """Base exception for chat service errors"""
    pass


class AuthenticationError(ChatServiceError):
    """Raised when authentication fails"""
    pass


class RateLimitError(ChatServiceError):
    """Raised when rate limit is exceeded"""
    pass


class ServiceError(ChatServiceError):
    """Raised when service fails"""
    pass