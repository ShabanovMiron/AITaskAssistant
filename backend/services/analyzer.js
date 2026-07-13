const axios = require("axios");

async function analyzeTask(text) {
  try {
    const response = await axios.post(
      process.env.PYTHON_SERVICE_URL,
      { text },
      {
        timeout: 3000,
      },
    );
    return response.data; // { priority, category }
  } catch (error) {
    console.error("Ошибка вызова Python-сервиса:", error.message);
    return { priority: "medium", category: "general" };
  }
}

module.exports = analyzeTask;
