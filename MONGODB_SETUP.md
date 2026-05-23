# MongoDB Setup (Windows)

Your app needs MongoDB before the backend can start. The Vite errors (`ECONNREFUSED` on `/api/...`) mean the **backend is not running** because MongoDB was missing.

## Option A — Local MongoDB (recommended)

### 1. Install

In PowerShell (Admin):

```powershell
winget install MongoDB.Server --accept-package-agreements --accept-source-agreements
```

Or download the MSI: https://www.mongodb.com/try/download/community

### 2. Start MongoDB

```powershell
cd c:\Users\HP\.gemini\antigravity\scratch\hospital-management
npm run mongodb
```

Or in **Services** (`services.msc`), start **MongoDB** or **MongoDB Server**.

### 3. Verify

```powershell
Test-NetConnection 127.0.0.1 -Port 27017
```

`TcpTestSucceeded` should be `True`.

### 4. Run the app

```powershell
npm run dev
```

You should see: `✅ MongoDB Connected` and `🚀 Server running on http://localhost:5000`

---

## Option B — MongoDB Atlas (cloud, no local install)

1. Create a free cluster at https://www.mongodb.com/cloud/atlas  
2. **Database Access** → add a database user (username + password)  
3. **Network Access** → add IP `0.0.0.0/0` (for development) or your current IP  
4. **Connect** → Drivers → copy the connection string  
5. Edit `backend/.env`:

```
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hospital_management?retryWrites=true&w=majority
```

Replace `YOUR_USER`, `YOUR_PASSWORD`, and the cluster host. If the password has special characters, URL-encode them.

6. Run `npm run dev` from the project root.

---

## Your current `.env`

```
MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
```

Using `127.0.0.1` instead of `localhost` avoids common Windows IPv6 connection issues.
