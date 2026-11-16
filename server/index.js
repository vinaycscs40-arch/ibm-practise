require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const studyPlanRouter = require('./routes/studyPlan');
const prioritizeRouter = require('./routes/prioritize');
const askRouter = require('./routes/ask');
const progressRouter = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Rate-limit AI endpoints: 10 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests — please wait a moment and try again.' },
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/study-plan', aiLimiter, studyPlanRouter);
app.use('/api/prioritize', aiLimiter, prioritizeRouter);
app.use('/api/ask', aiLimiter, askRouter);
app.use('/api/progress', progressRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Smart Student Assistant backend running on port ${PORT}`);
});
