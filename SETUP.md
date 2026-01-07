# Setup Guide for Production

## 1. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

### Database Setup

1. Go to SQL Editor in Supabase Dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL in the SQL Editor
4. Verify tables are created: `rooms` and `items`

### Authentication Setup

1. Go to Authentication > Providers
2. Enable Email provider (enabled by default)
3. (Optional) Enable Google OAuth:
   - Click on Google provider
   - Enable it
   - Add your Google OAuth credentials (Client ID and Secret)
   - Add redirect URL: `https://yourdomain.com` (your production URL)
4. (Optional) Enable GitHub OAuth:
   - Click on GitHub provider
   - Enable it
   - Add your GitHub OAuth credentials
   - Add redirect URL: `https://yourdomain.com`

### Get API Keys

1. Go to Project Settings > API
2. Copy your `Project URL` → this is `VITE_SUPABASE_URL`
3. Copy your `anon public` key → this is `VITE_SUPABASE_ANON_KEY`

## 2. Environment Variables

Create `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit `.env` file to git!

## 3. Feedback Function Setup (Optional)

### Option A: Using Supabase Edge Function

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Login to Supabase:

```bash
supabase login
```

3. Link your project:

```bash
supabase link --project-ref your-project-ref
```

4. Deploy the function:

```bash
supabase functions deploy send-feedback
```

5. Set Resend API key:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

6. Get Resend API key:
   - Sign up at [resend.com](https://resend.com)
   - Create an API key
   - Use it in the command above

### Option B: Direct Email Service

You can modify `src/lib/feedback.ts` to use any email service directly (SendGrid, Mailgun, etc.)

## 4. Install Dependencies

```bash
npm install
```

## 5. Development

```bash
npm run dev
```

## 6. Production Build

```bash
npm run build
```

Deploy the `dist` folder to your hosting provider (Vercel, Netlify, etc.)

## 7. Production Environment Variables

Set environment variables in your hosting platform:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Security Notes

- The `anon` key is safe to use in frontend (it's protected by RLS)
- Never expose your `service_role` key
- RLS policies ensure users can only access their own data
- All API calls are authenticated via Supabase

## Troubleshooting

### OAuth not working

- Check redirect URLs in Supabase dashboard match your domain
- Ensure OAuth providers are properly configured with correct credentials

### Database errors

- Verify RLS policies are enabled
- Check that migrations ran successfully
- Ensure user is authenticated before making requests

### Feedback not sending

- Check Edge Function is deployed
- Verify `RESEND_API_KEY` is set correctly
- Check Edge Function logs in Supabase dashboard
