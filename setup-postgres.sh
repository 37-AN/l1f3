#!/bin/bash

echo "Setting up PostgreSQL for LIF3..."

# Start PostgreSQL
brew services start postgresql@14

# Wait for PostgreSQL to start
sleep 3

# Create user and database
psql -d postgres -c "CREATE USER lif3_user WITH PASSWORD 'lif3_secure_password';" 2>/dev/null || echo "User already exists"
psql -d postgres -c "CREATE DATABASE lif3_db OWNER lif3_user;" 2>/dev/null || echo "Database already exists"
psql -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE lif3_db TO lif3_user;"

# Test connection
echo "Testing database connection..."
psql -d lif3_db -c "SELECT 'PostgreSQL setup complete!' as message;"

echo ""
echo "Your database connection string is:"
echo "postgresql://lif3_user:lif3_secure_password@localhost:5432/lif3_db"