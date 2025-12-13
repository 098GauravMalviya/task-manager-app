import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("home");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedAssignment, setSelectedAssignment] = useState(null);


  const teacherId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("activeTab");
    navigate("/", {replace: true}); // since login is inside Register.jsx (page state)
  };

  const fetchAssignments = async () => {
    const res = await axios.get("http://localhost:3000/tasks/all");
    setAssignments(res.data);
  };

  useEffect(() => {
    if (activeSection === "approve") fetchAssignments();
  }, [activeSection]);

  const handleCreateAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("teacherId", teacherId);
      formData.append("deadline", deadline);
      if (file) formData.append("file", file);

      await axios.post(
        "http://localhost:3000/tasks/create",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Assignment Created!");
      setTitle("");
      setDescription("");
      setFile(null);

    } catch (error) {
      alert("Failed to create assignment");
    }
  };
  useEffect(() => {
  const id = localStorage.getItem("userId");

  axios.get(`http://localhost:3000/notifications/user/${id}`)
    .then(res => {
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    });
}, []);

const updateSubmission = async (taskId, submissionIndex, status) => {
  try {
    await axios.put("http://localhost:3000/tasks/submission/update", {
      taskId,
      submissionIndex,
      status
    });

    fetchAssignments(); // refresh list
    alert("Submission updated!");
  } catch (err) {
    console.log(err);
    alert("Failed to update submission");
  }
};

  return (
    <div className="teacher-dashboard">

      {/* SIDEBAR */}
      <aside className="teacher-sidebar">
        <div className="sidebar-brand">Teacher</div>
        <button className={activeSection === "home" ? "active sidebar-btn" : "sidebar-btn"} onClick={() => setActiveSection("home")}>🏠 Home</button>
        <button className={activeSection === "add" ? "active sidebar-btn" : "sidebar-btn"} onClick={() => setActiveSection("add")}>➕ Add Assignment</button>
        <button className={activeSection === "approve" ? "active sidebar-btn" : "sidebar-btn"} onClick={() => setActiveSection("approve")}>📥 View Submissions</button>
        <button className={activeSection === "grade" ? "active sidebar-btn" : "sidebar-btn"} onClick={() => setActiveSection("grade")}>📥 grade Submissions</button>
        <button className={activeSection === "profile" ? "active sidebar-btn" : "sidebar-btn"} onClick={() => setActiveSection("profile")}>👤 Profile</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="teacher-main">

        {/* NAVBAR */}
        <div className="teacher-navbar">
          <h2>Teacher Dashboard</h2>
          <div className="sd-right">
            <button 
              className="sd-btn sd-notification"
              onClick={() => setActiveSection("notifications")}
            >
              🔔 Notifications
               {unreadCount > 0 && (
    <span className="badge">{unreadCount}</span>
  )}
            </button>

            <button className="sd-btn sd-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="teacher-content">

          {activeSection === "home" && (
            <div className="sd-assignments-box">
    <h3>📘 Your Assignments</h3>

    {assignments.length === 0 ? (
      <p>No assignments created yet.</p>
    ) : (
      assignments.map((task, index) => (
        <div
          key={task._id}
          className="sd-assignment-card sd-clickable"
          onClick={() => setSelectedAssignment(task)}
        >
          <h4>{index + 1}. {task.title}</h4>
          <p>{task.description.substring(0, 80)}...</p>
          <p><strong>Deadline:</strong> {task.deadline}</p>
          <p><strong>Submissions:</strong> {task.submissions.length}</p>
        </div>
      ))
    )}

    {/* IF ASSIGNMENT IS CLICKED → DETAILS PAGE */}
    {selectedAssignment && (
      <div className="sd-assignment-details">
        <button
          className="sd-back-btn"
          onClick={() => setSelectedAssignment(null)}
        >
          ⬅ Back
        </button>

        <h2>{selectedAssignment.title}</h2>
        <p><strong>Description:</strong> {selectedAssignment.description}</p>
        <p><strong>Deadline:</strong> {selectedAssignment.deadline}</p>

        <h3>📥 Submissions ({selectedAssignment.submissions.length})</h3>

        {selectedAssignment.submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          selectedAssignment.submissions.map((s, i) => (
            <div key={i} className="sd-submission-card">
              <p><strong>Student:</strong> {s.studentName || s.studentId}</p>
              <p><strong>Submitted:</strong> {new Date(s.submittedAt).toLocaleString()}</p>
              <a className="sd-download-btn" href={s.fileUrl} target="_blank">
                Download
              </a>
            </div>
          ))
        )}
      </div>
    )}

  </div>
          )}

          {activeSection === "add" && (
            <>
              <h3>Add Assignment</h3>

              <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} /><br></br>

              <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} /><br></br>

              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /><br></br>

              <input type="file" onChange={(e) => setFile(e.target.files[0])} />

              <button onClick={handleCreateAssignment}>Create Assignment</button>
            </>
          )}

          {activeSection === "approve" && (
  <div className="sd-assignments-box">
    <h3>📋 Approve Submissions</h3>

    {assignments.length === 0 ? (
      <p>No assignments created.</p>
    ) : (
      assignments.map((task, tIndex) => (
        <div key={task._id} className="sd-assignment-card">

          <h4>{tIndex + 1}. {task.title}</h4>
          <p>{task.description.substring(0, 80)}...</p>
          <p><strong>Deadline:</strong> {task.deadline}</p>

          {task.submissions.length === 0 ? (
            <p>No submissions yet.</p>
          ) : (
            task.submissions.map((s, sIndex) => (
              <div key={sIndex} className="sd-submission-card">

                <p><strong>Student:</strong> {s.studentId.username}</p>
                <p><strong>Submitted:</strong> {new Date(s.submittedAt).toLocaleString()}</p>

                <a className="sd-download-btn" href={s.fileUrl} target="_blank">
                  Download
                </a>

                {/* STATUS DISPLAY */}
                <p><strong>Status:</strong> {s.status || "pending"}</p>

                {/* ACTION BUTTONS */}
                <button 
                  className="approve-btn"
                  onClick={() => updateSubmission(task._id, sIndex, "approved")}
                >
                  Approve
                </button>

                <button 
                  className="reject-btn"
                  onClick={() => updateSubmission(task._id, sIndex, "rejected")}
                >
                  Reject
                </button>

              </div>
            ))
          )}

        </div>
      ))
    )}
  </div>
)}

{activeSection === "profile" && (
  <div className="sd-welcome-box">
    <h3>👤 Profile</h3>

    <div className="profile-info">
      <p><strong>Name:</strong> {localStorage.getItem("username")}</p>
      <p><strong>Email:</strong> {localStorage.getItem("email")}</p>
      <p><strong>Role:</strong> {localStorage.getItem("userRole")}</p>
    </div>
  </div>
)}


        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;


