# POS System

## Overview

This is a Point of Sale (POS) system built as a full-stack web application. It enables employees to manage customer orders, browse products, create shopping carts, and process transactions. The system features a modern React frontend with a Node.js Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

### Cart Management Fixes
- Fixed TypeScript errors in storage system for Cart, CartItem, and Order types
- Improved cart rejection to properly clear all items and restore stock
- Fixed cart list to display all active carts instead of just the latest one
- Added real-time updates for cart totals without requiring page refresh
- Enhanced query invalidation across all cart-related operations
- Added automatic refresh intervals for cart data (1-2 seconds)

### Real-time Updates
- Cart counter now updates immediately when items are added/removed
- Product stock updates in real-time across all pages
- Cart list refreshes automatically to show all active carts
- Improved query invalidation to ensure data consistency

### New Pages Added
- **All Products Page** (`/all-products`): Browse all products with category filtering
- **Transaction History Page** (`/transactions`): View completed and cancelled transactions
- **Transaction Detail Page** (`/transaction/:id`): View detailed transaction information
- Added navigation buttons in cart list to access new pages
- Cart status tracking: `active` for ongoing, `confirmed` for completed, `rejected` for cancelled
- Transaction history shows clickable entries with customer info and totals

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API endpoints

### Data Storage
- **Database**: PostgreSQL hosted on Neon Database
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for database schema management
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Database Schema
The system uses six main tables:
- **employees**: Staff authentication and identification
- **customers**: Customer information storage
- **products**: Product catalog with pricing and inventory
- **carts**: Shopping cart sessions linked to customers and employees
- **cart_items**: Individual items within carts
- **orders**: Finalized transactions with order numbers and totals

### Authentication
- Simple employee login system using employee ID and password
- Client-side session storage using localStorage
- No advanced security features like JWT or OAuth

### Product Management
- Product catalog with categories (drinks, snacks, canned foods, etc.)
- Real-time stock tracking
- Image support for products
- Category-based filtering

### Cart Management
- Multi-cart support per employee
- Real-time cart updates
- Quantity management for cart items
- Cart status tracking (active, confirmed, rejected)

### Order Processing
- Cart confirmation creates orders
- Order number generation
- Tax calculation and subtotal tracking
- Payment confirmation workflow

## Data Flow

1. **Employee Login**: Employee authenticates with credentials, session stored locally
2. **Cart Creation**: Employee creates new cart for customer
3. **Product Selection**: Employee browses products and adds items to cart
4. **Cart Management**: Items can be added, removed, or quantity updated
5. **Order Confirmation**: Cart is confirmed, creating an order record
6. **Payment Processing**: Order proceeds to payment confirmation

## External Dependencies

### Frontend Dependencies
- **@radix-ui/***: Comprehensive UI component library
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing solution
- **react-hook-form**: Form management
- **zod**: Runtime type validation
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Backend Dependencies
- **express**: Web framework
- **drizzle-orm**: Database ORM
- **@neondatabase/serverless**: Neon database client
- **connect-pg-simple**: PostgreSQL session store
- **zod**: Data validation

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **drizzle-kit**: Database migration tool
- **esbuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations handled by Drizzle Kit
- Replit-specific development features enabled

### Production Build
- Frontend built with Vite to static assets
- Backend bundled with esbuild for Node.js deployment
- Environment variables for database connection
- Static file serving integrated with Express

### Database Management
- PostgreSQL database hosted on Neon Database
- Connection via DATABASE_URL environment variable
- Automatic schema synchronization with `db:push` command
- Migration files stored in `/migrations` directory

The system is designed for simplicity and rapid development, prioritizing functionality over advanced security features. It's well-suited for small to medium-sized retail environments where employees need a straightforward interface for processing customer orders.