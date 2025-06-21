# replit.md

## Overview

Ceiba is a modern food delivery web application built with React, Express, and TypeScript. The application allows users to browse restaurants, view menus, add items to cart, and place orders. It features a responsive design with mobile-first approach and uses a PostgreSQL database with Drizzle ORM for data management.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: React Context for cart management, TanStack Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui components and Tailwind CSS for styling
- **Mobile Support**: Responsive design with bottom navigation for mobile devices

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Neon serverless connector
- **ORM**: Drizzle ORM with Zod for schema validation
- **Development**: Hot reloading with Vite middleware in development mode
- **Production**: Compiled with esbuild for Node.js environment

## Key Components

### Database Schema
- **Restaurants**: Store restaurant information including name, cuisine, rating, delivery details
- **Menu Items**: Food items associated with restaurants, organized by categories
- **Orders**: Customer orders with status tracking and delivery information
- **Order Items**: Junction table linking orders to menu items with quantities

### Core Features
- **Restaurant Discovery**: Browse and search restaurants by category or name
- **Menu Management**: View categorized menu items with pricing and availability
- **Shopping Cart**: Add/remove items with quantity management
- **Order Placement**: Create orders with delivery address and estimated times
- **Order Tracking**: Real-time order status updates with progress indicators

### UI/UX Design
- **Design System**: shadcn/ui component library with "new-york" style
- **Responsive Layout**: Mobile-first design with adaptive navigation
- **Theme Support**: CSS variables for consistent theming with dark mode support
- **Accessibility**: Radix UI primitives ensure ARIA compliance and keyboard navigation

## Data Flow

1. **Client Request**: React components fetch data using TanStack Query
2. **API Layer**: Express routes handle HTTP requests and validation
3. **Data Access**: Storage layer abstracts database operations (currently in-memory with seed data)
4. **Response**: JSON data returned to client with error handling
5. **State Management**: Client updates local state and UI reactively

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/**: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across the stack
- **esbuild**: Fast JavaScript bundler for production
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Port Configuration**: Frontend on port 5000, accessible externally on port 80
- **Hot Reloading**: Vite middleware for instant updates
- **Database**: PostgreSQL module configured in Replit environment

### Production Build
- **Frontend**: Built with Vite to `dist/public` directory
- **Backend**: Bundled with esbuild to `dist/index.js`
- **Static Assets**: Served by Express from build directory
- **Deployment**: Configured for Replit autoscale deployment

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Management**: Express sessions with PostgreSQL store
- **Error Handling**: Development error overlay with runtime error modal

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 21, 2025. Initial setup