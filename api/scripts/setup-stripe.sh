#!/bin/bash

# Stripe Subscription System Setup Script
# Run this after pulling the changes

echo "🚀 Setting up Stripe Subscription System..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the api directory"
    exit 1
fi

echo "📦 Installing dependencies (if needed)..."
npm install

echo ""
echo "🔧 Checking database connection..."
npm run typeorm -- query "SELECT 1"

if [ $? -ne 0 ]; then
    echo "❌ Error: Database connection failed. Please check your database configuration."
    exit 1
fi

echo "✅ Database connection successful"
echo ""

echo "🗄️  Running Stripe subscription migration..."
npm run migration:run

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Add ENCRYPTION_KEY to your .env file (run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\")"
    echo "   2. Restart your API server"
    echo "   3. Navigate to Admin > Settings > Stripe & Billing"
    echo "   4. Configure your Stripe API keys"
    echo "   5. Create subscription packages"
    echo ""
    echo "📚 Documentation: docs/012 - STRIPE_SUBSCRIPTION_SYSTEM.md"
    echo ""
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi
