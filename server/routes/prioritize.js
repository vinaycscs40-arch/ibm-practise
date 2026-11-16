const express = require('express');
const { generateText } = require('../services/granite');

const router = express.Router();

// POST /api/prioritize
// Body: { tasks: [{ name, deadline, difficulty }] }
router.post('/', async (req, res) => {
  const { tasks } = req.body;

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: 'tasks array is required and must not be empty.' });
  }

  const taskList = tasks
    .map((t, i) => `${i + 1}. Task: "${t.name}" | Deadline: ${t.deadline} | Difficulty: ${t.difficulty}`)
    .join('\n');

  const today = new Date().toISOString().split('T')[0];
  const prompt = `You are a productivity expert helping a student prioritize their academic tasks.

Today's date: ${today}

Tasks to prioritize:
${taskList}

Analyze each task considering urgency (deadline proximity) and importance (difficulty level).
Provide:
1. A numbered priority ranking from most to least urgent/important
2. A brief reason for each task's rank
3. A suggested daily schedule for the next 3 days
4. Any tasks that can be batched or done together

Be concise and actionable.`;

  try {
    const result = await generateText(prompt, 1024);
    res.json({ result });
  } catch (err) {
    console.error('Prioritize route error:', err.message);
    res.status(500).json({ error: err.userMessage || 'Failed to prioritize tasks. Please try again.' });
  }
});

module.exports = router;
