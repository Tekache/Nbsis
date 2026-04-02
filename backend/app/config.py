from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "shell_security"
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    FRONTEND_ORIGINS: str = (
        "http://localhost:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:5173,"
        "https://nbsis.vercel.app"
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.FRONTEND_ORIGINS.split(",")
            if origin.strip()
        ]

    class Config:
        env_file = ".env"

settings = Settings()
