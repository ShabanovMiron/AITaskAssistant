import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.post("/tasks", {
        title: newTitle,
        description: newDescription,
      });
      setNewTitle("");
      setNewDescription("");
      fetchTasks();
    } catch (error) {
      console.error("Ошибка создания:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить задачу?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Ошибка удаления:", error);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditFields({
      title: task.title,
      description: task.description || "",
      status: task.status || "pending",
      priority: task.priority || "medium",
      category: task.category || "general",
    });
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/tasks/${id}`, editFields);
      setEditingId(null);
      fetchTasks();
    } catch (error) {
      console.error("Ошибка обновления:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div className="container">Загрузка задач...</div>;

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Мои задачи</h1>
        <div>
          <span style={{ marginRight: "15px" }}>Привет, {user?.username}!</span>
          <button className="btn btn-danger" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Новая задача</h3>
        <form onSubmit={handleCreate}>
          <div>
            <label>Название *</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Описание</label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows="2"
            />
          </div>
          <button type="submit" className="btn">
            Добавить
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Все задачи</h3>
        {tasks.length === 0 ? (
          <p>Задач пока нет. Создайте первую задачу.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Описание</th>
                <th>Статус</th>
                <th>Приоритет</th>
                <th>Категория</th>
                <th>Создана</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  {editingId === task.id ? (
                    <>
                      <td>
                        <input
                          value={editFields.title}
                          onChange={(e) =>
                            setEditFields({
                              ...editFields,
                              title: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={editFields.description}
                          onChange={(e) =>
                            setEditFields({
                              ...editFields,
                              description: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={editFields.status}
                          onChange={(e) =>
                            setEditFields({
                              ...editFields,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="pending">Ожидает</option>
                          <option value="in-progress">В работе</option>
                          <option value="done">Выполнено</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={editFields.priority}
                          onChange={(e) =>
                            setEditFields({
                              ...editFields,
                              priority: e.target.value,
                            })
                          }
                        >
                          <option value="high">Высокий</option>
                          <option value="medium">Средний</option>
                          <option value="low">Низкий</option>
                        </select>
                      </td>
                      <td>
                        <input
                          value={editFields.category}
                          onChange={(e) =>
                            setEditFields({
                              ...editFields,
                              category: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>{new Date(task.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-success"
                          onClick={() => handleUpdate(task.id)}
                        >
                          Сохранить
                        </button>
                        <button
                          className="btn btn-warning"
                          onClick={() => setEditingId(null)}
                        >
                          Отмена
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{task.title}</td>
                      <td>{task.description || "-"}</td>
                      <td>{task.status}</td>
                      <td>{task.priority || "-"}</td>
                      <td>{task.category || "-"}</td>
                      <td>{new Date(task.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-warning"
                          onClick={() => startEdit(task)}
                          style={{ marginRight: "5px" }}
                        >
                          Редакт.
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(task.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
