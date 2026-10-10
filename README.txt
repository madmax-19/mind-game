MAD MAX MIND GAME — UNIFIED PORTFOLIO UI

This build uses the same dark, dimensional violet/cyan design language as the MAD MAX portfolio while preserving the playable memory game.

FILES
- index.html — game page
- style.css — unified dark violet/cyan styles and responsive layout
- script.js — game logic, sound controls, local scores, and Supabase leaderboard
- assets/kick.wav, assets/snare.wav, assets/hihat.wav, assets/tom.wav — local sound samples used by the game
- supabase-setup.sql — leaderboard table and RPC setup
- arduino/mind_game.ino — Arduino sketch supplied with the prior game build

RUN LOCALLY
Keep all files and the assets/ folder together, then open index.html in a modern browser. The page also loads Google Fonts and Supabase JS from their CDNs when internet access is available.

ADD TO YOUR PORTFOLIO
Upload this folder as a subfolder (for example, /mind-game/) alongside the portfolio homepage. The top-left brand and portfolio link point to ../index.html. Do not overwrite the main portfolio index.html with this game's index.html.

GLOBAL LEADERBOARD
The supplied project reference is configured as https://fvxbxtucmjqkaitryizv.supabase.co with the supplied publishable key. The leaderboard still requires that the Supabase project exists and that supabase-setup.sql has been run in its SQL Editor. If your project's URL is different, replace SUPABASE_URL at the top of script.js. Use only a publishable/anon key in client-side code; never put a secret or service-role key in the browser.

The game's four signals remain visually distinct (violet, cyan, yellow, and red) for gameplay, while surrounding components use the same violet/cyan styling as the portfolio.


MAD MAXX LOGO
- The MAD MAXX emblem is used in the top-left brand area.
- assets/favicon.png is used as the browser tab icon.
- Keep the assets folder beside index.html, style.css and script.js.


MAD MAX BRANDING + LIQUID BACKGROUND
- MAD MAX is the site owner/brand throughout the page and project notes.
- water-background.html provides the animated liquid surface.
- index.html forwards mouse movement and clicks to the background so the liquid reacts to interaction.
- Keep water-background.html beside index.html and style.css.
- For the complete game, keep the original assets/ folder (sound samples, favicon and MAD MAX logo) beside these files if you already have it.
- The localStorage key names in script.js are intentionally retained so previously saved local scores, player names and volume settings are not lost.
