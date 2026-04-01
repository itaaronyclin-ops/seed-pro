# TMS Pro+ Deployment Guide (Netlify + Google Sheets)

This guide explains how to deploy the TMS Pro+ system using Netlify for the frontend and Google Sheets for the backend database.

## Prerequisites

- A Google Account
- A Netlify Account (free tier is sufficient)

---

## Part 1: Backend Setup (Google Sheets)

1. **Create a Google Sheet**
   - Go to Google Sheets and create a new blank spreadsheet.
   - Name it "TMS Pro+ Database".

2. **Open Apps Script**
   - In the spreadsheet, go to `Extensions` > `Apps Script`.

3. **Install Server Code**
   - Open the file `server/code.gs` from this project.
   - Copy the **entire content**.
   - Paste it into the `Code.gs` file in the Apps Script editor (replace any existing code).

4. **Add PDF Template**
   - In Apps Script, click `+` next to Files and select `HTML`.
   - Name the file `PrintTemplate`. (Note: The `.html` extension is added automatically).
   - Open `server/PrintTemplate.html` from this project.
   - Copy the content and paste it into the `PrintTemplate.html` in Apps Script.

5. **Deploy as Web App**
   - Click the blue **Deploy** button > **New deployment**.
   - Click the gear icon > **Web app**.
   - **Description**: `TMS Backend API`.
   - **Execute as**: `Me` (your email).
   - **Who has access**: `Anyone`. **(Important: This allows the Netlify app to talk to your sheet)**.
   - Click **Deploy**.
   - **Authorize Access**: You will be asked to authorize the script to access your Spreadsheets. Click through the warnings (Advanced > Go to project (unsafe)) since this is your own code.

6. **Copy the Web App URL**
   - After deployment, copy the **Web App URL** (ends in `/exec`).
   - You will need this for the frontend.

---

## Part 2: Frontend Setup (Netlify)

1. **Configure API URL**
   - Open `client/tms-api-adapter.js` in a text editor.
   - Find the line: `let GAS_API_URL = "您的_GOOGLE_SHEET_API_URL";`
   - Replace `"您的_GOOGLE_SHEET_API_URL"` with the **Web App URL** you copied in Part 1.
   - Save the file.
   - *Note: If you don't do this, the website will prompt you for the URL upon first visit.*

2. **Deploy to Netlify**
   - Login to Netlify.
   - Go to **Sites** > **Add new site** > **Deploy manually**.
   - Drag and drop the **`client`** folder (containing `index.html`, `form.html`, etc.) into the Netlify upload area.
   - Wait a few seconds for deployment.

3. **Done!**
   - Netlify will give you a public URL (e.g., `https://funny-name-123456.netlify.app`).
   - Open that URL to access your system.

---

## Important Notes

- **Data Privacy**: By setting "Who has access: Anyone", you are allowing anyone with the API URL to make requests to your backend logic. However, since the code logic controls what can be read/written (and validates inputs), it acts as a basic API. For higher security, consider adding token authentication in the code.
- **CORS**: The client uses `text/plain` requests to bypass strict CORS preflight checks, which is a common pattern for Google Apps Script Web Apps.
- **Updates**: If you modify `server/code.gs`, you must created a **New Deployment** (versioning) in Apps Script for changes to take effect.
