Converted web app (first pass)

This folder contains a Vite React app converted from the React Native project. It mirrors screens and styles closely using React + CSS.

How to run (Windows cmd.exe):

```cmd
cd "ShieldX- Web"
npm install
npm run dev
```

What I converted:
- Full `Home` screen (matching layout and panic button behavior)
- Basic pages for Login, Signup, Chat, Location, Alerts, Evidence as placeholders wired into the router
- Shared CSS closely matching the React Native styles

Next steps I can do on request:
- Add exact icon replacements and interactive navigation bar
- Implement map (Location) using Leaflet or Google Maps
- Implement file upload for Evidence and integrate API endpoints
- Convert remaining screens with fidelity and accessibility improvements

If you want me to continue and convert every RN screen precisely to web components (no RN imports), tell me and I will proceed screen-by-screen.

## Backend API (optional)

You can connect the frontend to the Node/Express backend to use real MongoDB-backed signup/login.

1. Start the server in `server/` and set the API URL in your frontend environment. With Vite you should use a Vite-prefixed env var:

   - create a `.env` file in the frontend root with (Vite):
     VITE_API_URL=http://localhost:4000

   - or for older setups you can use the CRA-style var:
     REACT_APP_API_URL=http://localhost:4000

2. Restart the dev server. Signup/Login will call the backend endpoints when `VITE_API_URL` or `REACT_APP_API_URL` is set.

If not set, the app falls back to the local `localStorage`-based auth (demo mode).