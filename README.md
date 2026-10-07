# MotionForge — 3D Motion Capture Business Website

Responsive HTML/CSS/JavaScript website with a Three.js animated motion-capture skeleton visual, scroll reveals, mobile navigation, and a Google Apps Script + Google Sheets contact form.

## Project structure

```text
motion-capture-business-website/
├── index.html
├── Code.gs
├── README.md
├── css/
│   └── style.css
├── js/
│   └── script.js
└── assets/
```

## 1. Run in VS Code

1. Extract the ZIP.
2. Open VS Code → **File → Open Folder** → select `motion-capture-business-website`.
3. Install the **Live Server** extension (Ritwick Dey).
4. Right-click `index.html` → **Open with Live Server**.
5. Three.js and Google Fonts load from CDNs, so keep internet enabled for the full visual experience.

## 2. Connect Google Sheets

1. Create a Google Sheet named `MotionForge Enquiries`.
2. Open **Extensions → Apps Script**.
3. Paste the contents of `Code.gs` into the Apps Script editor and save.
4. Select **Deploy → New deployment → Web app**.
5. Choose **Execute as: Me** and **Who has access: Anyone** (if available for your Google account / Workspace policy).
6. Click **Deploy**, authorize access, and copy the URL ending in `/exec`.
7. Open `js/script.js` and replace:
   `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`
   with the copied `/exec` URL.
8. Submit a test enquiry and check the `Responses` tab in the spreadsheet.

**Important:** The frontend uses `mode: "no-cors"` for Apps Script compatibility. The browser cannot read the server's JSON response in this mode, so the page displays a submission message after the request is sent, but you should verify the row appears in Google Sheets. Do not treat the browser message alone as proof of storage. For a stronger verified success/error response, use a small backend/proxy that supports CORS.

## 3. Upload to GitHub

Create a new GitHub repository named `motion-capture-business-website` (do not add a README if you plan to push this folder as-is). In VS Code terminal:

```bash
git init
git add .
git commit -m "Create MotionForge motion capture website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/motion-capture-business-website.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username. If Git asks for identity, set it once:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Then repeat the commit/push commands if needed.

## 4. Deploy on Vercel

1. Sign in at https://vercel.com using GitHub.
2. Click **Add New → Project**.
3. Import `motion-capture-business-website`.
4. Framework preset: **Other**.
5. Root directory: `./`.
6. Leave Build Command and Output Directory empty for this plain HTML project.
7. Click **Deploy**.
8. Open the live URL and test it on desktop and mobile.

## 5. Update after deployment

Edit files in VS Code, then run:

```bash
git add .
git commit -m "Update MotionForge website"
git push
```

Vercel automatically redeploys after the push.

## Before using this for a real client

- Replace MotionForge branding, email, project examples, and location.
- The portfolio visuals are concept artwork; replace with real work or clearly label them as concepts.
- Apps Script `/exec` is public. Add spam protection/rate limiting before using the form at scale.
- Never put private credentials in frontend JavaScript.
