import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/tasks",
        { title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");

      fetchTasks();
    } catch (error) {
      console.log(error.response?.data || error.message);

      alert("Could not create task");
    }
  };

  return (
    <div>
      <Navbar user={true} />

      <h1>Tasks</h1>

      <h2>Create Task</h2>

      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button type="submit">Add Task</button>
      </form>

      <h2>Your Tasks</h2>

      {tasks.map((task) => (
        <div key={task._id}>
          <h3>{task.title}</h3>
        </div>
      ))}
    </div>
  );
}

export default Tasks;