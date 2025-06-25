# GetDP - Display Picture Banner Generator

## Overview

GetDP is a full-stack web application that allows users to create personalized promotional banners for social media display pictures. The platform features a collection of campaign templates across various categories (Business, Technology, Music, Food, Sports, Education, Art) that users can customize with their own photos and names to generate branded banners.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Processing**: Canvas API for banner generation and Multer for file uploads

### Database Architecture
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with migrations
- **Connection**: Connection pooling via @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth integration using OpenID Connect
- **Session Storage**: PostgreSQL-backed session store with 7-day TTL
- **User Management**: Automatic user profile creation and management
- **Protection**: Route-level authentication middleware

### Campaign Management
- **Template System**: Predefined banner templates organized by categories
- **View Tracking**: Automatic view count increment for analytics
- **Trending Algorithm**: View-based trending campaign calculation
- **Category Organization**: Hierarchical content organization

### Banner Generation
- **Canvas Processing**: Server-side HTML5 Canvas for image composition
- **File Upload**: Secure photo upload with type validation (JPEG, PNG, WebP)
- **Privacy Controls**: Public/private banner sharing options
- **Download System**: Generated banner download functionality

### Content Discovery
- **Category Browsing**: Category-based content organization
- **Trending Content**: Popular campaigns based on view metrics
- **Latest Content**: Chronologically sorted new campaigns
- **Search & Filter**: Category-specific content filtering

## Data Flow

1. **User Authentication**: Replit Auth → Session Creation → User Profile Sync
2. **Content Discovery**: Database Query → Campaign Retrieval → Category Filtering
3. **Banner Generation**: Template Selection → Photo Upload → Canvas Processing → File Generation
4. **Analytics**: View Tracking → Trending Calculation → Metrics Display

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection and querying
- **drizzle-orm**: Database ORM and schema management
- **@tanstack/react-query**: Client-side data fetching and caching
- **@radix-ui/***: Accessible UI component primitives
- **canvas**: Server-side image processing and banner generation

### Authentication
- **openid-client**: OpenID Connect client implementation
- **passport**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Frontend build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Server-side TypeScript compilation for production

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20, Web, and PostgreSQL 16 modules
- **Development Server**: Vite dev server with HMR on port 5000
- **Database**: Automatically provisioned PostgreSQL instance

### Production Build
- **Frontend**: Vite production build with static asset optimization
- **Backend**: esbuild compilation to ESM format
- **Deployment**: Replit Autoscale deployment target
- **Port Configuration**: External port 80 mapping to internal port 5000

### Environment Configuration
- **Database URL**: Automatic PostgreSQL connection string provisioning
- **Session Secret**: Required for secure session management
- **Replit Integration**: REPL_ID and domain configuration for auth

## Changelog

```
Changelog:
- June 25, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```