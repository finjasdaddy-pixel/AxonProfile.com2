# AxonProfile deployment setup

## 1. GitHub and Vercel
Upload the contents of this folder to the existing repository. Keep the existing Vercel project and domain; importing/committing to the connected GitHub repository triggers a deployment. Do not delete the domain from Vercel.

## 2. Supabase database
1. Create/open a Supabase project at https://supabase.com/dashboard.
2. Open SQL Editor and run all of `database/schema.sql`.
3. In Project Settings → API, copy the Project URL, anon/public key, and service_role key.
4. In Vercel → Project → Settings → Environment Variables, set:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (server-only; never expose or commit)
   - `ADMIN_ACCESS_KEY` = a new long random secret known only to trusted admins
5. Redeploy after setting environment variables.

Do not use the example admin password shared in chat as a public code constant. Choose a new unique secret and set it only in Vercel's server environment variables. If a password has been shared in a chat, treat it as exposed and rotate it.

## 3. Google login
1. Supabase → Authentication → URL Configuration: add your Vercel deployment URL and `https://YOUR-DOMAIN/auth/callback` to Redirect URLs. Set Site URL to your production domain.
2. Supabase → Authentication → Providers → Google: enable Google and add the OAuth Client ID and Client Secret from a Google Cloud OAuth client.
3. In Google Cloud Console, configure the authorized redirect URI shown by Supabase (the Supabase Auth callback URL, not your site's callback).

## 4. Apple login
Supabase → Authentication → Providers → Apple: enable it and enter the Apple Services ID, Team ID, Key ID, and private key required by Supabase. Configure the matching return URL in Apple Developer. Apple sign-in cannot work until Apple developer credentials are configured.

## 5. Admin and bans
The admin API checks `ADMIN_ACCESS_KEY` on the server and writes ban records to the `bans` table using the server-only Supabase service-role key. Never add either secret to client-side code or commit it to GitHub. The ban console accepts a username or Supabase auth user UUID and a reason; expiry is optional. This creates a moderation record. To enforce bans across the whole site, also check active, unexpired bans in the server-side session/middleware for every protected action; the UI alone is not enforcement.

## Notes
- OAuth provider setup requires your own provider credentials; a ZIP cannot supply these.
- The badge catalogue has 16 entries. The browser preview defaults to one owned badge to avoid the old incorrect count. Real cross-device badge ownership requires database-backed badge award/redeem operations.
- Before public launch, add rate limiting and audit logging to admin actions, and restrict admin access to trusted accounts in addition to the secret key.
