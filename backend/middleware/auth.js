const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers["Authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Нет токена авторизации" });
  }
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Неверный формат токена" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Недействительный токен" });
  }
};
