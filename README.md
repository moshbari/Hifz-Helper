# Hifz Helper 📖

A Quran memorization verification app with speech-to-text transcription and AI-powered accuracy checking.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI Whisper (transcription) + GPT-4 (verification)
- **Hosting**: Railway
- **Domain**: Namecheap (custom subdomain)

## Features

- 🎤 Record Quran recitation
- 📝 Arabic speech-to-text transcription (Whisper)
- ✅ AI-powered verification against original text
- 📊 Color-coded accuracy feedback
- 📈 Progress tracking and statistics
- 🎨 7 beautiful themes (5 dark + 2 light)
- 📱 Mobile-first responsive design
- 👨‍🏫 Teacher review mode
- 🔐 User authentication

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- Supabase account
- Railway account
- Namecheap domain (optional)

### 1. Clone & Install

```bash
# Clone the repo
git clone <your-repo-url>
cd hifz-helper

# Install all dependencies
npm run install:all
```

### 2. Environment Setup

Create `server/.env`:

```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# OpenAI API Key
OPENAI_API_KEY=sk-your-key-here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the contents of `supabase-schema.sql`
4. Copy your API keys from Settings > API

### 4. Run Locally

```bash
# Start both frontend and backend
npm run dev

# Or separately:
npm run dev:server  # Backend on :3001
npm run dev:client  # Frontend on :5173
```

---

## ☁️ Deploy to Railway

### Step 1: Prepare Repository

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin <your-github-repo>
git push -u origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 3: Add Environment Variables

In Railway dashboard, add these variables:

```
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-app.up.railway.app
OPENAI_API_KEY=sk-your-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### Step 4: Deploy

Railway will automatically:
1. Detect the Node.js project
2. Install dependencies
3. Build the frontend
4. Start the server

Your app will be live at: `https://your-app.up.railway.app`

---

## 🌐 Custom Domain (Namecheap)

### Step 1: Get Railway Domain

1. In Railway, go to Settings > Domains
2. Click "Generate Domain" or note your current domain
3. Click "Custom Domain" and add: `hifz.yourdomain.com`

### Step 2: Configure Namecheap DNS

1. Log into Namecheap
2. Go to Domain List > Manage > Advanced DNS
3. Add a CNAME record:
   - **Host**: `hifz` (or your subdomain)
   - **Value**: `your-app.up.railway.app`
   - **TTL**: Automatic

4. Wait 5-30 minutes for DNS propagation

### Step 3: Update Environment

In Railway, update `CLIENT_URL`:
```
CLIENT_URL=https://hifz.yourdomain.com
```

---

## 📁 Project Structure

```
hifz-helper/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React contexts (Auth, Theme)
│   │   ├── hooks/          # Custom hooks (useRecording)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── utils/          # Helper functions
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express backend
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication
│   │   ├── transcribe.js   # Whisper transcription
│   │   ├── verify.js       # AI verification
│   │   ├── quran.js        # Quran data
│   │   └── attempts.js     # Practice history
│   ├── middleware/         # Auth middleware
│   ├── services/           # External services (OpenAI, Supabase)
│   ├── index.js            # Express app
│   └── package.json
│
├── supabase-schema.sql     # Database schema
├── railway.toml            # Railway config
├── nixpacks.toml           # Build config
└── package.json            # Root package.json
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/transcribe` | Transcribe audio |
| POST | `/api/verify` | Verify recitation |
| GET | `/api/quran/surahs` | List all surahs |
| GET | `/api/quran/surahs/:id/verses` | Get verses |
| GET | `/api/attempts` | Get practice history |
| POST | `/api/attempts` | Save attempt |
| DELETE | `/api/attempts/:id` | Delete attempt |
| GET | `/api/attempts/stats/summary` | Get statistics |

---

## 💰 Cost Estimates

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway | $5/month credit | ~$5-10/month |
| Supabase | 500MB DB, 2GB bandwidth | $25/month |
| OpenAI Whisper | - | ~$0.006/min |
| OpenAI GPT-4 | - | ~$0.01-0.03/verification |
| Namecheap | - | ~$10/year |

**Estimated monthly cost**: $15-30 for moderate usage

---

## 🛠️ Troubleshooting

### "Transcription failed"
- Check OpenAI API key is valid
- Ensure audio file is under 25MB
- Check browser supports MediaRecorder API

### "Database connection failed"
- Verify Supabase URL and keys
- Check RLS policies are set up
- Ensure schema is applied

### "Build failed on Railway"
- Check Node.js version (needs 18+)
- Verify all dependencies are listed
- Check build logs for specific errors

### "Custom domain not working"
- DNS propagation can take up to 48 hours
- Verify CNAME record is correct
- Check Railway custom domain settings

---

## 📝 License

MIT License - feel free to use for your own Quran learning projects!

---

## 🤲 Contributing

Contributions welcome! Please read our contributing guidelines first.

---

Made with ❤️ for the Quran memorization community
