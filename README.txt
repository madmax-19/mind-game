YADUNAND MIND GAME — CLEAN FIXED BUILD

This standalone browser game is based on the latest YADUNAND Mind Game UI.

FIXES:
- Rebuilt the pad input flow cleanly.
- Game-over sound is triggered directly from the wrong pad click.
- Added safer AudioContext resume handling.
- Added correct-round sound.
- Prevented duplicate game-over sound.
- Keyboard 1–4 controls remain supported.
- Player name and local leaderboard remain supported.
- No external audio files are required.

FILES:
index.html
style.css
script.js
arduino/mind_game.ino

Open index.html in a modern browser.


REAL DRUM PAD SOUNDS
Pad 1 = kick, Pad 2 = snare, Pad 3 = hi-hat, Pad 4 = tom. Local WAV samples are included in assets/.


SOUND CONTROL
- SOUND ON/OFF button
- Volume slider from 0% to 100%
- Volume preference is saved in the browser


GLOBAL LEADERBOARD SETUP
=========================
1. Create a Supabase project.
2. Open SQL Editor and run supabase-setup.sql.
3. Open script.js.
4. Replace YOUR_SUPABASE_PROJECT_URL with your Supabase Project URL.
5. Replace YOUR_SUPABASE_PUBLISHABLE_KEY with your Supabase Publishable key.
6. Keep the publishable key in the browser; NEVER put a Supabase secret/service-role key in this website.
7. Upload the complete folder to your web host.
8. The Leaderboard button loads the shared Top 10 from Supabase.

The existing local leaderboard remains as a fallback if Supabase is unavailable.
