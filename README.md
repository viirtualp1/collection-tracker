# Collection Tracker

A modern web application for tracking your collections organized by rooms, built with React, TypeScript, and Supabase.

## Features

- 🏠 **Room Management**: Create and organize rooms with custom icons
- 📦 **Item Tracking**: Add items to rooms with descriptions and images
- 🎨 **Visual Mode**: Drag and drop items on room backgrounds
- 🔐 **Authentication**: Sign in with Email (OAuth temporarily disabled)
- 💬 **Feedback**: Send feedback directly to the developer
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd collection-tracker
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

**For Local Testing (Mock Data)**:
Create a `.env` file with:

```
VITE_USE_MOCK_DATA=true
```

This enables mock data mode - no Supabase setup required! You can test all features with pre-populated rooms and items.

**For Production (Supabase)**:
Create a `.env` file with:

```
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```
