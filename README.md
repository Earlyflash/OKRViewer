# OKR Viewer

A beautiful, interactive web application for viewing and exploring Objectives and Key Results (OKRs).

## Features

- 🎯 **Hierarchical Display**: Visualizes Chief and Manager level OKRs
- 🔗 **Interactive Linking**: Click any OKR to see its relationships
- ✨ **Beautiful Design**: Modern, gradient-based UI with smooth animations
- 📱 **Responsive**: Works on desktop and mobile devices

## How to Use

### Option 1: Simple File Opening (Embedded Data)
Simply open `index.html` in your web browser. The OKR data is embedded in the JavaScript file, so it will work immediately.

### Option 2: Local Server (Dynamic File Loading)
If you want the website to automatically load data from `OKRs.txt`:

1. **Using Python** (if installed):
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your browser.

2. **Using Node.js** (if installed):
   ```bash
   npx http-server
   ```
   Then open the URL shown in the terminal.

3. **Using VS Code**:
   Install the "Live Server" extension and right-click `index.html` → "Open with Live Server"

## Deployment to Cloudflare Pages

This project is ready to deploy to Cloudflare Pages:

1. **Via Git Integration** (Recommended):
   - Push your code to GitHub, GitLab, or Bitbucket
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
   - Click "Create a project" → "Connect to Git"
   - Select your repository
   - Build settings:
     - **Framework preset**: None
     - **Build command**: (leave empty)
     - **Build output directory**: `/` (root)
   - Click "Save and Deploy"

2. **Via Wrangler CLI**:
   ```bash
   npm install -g wrangler
   wrangler login
   wrangler pages deploy .
   ```
   
   **Note**: Requires `wrangler.toml` file (included in repository).

3. **Via Cloudflare Dashboard**:
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project" → "Upload assets"
   - Drag and drop all files (index.html, styles.css, script.js, OKRs.txt)
   - Click "Deploy site"

The site will automatically load `OKRs.txt` from the deployed files.

## Interactivity

- **Click any OKR card** to select it
- **Selected OKR** is highlighted in gold
- **Linked OKRs** are highlighted in green:
  - If you select a Chief OKR, all Manager OKRs that link to it are highlighted
  - If you select a Manager OKR, its parent Chief OKR is highlighted

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - Styling and animations
- `script.js` - Logic and interactivity
- `OKRs.txt` - OKR data file

## Updating OKRs

To update the OKRs, edit `OKRs.txt` following this format:
```
ID | Level      | Objective          | Key Result              | OKRLink
1  | Chief      | Your Objective     | Your Key Result         | -
2  | Manager1   | Manager Objective  | Manager Key Result      | 1
```

- Use `-` for OKRLink if it's a top-level (Chief) OKR
- Use the parent OKR's ID number for Manager level OKRs
