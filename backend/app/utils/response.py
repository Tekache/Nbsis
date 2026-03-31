from typing import Any, Generic, TypeVar

T = TypeVar('T')

class SuccessResponse(Generic[T]):
    def __init__(self, data: T, message: str = "Success"):
        self.data = data
        self.message = message
    
    def dict(self) -> dict:
        return {
            "success": True,
            "message": self.message,
            "data": self.data,
        }

class ErrorResponse:
    def __init__(self, message: str, error_code: str = "ERROR"):
        self.message = message
        self.error_code = error_code
    
    def dict(self) -> dict:
        return {
            "success": False,
            "message": self.message,
            "error_code": self.error_code,
        }
