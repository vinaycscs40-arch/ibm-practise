const express = require('express');

const router = express.Router();

// In-memory store — resets on server restart (suitable for hackathon demo)
let tasks = [];
let nextId = 1;

// GET /api/progress — return all tasks
router.get('/', (_req, res) => {
  res.json({ tasks });
});

// POST /api/progress — add a new task or update an existing one
// Body: { id?, name, status, percent }
//   id present  → update existing task
//   id absent   → create new task
router.post('/', (req, res) => {
  const { id, name, status, percent } = req.body;

  if (!name || status === undefined || percent === undefined) {
    return res.status(400).json({ error: 'name, status, and percent are required.' });
  }

  const pct = Math.min(100, Math.max(0, Number(percent)));

  if (id) {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: `Task with id "${id}" not found.` });
    }
    tasks[index] = { id, name, status, percent: pct };
    return res.json({ task: tasks[index] });
  }

  // New task
  const task = { id: nextId++, name, status, percent: pct };
  tasks.push(task);
  res.status(201).json({ task });
});

// DELETE /api/progress/:id — remove a task
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Task with id "${id}" not found.` });
  }
  tasks.splice(index, 1);
  res.json({ message: 'Task removed.' });
});

module.exports = router;
