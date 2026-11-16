const express = require('express');
const { generateText } = require('../services/granite');

const router = express.Router();

// POST /api/ask
// Body: { question, subject }
router.post('/', async (req, res) => {
  const { question, subject } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'question is required.' });
  }

  const subjectContext = subject && subject !== 'General' ? `Subject area: ${subject}\n` : '';

  const prompt = `You are a knowledgeable and patient academic tutor helping a student understand a topic.

${subjectContext}Student's question: ${question}

Provide a clear, accurate, and educational answer. Structure your response with:
1. A direct answer to the question
2. A clear explanation with key concepts
3. A simple example or analogy if helpful
4. Any related concepts the student should know

Keep the answer focused and appropriate for a student audience.`;

  try {
    const answer = await generateText(prompt, 2048);
    res.json({ answer });
  } catch (err) {
    console.error('Ask route error:', err.message);
    res.status(500).json({ error: err.userMessage || 'Failed to get an answer. Please try again.' });
  }
});

module.exports = router;
