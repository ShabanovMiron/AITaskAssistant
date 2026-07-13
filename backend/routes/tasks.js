const express = require("express");
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const analyzeTask = require("../services/analyzer");

const router = express.Router();

router.use(auth);

// Получить все задачи пользователя
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.findAllByUser(req.userId);
    res.json(tasks);
  } catch (error) {
    console.error("Ошибка получения задач:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Создать задачу
router.post("/", async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Название задачи обязательно" });
  }

  try {
    const text = description ? `${title} ${description}` : title;
    const { priority, category } = await analyzeTask(text);

    const newTask = await Task.create(
      req.userId,
      title,
      description,
      priority,
      category,
    );
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Ошибка создания задачи:", error);
    try {
      const newTask = await Task.create(
        req.userId,
        title,
        description,
        "medium",
        "general",
      );
      res.status(201).json(newTask);
    } catch (err) {
      res.status(500).json({ error: "Не удалось создать задачу" });
    }
  }
});

// Обновить задачу
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, category } = req.body;

  try {
    const updated = await Task.update(id, req.userId, {
      title,
      description,
      status,
      priority,
      category,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ error: "Задача не найдена или доступ запрещён" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Ошибка обновления задачи:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Удалить задачу
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Task.delete(id, req.userId);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: "Задача не найдена или доступ запрещён" });
    }
    res.json({ message: "Задача удалена", task: deleted });
  } catch (error) {
    console.error("Ошибка удаления задачи:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

module.exports = router;
