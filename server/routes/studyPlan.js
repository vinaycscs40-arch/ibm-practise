const express = require('express');
const { generateText } = require('../services/granite');

const router = express.Router();

// POST /api/study-plan
// Body: { subject, examDate, hoursPerDay }
router.post('/', async (req, res) => {
  const { subject, examDate, hoursPerDay } = req.body;

  if (!subject || !examDate || !hoursPerDay) {
    return res.status(400).json({ error: 'subject, examDate, and hoursPerDay are required.' });
  }

  const today = new Date().toISOString().split('T')[0];
  const prompt = `You are an expert academic tutor. Create a detailed, day-by-day study plan for a student.

Subject: ${subject}
Today's date: ${today}
Exam date: ${examDate}
Available study hours per day: ${hoursPerDay}

Provide a structured study plan with:
1. A brief overview of the approach
2. Weekly breakdown of topics to cover
3. Daily time allocation suggestions
4. Key revision checkpoints
5. Final exam preparation tips

Be specific, practical, and encouraging.`;

  try {
    const plan = await generateText(prompt, 2048);
    res.json({ plan });
  } catch (err) {
    console.error('Study plan route error:', err.message);
    res.status(500).json({ error: err.userMessage || 'Failed to generate study plan. Please try again.' });
  }
});

module.exports = router;
