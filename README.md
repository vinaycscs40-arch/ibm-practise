# Smart Student Assistant

> AI-powered study companion built on **Google Gemini** via the Gemini REST API.

## Features

| Feature | Description |
|---|---|
| 🗓 AI Study Planner | Generate a personalised day-by-day study schedule |
| 📋 Task Prioritizer | Rank tasks by urgency and difficulty using AI |
| 💬 Academic Assistant | Ask any academic question and get a structured answer |
| 📈 Progress Tracker | Track task completion with live progress bars |

## Prerequisites

- Node.js 18 or later
- A Google Gemini API key (free tier available at [Google AI Studio](https://aistudio.google.com/app/apikey))

## Setup

### 1. Clone / download the project

```bash
cd smart-student-assistant
```

### 2. Configure your Gemini API key

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and fill in your key:

```
GEMINI_API_KEY=your-gemini-api-key-here
PORT=5000
```

> **How to get a Gemini API key:**
> 1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
> 2. Sign in with your Google account.
> 3. Click **Create API key** and copy the generated key into `server/.env`.

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

## Running the Application

**Terminal 1 — Backend:**
```bash
cd server
node index.js
# → Backend running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# → Frontend running on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## Project Structure

```
smart-student-assistant/
├── server/
│   ├── index.js                   Express entry point
│   ├── .env                       Your API key (not committed)
│   ├── .env.example               Template — copy to .env and fill in your key
│   ├── routes/
│   │   ├── studyPlan.js           POST /api/study-plan
│   │   ├── prioritize.js          POST /api/prioritize
│   │   ├── ask.js                 POST /api/ask
│   │   └── progress.js            GET/POST/DELETE /api/progress
│   └── services/
│       └── granite.js             Gemini API client (retry + model fallback)
└── client/
    ├── vite.config.js             Proxy /api → :5000
    └── src/
        ├── App.jsx                Tab navigation shell
        ├── components/
        │   ├── Dashboard.jsx
        │   ├── StudyPlanGenerator.jsx
        │   ├── TaskPrioritizer.jsx
        │   ├── AcademicAssistant.jsx
        │   └── ProgressTracker.jsx
        └── styles/App.css
```

## Gemini Integration

- Primary model: `gemini-3.8-flash`
- Fallback chain on errors: `gemini-3.5-flash` → `gemini-3.5-flash-lite` → `gemini-flash-lite-latest`
- Max output tokens: 2048 (ask/study-plan), 1024 (prioritize)
- Automatic retry on 503 demand spikes and 429 quota errors
- Rate limiting: 10 AI requests per minute per IP

## Technology Stack

- **Frontend:** React 18, Vite, Axios, react-toastify, lucide-react
- **Backend:** Node.js, Express, Axios, dotenv, express-rate-limit
- **AI:** Google Gemini via the Gemini REST API (`generativelanguage.googleapis.com`)
