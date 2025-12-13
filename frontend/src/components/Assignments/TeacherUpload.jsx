import React, { useState } from "react";
import axios from "axios";

const TeacherUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);

  const teacherId = localStorage.getItem("userId"); // we will store this after login

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/assignments/create", {
        title,
        description,
        dueDate,
        createdBy: teacherId,
      });

      alert("Assignment created successfully!");
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (err) {
      alert("Error creating assignment");
    }
  };

  return (
    <div className="upload-container">
      <h2>Create Assignment</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Assignment Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />

        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default TeacherUpload;
