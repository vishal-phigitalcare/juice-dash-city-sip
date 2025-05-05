
# Juice Shop App

A full-stack e-commerce application for a juice shop, built with React, TypeScript, Tailwind CSS, Shadcn UI, and Supabase.

## Project info

**URL**: https://lovable.dev/projects/c27a5d50-eff2-4f37-9e00-ca6fe3053272

## Features

- User Authentication (Email/Password and Phone OTP)
- Juice Menu and Categories
- Shopping Cart
- Checkout Process
- Order Management
- Admin Dashboard
- User Profile and Address Management

## Admin Credentials

Use these credentials to access the admin dashboard:

**Email:** admin@example.com  
**Password:** Admin@123456

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

## Deployment

Simply open [Lovable](https://lovable.dev/projects/c27a5d50-eff2-4f37-9e00-ca6fe3053272) and click on Share -> Publish.

## Custom Domain

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Database Seed Data

The application comes pre-populated with:

1. **Categories** - Various juice categories like Fruit Juices, Vegetable Juices, etc.
2. **Juice Items** - Multiple juice options in each category
3. **Admin User** - For accessing the admin dashboard

## Technologies Used

- Vite
- TypeScript
- React
- Shadcn UI
- Tailwind CSS
- Supabase (Authentication, Database, Storage)
- React Router
- Tanstack Query
- Zod for validation

## Architecture

The application follows a clean architecture pattern:

- **Components**: Reusable UI components
- **Pages**: Main application views
- **Context**: Global state management
- **Services**: API and data access layer
- **Types**: TypeScript type definitions
- **Hooks**: Custom React hooks
- **Lib**: Utility functions

## Authentication Flows

1. **Email/Password Authentication**: Traditional login flow
2. **Phone OTP Authentication**: Simplified signup and login with phone number verification
