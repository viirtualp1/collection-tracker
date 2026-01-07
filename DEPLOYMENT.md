# Deployment Guide

## Quick Start Checklist

- [ ] Create Supabase project
- [ ] Run database migration (`supabase/migrations/001_initial_schema.sql`)
- [ ] Configure OAuth providers (Google/GitHub) if needed
- [ ] Set environment variables
- [ ] Install dependencies: `npm install`
- [ ] Test locally: `npm run dev`
- [ ] Build for production: `npm run build`
- [ ] Deploy to hosting platform

## Environment Variables

Required in production:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## Additional Setup for Feedback

To enable feedback functionality:

1. **Option 1: Supabase Edge Function (Recommended)**
   - Deploy `supabase/functions/send-feedback/index.ts` as Edge Function
   - Set `RESEND_API_KEY` secret in Supabase
   - Get API key from [resend.com](https://resend.com)

2. **Option 2: Custom Email Service**
   - Modify `src/lib/feedback.ts` to use your preferred email service
   - Update the implementation accordingly

## Production Considerations

1. **CORS**: Ensure your production domain is added to Supabase allowed origins
2. **OAuth Redirects**: Add production URL to OAuth provider redirect URLs
3. **Rate Limiting**: Consider adding rate limiting for feedback submissions
4. **Error Monitoring**: Set up error tracking (Sentry, etc.)
5. **Analytics**: Add analytics if needed

## Testing Checklist

- [ ] User can sign up with email
- [ ] User can sign in with email
- [ ] User can sign in with Google (if enabled)
- [ ] User can sign in with GitHub (if enabled)
- [ ] User can create rooms
- [ ] User can add items to rooms
- [ ] User can edit/delete rooms and items
- [ ] User can reorder rooms
- [ ] User can use visual mode
- [ ] User can send feedback
- [ ] Data persists after page refresh
- [ ] User can sign out

