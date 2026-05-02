import express from 'express'
import * as arctic from "arctic";
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'
import dotenv from 'dotenv'
import { Credentials } from '../Model/Credentials.js';

const router = express.Router()
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// ─── Google OAuth Config ───────────────────────────────────────────────────────
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectURI = process.env.GOOGLE_REDIRECT_URI ;

// Step 2: Handle Google's callback — exchange code for tokens
router.get('/', async (req, res) => {
    const { code, state } = req.query;
    const storedState = req.cookies.google_oauth_state;
    const storedCodeVerifier = req.cookies.google_code_verifier;

    res.clearCookie('google_oauth_state', { path: '/' });
    res.clearCookie('google_code_verifier', { path: '/' });

    try {
        const google = new arctic.Google(googleClientId, googleClientSecret, googleRedirectURI);

        const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
        const accessToken = tokens.accessToken();

        const idToken = tokens.idToken();
        const claims = arctic.decodeIdToken(idToken);

        const googleUser = {
            googleId: claims.sub,
            email: claims.email,
            name: claims.name,
            picture: claims.picture,
            emailVerified: claims.email_verified,
        };

        // console.log('Google user authenticated:', googleUser.email);

        let user = await Credentials.findOne({ Email: googleUser.email });
        if (!user) {
            user = new Credentials({
                Username: googleUser.name,
                Email: googleUser.email,
                googleId: googleUser.googleId,
                picture: googleUser.picture,
                authProvider: 'google',
            });
            await user.save();
        }

        // console.log("Passed ", user)

        const jwtToken = jwt.sign(
            {
                id: user._id,
                Email: googleUser.email,
                Username: googleUser.name,
                picture: googleUser.picture,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        const frontendURL = process.env.FRONTEND_URL;
        return res.redirect(`${frontendURL}/auth/callback?token=${jwtToken}`);

    } catch (e) {
        console.error('Google OAuth error:', e);

        if (e instanceof arctic.OAuth2RequestError) {
            return res.status(400).json({ error: 'Invalid authorization code or credentials.', code: e.code });
        }
        if (e instanceof arctic.ArcticFetchError) {
            return res.status(502).json({ error: 'Failed to communicate with Google servers.' });
        }

        res.status(500).json({ error: 'Authentication failed. Please try again.' });
    }
});

export default router;