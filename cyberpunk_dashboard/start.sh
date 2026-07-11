#!/bin/bash
# Arcadian Media Dashboard Startup Script

echo "🚀 Starting Arcadian Media Cyberpunk Dashboard..."
echo "================================================"

# Check Python version
python3 --version

# Create virtual environment if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install --upgrade pip
pip install -r requirements.txt

# Create data directory
mkdir -p data

# Generate initial data
echo "Generating initial dashboard data..."
python3 -c "
import sys
sys.path.insert(0, '.')
from app import dashboard_data
data = dashboard_data.refresh_data()
print('✓ Dashboard data generated')
print(f'  - {len(data[\"todo_list\"])} todo items')
print(f'  - {len(data[\"shopping_list\"])} shopping items')
print(f'  - {len(data[\"news\"])} news items')
"

# Start the server
echo ""
echo "Starting Flask server..."
echo "Dashboard will be available at: http://localhost:5000"
echo "Press Ctrl+C to stop"
echo ""

python3 app.py