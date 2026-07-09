const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

//Регистрация
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Имя пользователя и пароль обязательны" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Пароль должен быть не менее 6 символов" });
  }

  try {
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Имя пользователя уже занято" });
    }

    const newUser = await User.create(username, password);
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res
      .status(201)
      .json({ token, user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    console.error("Ошикбка регистрации", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//Авторизация
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Имя пользователя и пароль обязательны" });
  }
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Неверное имя пользователя или пароль" });
    }

    const isPasswordValid = await User.comparePassword(
      password,
      user.password.hash,
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Неверное имя пользователя или пароль" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("Ошибка авторизации", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
