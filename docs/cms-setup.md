# Insights CMS setup (Sveltia CMS)

The Insights section is authored through a web editor at **`/admin/`** (Sveltia CMS,
a maintained drop-in successor to Decap CMS). It commits structured YAML posts to
`src/content/insights/`, which the site renders as blocks. Non-developers can add
posts — including cards, stats, steps, callouts, and icons — with no code.

Everything on the site side is already built. Two one-time steps below need a
GitHub account with admin on `True-Lean-Solutions/TLS-Website`. Only people with
write access to the repo can publish.

## 1. Create a GitHub OAuth app

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:

- **Application name:** `TLS Insights CMS`
- **Homepage URL:** `https://www.trueleansolutions.com` (or the current GitHub Pages URL)
- **Authorization callback URL:** `https://<your-worker-subdomain>.workers.dev/callback`
  (you'll get this URL in step 2 — you can edit it afterwards)

Save the **Client ID** and generate a **Client Secret**.

## 2. Deploy the free auth worker

Sveltia/Decap need a tiny OAuth handler because GitHub Pages is static. Use the
free **`sveltia-cms-auth`** Cloudflare Worker:

1. Sign in at Cloudflare (free tier) and deploy `sveltia-cms-auth`
   (https://github.com/sveltia/sveltia-cms-auth — one-click "Deploy to Cloudflare").
2. Set its variables:
   - `GITHUB_CLIENT_ID` = the Client ID from step 1
   - `GITHUB_CLIENT_SECRET` = the Client Secret from step 1
   - `ALLOWED_DOMAINS` = `www.trueleansolutions.com,*.github.io`
3. Copy the worker URL (e.g. `https://tls-cms-auth.<account>.workers.dev`).
4. Put that URL in `public/admin/config.yml` → `backend.base_url`, and set the
   OAuth app's callback URL (step 1) to `<worker-url>/callback`. Commit the change.

## 3. Publish

Go to `https://<site>/admin/`, click **Login with GitHub**, and start writing.
Posts you save appear as pull requests / commits (editorial workflow is on), the
site rebuilds via GitHub Actions, and the post goes live.

## Notes

- **Media:** cover and in-article images upload to `public/insights/covers/`.
- **SEO:** each post's title, excerpt (meta description), cover (social image),
  canonical URL, sitemap entry, and `BlogPosting` structured data are generated
  automatically. Fill the excerpt (~150 chars) and cover alt text for best results.
- **Hardening (optional):** pin the Sveltia CMS version and add Subresource
  Integrity to the `<script>` in `public/admin/index.html`.
