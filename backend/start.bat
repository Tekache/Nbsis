@echo off
REM Shell Security System - Backend Startup Script for Windows

echo ======================================
echo Shell Petroleum Security System
echo Backend Startup Script
echo ======================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo x Python is not installed. Please install Python 3.10 or higher.
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set python_version=%%i
echo * Python version: %python_version%

REM Check if virtual environment exists
if not exist "venv\" (
    echo.
    echo Creating virtual environment...
    python -m venv venv
    echo * Virtual environment created
)

REM Activate virtual environment
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo * Virtual environment activated

REM Check if requirements are installed
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo.
    echo Installing dependencies...
    pip install -r requirements.txt
    echo * Dependencies installed
)

REM Check if .env file exists
if not exist ".env" (
    echo.
    echo ^! .env file not found
    echo Creating .env from .env.example...
    copy .env.example .env
    echo ^! Please edit .env with your MongoDB URL
    echo.
)

REM Start the server
echo.
echo Starting FastAPI server...
echo ======================================
echo Server running at: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ReDoc: http://localhost:8000/redoc
echo ======================================
echo.

python run.py
pause
