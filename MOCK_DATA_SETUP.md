# Mock Data Setup for Local Testing

This guide explains how to run the Collection Tracker app locally with mock data, without needing a Supabase account.

## Quick Start

1. Create a `.env` file in the project root:

```bash
echo "VITE_USE_MOCK_DATA=true" > .env
```

2. Install dependencies (if you haven't already):

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

## What's Included in Mock Mode

When `VITE_USE_MOCK_DATA=true`, the app will:

- **Auto-login**: You'll be logged in as `demo@example.com` automatically
- **Pre-populated data**: 3 rooms (Living Room, Kitchen, Bedroom) with 4 sample items
- **Full functionality**: All features work (add, edit, delete rooms/items, visual mode, etc.)
- **Local storage**: Changes are stored in memory only (refresh to reset)
- **No backend**: No network calls to Supabase

## Mock Data Details

### Rooms

- 🛋️ Living Room
- 🍳 Kitchen
- 🛏️ Bedroom

### Items

- Vintage Clock (Living Room)
- Leather Sofa (Living Room)
- Coffee Maker (Kitchen)
- Reading Lamp (Bedroom)

## Switching to Production Mode

To use real Supabase backend:

1. Update your `.env` file:

```
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Restart the dev server

3. See `README.md` for full Supabase setup instructions

## Features Available in Mock Mode

✅ All features work in mock mode:

- Create/edit/delete rooms
- Create/edit/delete items
- Reorder rooms
- Visual mode (drag items on canvas)
- Set room backgrounds
- Responsive design

❌ Not available in mock mode:

- Real authentication
- Data persistence (refreshing resets data)
- Multi-user support
- Feedback email (requires Supabase Edge Function)

## Troubleshooting

**Issue**: App shows login screen instead of auto-logging in

- **Solution**: Make sure `.env` file exists and contains `VITE_USE_MOCK_DATA=true`
- Restart the dev server after creating/editing `.env`

**Issue**: Changes don't persist after refresh

- **Solution**: This is expected in mock mode. Data is stored in memory only.

**Issue**: Want to reset mock data

- **Solution**: Just refresh the page - mock data resets to defaults
