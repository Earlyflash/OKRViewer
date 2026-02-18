# Cloudflare Pages Deployment Checklist

## Pre-Deployment

- [x] All files are in the repository root
- [x] `index.html` exists and references `styles.css` and `script.js`
- [x] `OKRs.txt` is included (will be loaded dynamically)
- [x] `_redirects` file created for proper routing
- [x] `.gitignore` configured

## Files Required for Deployment

```
OKRViewer/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── script.js           # JavaScript logic
├── OKRs.txt           # OKR data file
├── _redirects         # Cloudflare Pages routing
├── .gitignore         # Git ignore rules
└── README.md          # Documentation
```

## Deployment Steps

### Method 1: Git Integration (Recommended)

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for Cloudflare Pages deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to https://dash.cloudflare.com/
   - Navigate to **Pages** → **Create a project**
   - Click **Connect to Git**
   - Authorize Cloudflare to access your repository
   - Select your repository and branch (usually `main`)

3. **Configure Build Settings**
   - **Project name**: `okr-viewer` (or your preferred name)
   - **Framework preset**: `None`
   - **Build command**: (leave empty)
   - **Build output directory**: `/` (root directory)
   - **Root directory**: `/` (if using monorepo, otherwise leave default)

4. **Deploy**
   - Click **Save and Deploy**
   - Wait for deployment to complete
   - Your site will be live at `https://your-project.pages.dev`

### Method 2: Wrangler CLI

**Option A: Using Pages (Recommended for static sites)**
```bash
# Install Wrangler (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy using Pages
wrangler pages deploy . --project-name=okr-viewer
```

**Option B: Using Workers with Assets**
```bash
# Install Wrangler (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy (wrangler.toml must have [assets] section)
wrangler deploy
```

**Note**: 
- For static sites, `wrangler pages deploy` is recommended
- If using `wrangler deploy`, ensure `wrangler.toml` has the `[assets]` section configured
- The `wrangler.toml` file is included with proper assets configuration

### Method 3: Direct Upload

1. Go to Cloudflare Dashboard → Pages → Create a project
2. Select **Upload assets**
3. Drag and drop all files:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `OKRs.txt`
   - `_redirects`
4. Click **Deploy site**

## Post-Deployment

- [ ] Verify site loads at the provided URL
- [ ] Test that `OKRs.txt` loads correctly (check browser console)
- [ ] Test filtering functionality
- [ ] Test OKR selection and highlighting
- [ ] Test on mobile device
- [ ] Verify connection lines render correctly

## Custom Domain (Optional)

1. Go to your project in Cloudflare Pages
2. Click **Custom domains**
3. Add your domain
4. Follow DNS configuration instructions

## Troubleshooting

### "Missing entry-point to Worker script" Error
This error occurs when using the wrong Wrangler command. Solutions:

1. **Use the correct command:**
   ```bash
   wrangler pages deploy . --project-name=okr-viewer
   ```
   (Note: `pages deploy` not just `deploy`)

2. **Or use Git integration instead** (Method 1) - recommended and easier

3. **If you must use Wrangler, ensure you're in the project root:**
   ```bash
   cd /path/to/OKRViewer
   wrangler pages deploy .
   ```

### OKRs.txt not loading
- Verify `OKRs.txt` is in the repository root
- Check browser console for fetch errors
- Ensure file is committed and pushed to Git

### Styles not loading
- Verify `styles.css` path is correct in `index.html`
- Check file is included in deployment

### Script errors
- Open browser DevTools Console
- Check for JavaScript errors
- Verify `script.js` is loaded correctly

## Notes

- Cloudflare Pages serves files over HTTPS, so `fetch()` will work correctly
- The `_redirects` file ensures all routes serve `index.html` (useful for direct URL access)
- Cache headers in `script.js` ensure fresh data on each load
- The site will automatically rebuild on every Git push (if using Git integration)
