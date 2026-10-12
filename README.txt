BLENDROOM + BLENDROOM MESSAGES
==============================

This folder contains two apps on one Vercel project:
  /          Blendroom (the DJ app, installable PWA)
  /admin/    Blendroom Messages (your app to push messages to everyone)
  /api/      the small server part that stores devices and sends pushes

ONE-TIME SETUP ON VERCEL
------------------------
1. Make your VAPID keys (on a computer with Node.js):
     npx web-push generate-vapid-keys
   You get a Public Key and a Private Key. Never share the private key.

2. Add a database (stores which devices may receive messages):
   Vercel dashboard > your project > Storage > Create Database
   > "Upstash for Redis" (free plan is fine) > connect it to this project.
   Vercel then adds KV_REST_API_URL and KV_REST_API_TOKEN automatically.

3. Add Environment Variables (Project > Settings > Environment Variables):
     VAPID_PUBLIC_KEY    = the public key from step 1
     VAPID_PRIVATE_KEY   = the private key from step 1
     VAPID_SUBJECT       = mailto:you@yourmail.com
     ADMIN_TOKEN         = a long secret password for Blendroom Messages

4. Deploy (package.json is included, Vercel installs what it needs):
     CLI:     cd blendroom-pwa && vercel --prod
     GitHub:  push the folder contents; Framework Preset "Other",
              Build Command empty, Output Directory "."

EVERY IPHONE THAT SHOULD RECEIVE MESSAGES
-----------------------------------------
1. Open https://<project>.vercel.app in Safari > Share > Add to Home Screen.
2. Start Blendroom from the icon, tap the bell "Notifications" > Allow.
   The device is now registered. Blendroom also appears in
   Settings > Notifications.

YOUR MESSAGE APP
----------------
1. Open https://<project>.vercel.app/admin/ in Safari > Share > Add to Home Screen.
   It installs as "BR Messages" with its own icon.
2. Unlock with your ADMIN_TOKEN (remembered on that phone; tap Lock to forget it).
3. Write a title, message and the link that opens when tapped, check the preview,
   tap "Send to N devices". Devices that uninstalled Blendroom are removed automatically.

Needs iOS 16.4 or newer. Updating: deploy again, then open the app twice.
