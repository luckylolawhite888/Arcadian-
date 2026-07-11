# The Hunt Landing Page

**"Let's face it, the old world is dead. JOIN NOW or get eaten."**

A high-impact landing page with countdown timer and phone number collection system.

## Features

- **Bold Design**: All white background with dark orange/almost black text
- **Countdown Timer**: Real-time countdown to May 8th, 2026
- **Phone Collection**: Secure storage of phone numbers in `new-sign-ups` folder
- **Responsive**: Works on all devices
- **Server-side Storage**: Phone numbers saved as JSON files

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## File Structure

```
landing-page/
├── index.html              # Main landing page
├── server.js              # Express server
├── package.json           # Dependencies
├── README.md             # This file
└── new-sign-ups/         # Phone numbers stored here (created on first run)
    ├── signup_1234567890_abc123.json
    └── signup_1234567891_def456.json
```

## How It Works

1. User visits page and sees: **"Let's face it, the old world is dead"**
2. Clicks **"JOIN NOW"** button
3. Phone input field appears with countdown timer to **May 8th, 2026**
4. User enters phone number and clicks **"SUBMIT"**
5. Phone number is saved to `new-sign-ups` folder as JSON file
6. User sees success message

## API Endpoints

- `GET /` - Serves the landing page
- `POST /api/signup` - Saves phone number
  ```json
  {
    "phoneNumber": "+1234567890"
  }
  ```
- `GET /api/signups` - View all signups (admin)

## Viewing Signups

To view collected phone numbers:

1. Check the `new-sign-ups` folder for JSON files
2. Or visit `http://localhost:3000/api/signups`

Each signup file contains:
```json
{
  "phone": "+1234567890",
  "timestamp": "2026-04-03T01:30:00.000Z",
  "ip": "127.0.0.1"
}
```

## Customization

- **Colors**: Edit CSS variables in `index.html`
- **Target Date**: Change `targetDate` in JavaScript
- **Text**: Modify headings and messages in HTML
- **Validation**: Update phone regex in both HTML and server.js

## Deployment

For production deployment:

1. Set up a proper database (MongoDB, PostgreSQL, etc.)
2. Add rate limiting
3. Implement CAPTCHA
4. Use HTTPS
5. Set up proper logging
6. Add email/SMS confirmation

## Security Notes

- Basic phone number validation implemented
- IP logging for tracking
- File-based storage (consider database for production)
- No sensitive data besides phone numbers

---

**Remember:** "Join the hunt or get eaten."