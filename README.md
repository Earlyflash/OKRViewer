# OKR Viewer

A web app for viewing and exploring Objectives and Key Results (OKRs) with a clear hierarchy and owner-based styling.

## Features

- **Three levels**: Chief, Manager, and Staff OKRs in separate rows with connection lines
- **Interactive selection**: Click any OKR to highlight its hierarchy (parent chain and, for Chief/Manager, subordinates); other OKRs fade out
- **Filter by owner**: Filter by manager or by staff so you only see that person’s OKRs and their linked Chiefs/Managers
- **Owner-based colours**: Each owner has a consistent accent and background so you can see who owns what at a glance
- **Responsive**: Two-column layout on phones (e.g. iPhone Pro Max), single column on very narrow screens
- **Loads from file**: Reads `OKRs.txt` on load when served over HTTP (e.g. local server or Cloudflare)

## How to Use

### Option 1: Open locally (embedded data)
Open `index.html` in a browser. Embedded fallback data is used if the file can’t be loaded.

### Option 2: Local server (load from OKRs.txt)
Serve the folder over HTTP so the app can fetch `OKRs.txt`:

- **Python**: `python -m http.server 8000` then open `http://localhost:8000`
- **Node**: `npx http-server` then open the URL shown
- **VS Code**: “Live Server” extension → right‑click `index.html` → “Open with Live Server”

## Interactivity

- **Click an OKR card** to select it. The selected card is highlighted in gold; related OKRs (parent chain and, for Chief/Manager, subordinates) are highlighted in green; all others fade out.
- **Click the selected card again** to clear selection and show all OKRs at full opacity.
- **Filter by manager** or **Filter by staff**: use the dropdowns to show only that owner’s OKRs and the Chiefs/Managers they link to.
- **Connection lines** link Manager → Chief and Staff → parent (Chief or Manager). Lines in the selected hierarchy are highlighted; others fade.

## File format: OKRs.txt

The app expects a pipe-delimited file with a header line and six columns:

```
ID | Level   | Owner          | Objective          | Key Result              | OKRLink
1  | Chief   | Chief Tech Bro | Hire More People   | 10 More people hired    | -
2  | Chief   | Chief Tech Bro | Make more money    | 10 More money made      | -
5  | Manager | DD of Stuff    | Increase Team Size | 3 people hired          | 1
13 | Staff   | Head of Tech   | Expand Team        | 1 more people           | 5
```

| Column     | Description |
|-----------|-------------|
| **ID**    | Unique number for the OKR |
| **Level** | `Chief`, `Manager`, or `Staff` |
| **Owner** | Display name of the owner (used for filters and colours) |
| **Objective** | Objective text |
| **Key Result** | Key result text |
| **OKRLink** | Parent OKR ID, or `-` for top-level (Chief) OKRs |

- **Chief**: use `-` for OKRLink.
- **Manager**: set OKRLink to the Chief OKR ID it reports to.
- **Staff**: set OKRLink to the Manager or Chief OKR ID it reports to.

## File structure

- `index.html` – Page structure and filters
- `styles.css` – Layout, owner colours, responsive and mobile styles
- `script.js` – Loading OKRs, rendering, selection, hierarchy, filters
- `OKRs.txt` – OKR data (ID, Level, Owner, Objective, Key Result, OKRLink)
- `wrangler.toml` – Cloudflare Workers/Pages config (optional)

## Deployment (Cloudflare)

- **Pages (recommended)**: Connect the repo in Cloudflare Dashboard → Pages. Build: no framework, output directory `/`.
- **Wrangler**: `wrangler pages deploy . --project-name=okrviewer` (or use `wrangler deploy` with assets; see `wrangler.toml`).
- **Direct upload**: Upload `index.html`, `styles.css`, `script.js`, and `OKRs.txt`.

The site loads `OKRs.txt` from the deployed files.
