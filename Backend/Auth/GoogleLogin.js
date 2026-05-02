import express from 'express'
import * as arctic from "arctic";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// ─── Google OAuth Config ───────────────────────────────────────────────────────
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectURI = process.env.GOOGLE_REDIRECT_URI;

// Step 1: Redirect user to Google's authorization page
router.get('/', (req, res) => {
    const google = new arctic.Google(googleClientId, googleClientSecret, googleRedirectURI);
    const state = arctic.generateState();
    const codeVerifier = arctic.generateCodeVerifier();
    const scopes = ["openid", "profile", "email"];
    const url = google.createAuthorizationURL(state, codeVerifier, scopes);

    // Store state and codeVerifier in HTTP-only cookies so the callback can use them
    res.cookie('google_oauth_state', state, {
        httpOnly: true,
        secure: true,
        maxAge: 10 * 60 * 1000, // 10 minutes
        sameSite: 'lax',
        path: '/'
    });
    res.cookie('google_code_verifier', codeVerifier, {
        httpOnly: true,
        secure:   true,
        maxAge: 10 * 60 * 1000,
        sameSite: 'lax',
        path: '/'
    });

    res.redirect(url.toString());
});

export default router;