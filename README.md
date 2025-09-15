# LeadTrak - Real Estate Lead Management System

A Next.js application for managing real estate buyer leads with full CRUD operations, search, filtering, and CSV import/export functionality.

## 🚀 Live Demo

**Deployed on Vercel**: [https://esahayak-buyer-lead-intake.vercel.app/](https://esahayak-buyer-lead-intake.vercel.app/)


The application is fully deployed and functional with:
- ✅ **Production Database** - Supabase PostgreSQL
- ✅ **Live API Endpoints** - All CRUD operations working
- ✅ **Real-time Features** - Search, filtering, pagination
- ✅ **File Operations** - CSV import/export functionality

## ✅ Implemented Features

### Core Functionality
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete leads
- ✅ **Search & Filter** - Search by name/email, filter by city/status/property type/timeline
- ✅ **Pagination** - Server-side pagination with URL state management
- ✅ **CSV Import/Export** - Bulk data operations with client-side processing
- ✅ **Real-time Status Updates** - Quick status changes with optimistic UI
- ✅ **Form Validation** - Client and server-side validation with Zod schemas

### User Experience
- ✅ **Loading States** - Visual feedback for all async operations (create, edit, delete)
- ✅ **Toast Notifications** - Success/error messages for user actions
- ✅ **Responsive Design** - Mobile-friendly interface with Tailwind CSS
- ✅ **Sidebar Navigation** - Clean layout with shadcn/ui components
- ✅ **Confirmation Dialogs** - Safe delete operations with confirmation

### Technical Implementation
- ✅ **Next.js 15 App Router** - Modern React server components
- ✅ **Supabase Integration** - Cloud PostgreSQL database
- ✅ **Prisma ORM** - Type-safe database operations
- ✅ **TypeScript** - Full type safety throughout the application
- ✅ **Server-Side Rendering** - Optimized performance with SSR
- ✅ **API Routes** - RESTful endpoints for all operations

## Folder Structure

```
esahayak/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   └── leads/                # Lead management endpoints
│   │   │       ├── route.ts          # GET (list), POST (create)
│   │   │       ├── [id]/route.ts     # GET, PATCH, DELETE by ID
│   │   │       ├── status/route.ts   # PATCH status updates
│   │   │       └── import/route.ts   # POST CSV import
│   │   ├── leads/                    # Lead pages
│   │   │   ├── new/page.tsx          # Create lead form
│   │   │   └── [id]/edit/page.tsx    # Edit lead form
│   │   ├── layout.tsx                # Root layout with sidebar
│   │   ├── page.tsx                  # Dashboard (lead list)
│   │   └── globals.css               # Global styles
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layouts/                  # Layout components
│   │   └── leads/                    # Lead-specific components
│   │       ├── lead-form.tsx         # Create/edit form
│   │       ├── lead-list-client.tsx  # Client-side list with search/filter
│   │       └── status-badge.tsx      # Status display component
│   ├── lib/                          # Utilities and configurations
│   │   ├── prisma.ts                 # Prisma client setup
│   │   ├── definitions.ts            # Zod schemas and types
│   │   └── actions.ts                # Server actions
│   └── hooks/                        # Custom React hooks
├── prisma/
│   └── schema.prisma                 # Database schema
├── public/                           # Static assets
└── package.json                      # Dependencies and scripts
```

## Setup

### Environment Variables
Create a `.env` file:
```bash
DATABASE_URL="postgresql://username:password@host:port/database?pgbouncer=true&connection_limit=1"
```

### Installation & Database Setup
```bash

git clone https://github.com/Ashu6622/esahayak-Buyer-Lead-Intake.git

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Seed database with sample data (optional)
npx tsx prisma/seed.ts
```

### Run Locally
```bash
npm run dev
```
Visit `https://esahayak-buyer-lead-intake.vercel.app/`

## Design Notes

### Validation
- **Client-side**: Zod schemas in `src/lib/definitions.ts` with react-hook-form
- **Server-side**: Same Zod schemas validate API requests
- **Database**: Prisma schema enforces constraints at DB level

### SSR vs Client Components
- **SSR**: Initial data fetching in `page.tsx` (server components)
- **Client**: Interactive features (search, filters, forms) in client components
- **Hybrid**: Server-side filtering/pagination with client-side state management

### Data Flow
1. **Server Component** (`page.tsx`) fetches initial data
2. **Client Component** (`lead-list-client.tsx`) handles interactions
3. **API Routes** process CRUD operations
4. **Prisma** manages database operations with Supabase PostgreSQL

### Key Features
- **Search**: Name and email fields (case-insensitive)
- **Filtering**: City, status, property type, timeline
- **Pagination**: Server-side with URL state
- **CSV Import/Export**: Client-side processing
- **Real-time Updates**: Optimistic UI with rollback on errors
- **Loading States**: Visual feedback for all async operations

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase PostgreSQL with Prisma ORM
- **UI**: shadcn/ui + Tailwind CSS
- **Validation**: Zod
- **State**: React hooks + URL parameters
- **Icons**: Lucide React