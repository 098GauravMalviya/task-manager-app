import { useState } from "react";
import axios from "axios";

export default function CreateAssignment() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();

    const teacherId = localStorage.getItem("userId");

    try {
      await axios.post("http://localhost:3000/tasks/create", {
        title,
        description,
        teacherId
      });

      alert("Assignment Created!");
      window.location.href = "/teacher-dashboard";

    } catch (err) {
      alert("Error creating assignment");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Create New Assignment</h2>

      <form onSubmit={handleCreate}>
        <input 
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">Create</button>
      </form>
    </div>
  );
}
