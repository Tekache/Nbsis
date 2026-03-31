#!/bin/bash
# Shell Security System - Backend Startup Script

echo "======================================"
echo "Shell Petroleum Security System"
echo "Backend Startup Script"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.10 or higher."
    exit 1
fi

# Check Python version
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating virtual environment..."
    python -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"

# Check if requirements are installed
if ! pip show fastapi &> /dev/null; then
    echo ""
    echo "Installing dependencies..."
    pip install -r requirements.txt
    echo "✓ Dependencies installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  .env file not found"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your MongoDB URL"
    echo ""
fi

# Start the server
echo ""
echo "Starting FastAPI server..."
echo "======================================"
echo "Server running at: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "ReDoc: http://localhost:8000/redoc"
echo "======================================"
echo ""

python run.py
