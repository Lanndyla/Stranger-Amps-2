#!/bin/bash
set -e

echo "🎸 Building Stranger Amps Web UI..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the React app
echo "⚛️  Building React application..."
npm run build

# Create Resources directory if it doesn't exist
echo "📁 Preparing Resources directory..."
mkdir -p Resources/WebUI

# Copy built files to Resources
echo "📋 Copying build artifacts..."
cp -r dist/* Resources/WebUI/

echo "✅ Web UI build complete!"
echo "   Files copied to: Resources/WebUI/"
echo ""
echo "Next steps:"
echo "  1. Run: cmake -B build"
echo "  2. Run: cmake --build build --config Release"
