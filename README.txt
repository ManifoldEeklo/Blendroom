BLENDROOM - install as an app on your iPhone (PWA)

A PWA must be opened from a web address (https). Put this folder online once,
then install it from Safari.

VERCEL (vercel.json is included: it makes updates arrive right away)

   Option 1 - Vercel CLI
   1. Install once:   npm i -g vercel
   2. In a terminal:  cd blendroom-pwa
   3. Run:            vercel          (log in, accept the defaults)
   4. Then:           vercel --prod   -> gives https://<project>.vercel.app

   Option 2 - Vercel dashboard + GitHub
   1. Put the contents of this folder in a GitHub repository.
   2. vercel.com/new -> Import the repository.
   3. Framework Preset: Other. Build Command: empty. Output Directory: . (dot)
   4. Deploy -> https://<project>.vercel.app
   Every push to GitHub updates the app automatically.

Other free hosts:

A) Netlify Drop (easiest, 2 minutes)
   1. On a computer, go to https://app.netlify.com/drop
   2. Drag this whole "blendroom-pwa" folder onto the page.
   3. You get a link like https://something.netlify.app

B) GitHub Pages
   1. Create a repository and upload the contents of this folder.
   2. Settings > Pages > Deploy from branch (main, root).
   3. Your link: https://<your-name>.github.io/<repository>/

Install on the iPhone
   1. Open the link in Safari.
   2. Tap Share, then "Add to Home Screen", then Add.
   3. Start Blendroom from its new icon: it opens full screen, without Safari bars.
   4. After the first start it also works offline.

Saving your mix on iPhone
   Tap "Download MP3". The share sheet opens; choose "Save to Files" (or AirDrop,
   Messages...). If it says "Your MP3 is ready", tap Download MP3 once more.

Updating: replace the files on your host. Open the app twice to get the new version.
