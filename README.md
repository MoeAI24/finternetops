# Six Layers of Reality (MoeCommunityCloud)

## What you got
A complete, clean, dramatic, animated one-page site:
- Hero with placeholder 16:9 artwork (swap with your AI-generated image)
- Six-layer accordion (remembers last opened layer)
- Ambient animated canvas background (no libraries)
- Video embed area (swap in your YouTube ID)
- Ending screen section with placeholder end-screen artwork
- CTA buttons for moecommunitycloud.com + Spreadshop

## Quick edits
1) **YouTube embed**
Open `index.html` and replace:
`https://www.youtube.com/embed/YOUR_YOUTUBE_ID`

2) **Join link**
Open `assets/js/app.js` and change:
`const JOIN_URL = "https://moecommunitycloud.com/";`

3) **Swap images**
Replace:
- `assets/img/hero-placeholder.svg` with your real hero image (keep the same filename, or update `index.html`)
- `assets/img/ending-screen-placeholder.svg` with your end-screen background

## Deploy
Upload the folder contents to your repo path for the six-layers page (or publish directly).
This is pure static HTML/CSS/JS — works on GitHub Pages, Cloudflare Pages, Firebase Hosting, etc.
