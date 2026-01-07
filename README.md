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

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database migration:

   - Go to SQL Editor in Supabase Dashboard
   - Copy and run the contents of `supabase/migrations/001_initial_schema.sql`

3. Enable OAuth providers (optional):

   - Go to Authentication > Providers
   - Enable Google and/or GitHub
   - Add redirect URLs: `http://localhost:5173/auth/callback` (dev) and your production URL

4. Set up Edge Function for feedback (optional):

   - Install Supabase CLI: `npm install -g supabase`
   - Login: `supabase login`
   - Link project: `supabase link --project-ref your-project-ref`
   - Deploy function: `supabase functions deploy send-feedback`
   - Set environment variable: `supabase secrets set RESEND_API_KEY=your_resend_api_key`

   Or use Resend API directly in the function code.

5. Create `.env.local` for local development:

```
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

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Auth.tsx        # Authentication component
│   ├── FeedbackButton.tsx  # Feedback modal
│   ├── ItemCard.tsx    # Item card component
│   ├── ItemModal.tsx   # Item add/edit modal
│   ├── RoomModal.tsx   # Room add/edit modal
│   ├── RoomOrderModal.tsx  # Room reordering modal
│   ├── RoomSlide.tsx   # Room slide view
│   └── RoomVisualization.tsx  # Visual mode
├── lib/                # Services and utilities
│   ├── auth.ts         # Authentication service
│   ├── items.ts        # Items service
│   ├── rooms.ts        # Rooms service
│   ├── feedback.ts     # Feedback service
│   ├── supabase.ts     # Supabase client
│   └── database.types.ts  # Database types
├── App.tsx             # Main app component
└── types.ts           # TypeScript types
```

## Database Schema

### Rooms Table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `name` (TEXT)
- `icon` (TEXT, nullable)
- `order` (INTEGER)
- `background_image` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Items Table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `room_id` (UUID, Foreign Key to rooms)
- `name` (TEXT)
- `description` (TEXT)
- `image_url` (TEXT, nullable)
- `position_x` (NUMERIC, nullable)
- `position_y` (NUMERIC, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- All API calls are authenticated via Supabase

## Feedback

Feedback is sent via Supabase Edge Function to `zininnikita309@gmail.com`. To set up:

1. Get a Resend API key from [resend.com](https://resend.com)
2. Deploy the Edge Function (see Supabase Setup)
3. Set the `RESEND_API_KEY` secret in Supabase

## License

MIT
