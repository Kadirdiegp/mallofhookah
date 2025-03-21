# Mall of Hookah - E-commerce Platform

A modern e-commerce platform for hookah and vaping products, built with React, TypeScript, and Supabase.

## Tech Stack

- **Frontend**: React with TypeScript
- **UI**: TailwindCSS
- **Backend**: Supabase
- **State Management**: React Query for server state, Zustand for client state
- **Authentication**: Supabase Auth
- **Deployment**: Netlify

## Features

### Customer-Facing Interface
- Responsive, modern design optimized for desktop and mobile
- Product catalog with categories (Hookah, Vapes, Tobacco, Accessories)
- Product filtering and search functionality
- Shopping cart with persistent storage
- Secure checkout process
- User account management
- Order history and tracking

### Admin Dashboard
- Single admin user authentication
- Product management (CRUD operations)
- Category management
- Inventory tracking
- Order management system
- Sales analytics and reporting
- Product image upload and management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/mallofhookah.git
cd mallofhookah
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

## Deployment

This project is configured for easy deployment on Netlify.

## License

[MIT](LICENSE)
