# replit.md

## Overview

Ceiba Cafe Pizzeria is a beautiful, modern delivery web application showcasing authentic Italian cuisine with Caribbean vibes. Built with React, Express, and TypeScript, the application features a tropical aesthetic with glass morphism UI, parallax effects, and WhatsApp ordering integration. Located in Perla Marina, Cabarete, it offers wood-fired pizzas, fresh pasta, tropical drinks, and delivery services.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: React Context for cart management, TanStack Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui components and Tailwind CSS for styling
- **Mobile Support**: Responsive design with bottom navigation for mobile devices

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Neon serverless connector (now active)
- **ORM**: Drizzle ORM with Zod for schema validation and automatic migrations
- **Storage**: DatabaseStorage class replacing in-memory storage with persistent data
- **Development**: Hot reloading with Vite middleware in development mode
- **Production**: Compiled with esbuild for Node.js environment

## Key Components

### Database Schema
- **Restaurants**: Store restaurant information including name, cuisine, rating, delivery details
- **Menu Items**: Food items associated with restaurants, organized by categories
- **Orders**: Customer orders with status tracking and delivery information
- **Order Items**: Junction table linking orders to menu items with quantities

### Core Features
- **Home Page**: Parallax hero section with authentic Italian pizza and Caribbean vibes branding
- **Menu Page**: Categorized menu display (Pizzas, Pastas, Salads, Drinks) with tropical styling
- **Order Page**: Complete order form with customer details and WhatsApp integration
- **Contact Page**: Location info, hours, social media links, and embedded map
- **Shopping Cart**: Transparent glass UI with WhatsApp quick ordering functionality
- **WhatsApp Ordering**: Auto-generated messages for seamless order placement

### UI/UX Design
- **Design System**: Tropical theme with glass morphism effects and warm gradients
- **Responsive Layout**: Mobile-first design with bottom navigation for mobile devices
- **Theme Support**: Transparent UI with tropical gradient accents and rounded corners
- **Visual Effects**: Parallax backgrounds, backdrop blur effects, and smooth transitions
- **Accessibility**: Radix UI primitives ensure ARIA compliance and keyboard navigation

## Data Flow

1. **Menu Display**: Single restaurant (Ceiba Cafe Pizzeria) with categorized menu items
2. **Cart Management**: Local state with LocalStorage persistence and real-time updates
3. **WhatsApp Integration**: Auto-generated order messages sent directly to restaurant
4. **No Backend Dependency**: Orders processed through WhatsApp without database storage
5. **State Management**: React Context for cart, TanStack Query for menu data

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

## Recent Changes

- **June 21, 2025**: Transformed app into Ceiba Cafe Pizzeria
  - Implemented tropical aesthetic with glass morphism UI
  - Added WhatsApp ordering integration throughout
  - Created parallax hero sections and island-vibe branding
  - Updated menu categories to Pizzas, Pastas, Salads, Drinks
  - Redesigned navigation with Home, Menu, Order, Contact pages
  - Added location details for Perla Marina, Cabarete
  - Migrated from in-memory storage to PostgreSQL database
  - Implemented DatabaseStorage with automatic seeding
  - Added persistent data storage for restaurants, menu items, and orders