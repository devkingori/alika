#!/bin/bash

echo "Setting up GetDP Local Database..."

# Check if PostgreSQL is running
if ! pg_isready >/dev/null 2>&1; then
    echo "PostgreSQL is not running. Please start it first:"
    echo "  macOS: brew services start postgresql"
    echo "  Ubuntu: sudo systemctl start postgresql"
    echo "  Windows: Start from Services or pgAdmin"
    exit 1
fi

echo "PostgreSQL is running ✓"

# Create database and user
echo "Creating database and user..."
psql postgres << EOF
-- Drop existing database/user if they exist (for clean setup)
DROP DATABASE IF EXISTS getdp_db;
DROP USER IF EXISTS getdp_user;

-- Create new database and user
CREATE DATABASE getdp_db;
CREATE USER getdp_user WITH PASSWORD 'getdp_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE getdp_db TO getdp_user;

-- Connect to the new database and grant schema permissions
\c getdp_db
GRANT ALL ON SCHEMA public TO getdp_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO getdp_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO getdp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO getdp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO getdp_user;
EOF

if [ $? -eq 0 ]; then
    echo "Database setup completed ✓"
    echo ""
    echo "Testing connection..."
    
    # Test connection
    PGPASSWORD=getdp_secure_2024 psql -h localhost -U getdp_user -d getdp_db -c "SELECT version();" >/dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "Database connection test successful ✓"
        echo ""
        echo "Next steps:"
        echo "1. Run: npm run db:push"
        echo "2. Run: curl -X POST http://localhost:5000/api/init-data"
        echo "3. Visit: http://localhost:5000"
    else
        echo "Database connection test failed ✗"
        echo "Please check your DATABASE_URL in .env file"
    fi
else
    echo "Database setup failed ✗"
    echo "Please check PostgreSQL permissions and try again"
fi