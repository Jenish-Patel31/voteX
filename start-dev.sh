#!/bin/bash

# Start VoteX Development Environment
echo "Starting VoteX Development Environment..."

# Check if backend is running
if ! curl -s http://localhost:5000/api/status > /dev/null; then
    echo "Backend is not running. Please start the backend first:"
    echo "cd backend && npm start"
    exit 1
fi

echo "Backend is running on port 5000 ✓"

# Start frontend
echo "Starting frontend on port 3001..."
cd frontend
npm start
