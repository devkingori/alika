# GetDP Supabase Database Setup

## Step 1: Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string**
4. Copy the **URI** connection string (it looks like this):
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

## Step 2: Update Your .env File

Replace `your_supabase_database_url_here` in your `.env` file with your actual Supabase connection string:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres.xxxxx:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Session Security
SESSION_SECRET=super-secret-session-key-for-local-development-32chars

# Replit Auth Configuration
REPL_ID=e16aeb79-1da3-420a-8769-1c0717f1c4e1
REPLIT_DOMAINS=localhost:5000
ISSUER_URL=https://replit.com/oidc

# Development Environment
NODE_ENV=development
```

## Step 3: Initialize Your Database

Run these commands in your project directory:

```bash
# Push the database schema to create tables
npm run db:push

# Start the development server
npm run dev

# Initialize with sample data (in a new terminal)
curl -X POST http://localhost:5000/api/init-data
```

## Step 4: Verify Setup

Your app should now be running at `http://localhost:5000` with:
- ✓ Database connection to Supabase
- ✓ Sample campaigns and categories loaded
- ✓ Authentication working
- ✓ Banner generation functionality

## Troubleshooting

**"DATABASE_URL must be set" Error:**
- Ensure your `.env` file is in the project root
- Verify the DATABASE_URL format is correct
- Check that your Supabase password doesn't contain special characters that need URL encoding

**Connection Issues:**
- Verify your Supabase project is not paused
- Check that your IP is allowed (Supabase allows all IPs by default)
- Ensure you're using the correct password

**Schema Push Fails:**
- Make sure your Supabase database user has CREATE permissions
- Try connecting directly with `psql` to test the connection string