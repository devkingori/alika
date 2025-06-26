# GetDP Local Development Setup

## Prerequisites

1. **Node.js 20+** - Install from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL** - Install locally or use a cloud service like Neon, Supabase, or Railway
3. **Git** - For cloning the repository

## Step 1: Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd getdp-platform
npm install
```

## Step 2: Database Setup

### Option A: Local PostgreSQL
```bash
# Create database
createdb getdp_db

# Your DATABASE_URL will be:
# postgresql://your_username:your_password@localhost:5432/getdp_db
```

### Option B: Cloud Database (Recommended)
- **Neon**: Free PostgreSQL at [neon.tech](https://neon.tech)
- **Supabase**: Free tier at [supabase.com](https://supabase.com)
- **Railway**: [railway.app](https://railway.app)

Copy the connection string they provide.

## Step 3: Environment Configuration

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Required: Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/getdp_db

# Required: Session security (generate a random 32+ character string)
SESSION_SECRET=your-super-secret-session-key-here-at-least-32-characters

# Required: Replit Auth (for authentication to work)
REPL_ID=e16aeb79-1da3-420a-8769-1c0717f1c4e1
REPLIT_DOMAINS=localhost:5000
ISSUER_URL=https://replit.com/oidc

# Optional
NODE_ENV=development
```

## Step 4: Authentication Setup

The app uses Replit Auth for authentication. For local development:

1. Create a Repl on [replit.com](https://replit.com)
2. Get your `REPL_ID` from the Repl's environment variables
3. Add `localhost:5000` to `REPLIT_DOMAINS`

**Alternative**: You can temporarily disable auth by modifying the router logic to skip authentication checks during development.

## Step 5: Database Migration

```bash
# Push database schema
npm run db:push

# Initialize with sample data
curl -X POST http://localhost:5000/api/init-data
```

## Step 6: Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

## Project Structure

```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
├── server/          # Express backend
│   ├── db.ts           # Database connection
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Data layer
│   └── replitAuth.ts   # Authentication
├── shared/          # Shared types and schemas
└── uploads/         # User uploaded files
```

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running (if local)
- Check firewall settings for cloud databases

### Authentication Issues
- Verify `REPL_ID` and `REPLIT_DOMAINS` are set correctly
- For local-only development, you can temporarily bypass auth

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

1. **Hot Reload**: Frontend changes auto-reload, backend requires restart
2. **Database Reset**: Run `npm run db:push` after schema changes
3. **Sample Data**: Re-run init-data endpoint to refresh test campaigns
4. **File Uploads**: Uploaded files go to `uploads/` directory
5. **Generated Banners**: Created banners go to `generated/` directory

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use a production PostgreSQL database
3. Configure proper domain in `REPLIT_DOMAINS`
4. Ensure `SESSION_SECRET` is secure and unique