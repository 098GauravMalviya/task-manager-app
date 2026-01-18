import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";
import "./StudentDashboard.css";

axios.defaults.withCredentials = true;

const StudentDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/auth/check`, { withCredentials: true })
      .then(res => {
        if (res.data.role !== "student") {
          localStorage.clear();
          navigate("/", { replace: true });
        }
      })
      .catch(err => {
        localStorage.clear();
        navigate("/", { replace: true });
      });
  }, []);

  // 🚨 CHECK SESSION IMMEDIATELY WHEN STUDENT DASHBOARD OPENS
  useEffect(() => {
    const alreadyOpen = sessionStorage.getItem("tabOpen");

    if (alreadyOpen) {
      alert("You already have this dashboard open in another tab.");
      navigate("/", { replace: true });
      return;
    }

    sessionStorage.setItem("tabOpen", "true");

    return () => {
      sessionStorage.removeItem("tabOpen");
    };
  }, []);



  // ❌ BLOCK MULTIPLE-TAB LOGIN
  useEffect(() => {
    // If userRole is missing → user is not logged in
    const role = localStorage.getItem("userRole");
    const id = localStorage.getItem("userId");

    // 🚫 Not logged in
    if (!role || !id) {
      navigate("/", { replace: true });
      return;
    }

    // 🚫 Wrong role (only student allowed here)
    if (role !== "student") {
      navigate("/", { replace: true });
      return;
    }
  }, []);

  // 🚫 Disable Back / Forward Navigation Cache

  const [activeSection, setActiveSection] = useState("home");
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);

  const [activeCount, setActiveCount] = useState(0);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [grades, setGrades] = useState([]);

  const fetchGrades = async () => {
    try {
      const studentId = localStorage.getItem("userId");

      const res = await axios.get(`${API_BASE_URL}/tasks/student/${studentId}`);
      setGrades(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (activeSection === "grades") {
      fetchGrades();
    }
  }, [activeSection]);


  useEffect(() => {
    if (activeSection === "view") {
      fetchAssignments();
    }
  }, [activeSection]);

  const fetchAssignments = async (task) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/all`, { withCredentials: true });
      setAssignments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!submissionFile) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", submissionFile);
    formData.append("taskId", selectedAssignment._id);
    formData.append("studentId", localStorage.getItem("userId"));

    try {
      await axios.post(`${API_BASE_URL}/tasks/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" }, withCredentials: true
      });

      alert("Assignment Submitted!");
    } catch (err) {
      console.log(err);
      alert("Submission failed");
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("userId");

    axios.get(`${API_BASE_URL}/notifications/user/${id}`)
      .then(res => {
        setNotifications(res.data);
        const unread = res.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("activeTab");
    navigate("/", { replace: true }); // since login is inside Register.jsx (page state)
  };

  return (
    <div className="student-dashboard">

      {/* SIDEBAR */}
      <div className="sd-sidebar">
        <h2 className="sd-sidebar-title">Student</h2>

        <button
          className={`sd-sidebar-btn ${activeSection === "home" && "active"}`}
          onClick={() => setActiveSection("home")}
        >
          🏠 Home
        </button>

        <button
          className={`sd-sidebar-btn ${activeSection === "view" && "active"}`}
          onClick={() => {
            setActiveSection("view");
            fetchAssignments();
          }
          }
        >
          📄 View Assignments

        </button>

        <button
          className={`sd-sidebar-btn ${activeSection === "upload" && "active"}`}
          onClick={() => setActiveSection("upload")}
        >
          ⬆ Upload Assignment

        </button>

        <button
          className={`sd-sidebar-btn ${activeSection === "grades" && "active"}`}
          onClick={() => setActiveSection("grades")}
        >
          📊 Grades
        </button>

        <button
          className={`sd-sidebar-btn ${activeSection === "profile" && "active"}`}
          onClick={() => setActiveSection("profile")}
        >
          👤 Profile
        </button>
      </div>

      {/* MAIN PAGE */}
      <div className="sd-main">

        {/* NAVBAR */}
        <div className="sd-navbar">
          <h2 className="sd-title">Student Dashboard</h2>

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

        {/* CONTENT */}
        <div className="sd-content">

          {activeSection === "home" && (
            <div className="sd-welcome-box">
              <h3>Welcome Student!</h3>
              <p>Your assignments and updates will appear here.</p>
            </div>
          )}

          {activeSection === "view" && (
            <div className="sd-assignments-box">

              <h3>📄 View Assignments</h3>

              {selectedAssignment === null ? (
                assignments.length === 0 ? (
                  <p>No assignments posted yet.</p>
                ) : (
                  assignments.map((a, index) => (
                    <div
                      key={a._id}
                      className="sd-assignment-card sd-clickable"
                      onClick={() => setSelectedAssignment(a)}
                    >
                      <h4>{index + 1}. {a.title}</h4>

                      <p>{a.description.substring(0, 30)}...</p>

                      <p>
                        <strong>Deadline:</strong> {a.deadline}
                      </p>
                    </div>
                  ))
                )
              ) : (
                // FULL DETAILS PAGE
                <div className="sd-assignment-details">
                  <button className="sd-back-btn" onClick={() => setSelectedAssignment(null)}>
                    ⬅ Back
                  </button>

                  <h2>{selectedAssignment.title}</h2>
                  <p><strong>Description:</strong> {selectedAssignment.description}</p>
                  <p><strong>Deadline:</strong> {selectedAssignment.deadline}</p>

                  {selectedAssignment.fileUrl ? (
                    <>
                      <p><strong>Attached File:</strong></p>
                      <a
                        href={selectedAssignment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sd-download-btn"
                      >
                        📥 Download File
                      </a>
                    </>
                  ) : (
                    <p>No file uploaded.</p>
                  )}

                  {/* STUDENT SUBMISSION SECTION */}
                  <div className="sd-submit-box">
                    <h3>Submit Your Work</h3>

                    <input
                      type="file"
                      onChange={(e) => setSubmissionFile(e.target.files[0])}
                    />

                    <button
                      className="sd-submit-btn"
                      onClick={handleSubmitAssignment}
                    >
                      📤 Submit Assignment
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}



          {activeSection === "upload" && (
            <div className="sd-welcome-box">
              <h3>⬆ Upload Assignment</h3>
              <p>Select assignment and upload your file.</p>

              <div className="upload-box">

                {/* SELECT ASSIGNMENT */}
                <select
                  value={selectedAssignment?._id || ""}
                  onChange={(e) => {
                    const found = assignments.find(a => a._id === e.target.value);
                    setSelectedAssignment(found);
                  }}
                  required
                >
                  <option value="">Select Assignment</option>
                  {assignments.map((a) => (
                    <option key={a._id} value={a._id}>{a.title}</option>
                  ))}
                </select>

                {/* FILE INPUT */}
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                  required
                />

                {/* SUBMIT BUTTON */}
                <button type="button" onClick={handleSubmitAssignment}>
                  Submit Assignment
                </button>
              </div>
            </div>
          )}



          {activeSection === "grades" && (
            <div className="sd-assignments-box">
              <h3>📊 Grades</h3>

              {grades.length === 0 ? (
                <p>No submissions yet.</p>
              ) : (
                grades.map((task, tIndex) => {
                  const mySubmission = task.submissions.find(
                    (s) => s.studentId?._id === localStorage.getItem("userId")
                  );

                  return (
                    <div key={task._id} className="sd-assignment-card">
                      <h4>{tIndex + 1}. {task.title}</h4>
                      <p>{task.description.substring(0, 80)}...</p>
                      <p><strong>Submitted:</strong> {new Date(mySubmission.submittedAt).toLocaleString()}</p>

                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          style={{
                            color:
                              mySubmission.status === "approved"
                                ? "green"
                                : mySubmission.status === "rejected"
                                  ? "red"
                                  : "orange"
                          }}
                        >
                          {mySubmission.status || "Pending"}
                        </span>
                      </p>

                      <p>
                        <strong>Grade:</strong>{" "}
                        {mySubmission.grade || "Not graded"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}


          {activeSection === "profile" && (
            <div className="sd-welcome-box">
              <h3>👤 Profile</h3>
              <p>Your personal details and settings.</p>
              <div className="profile-info">


                <div className="profile-fields">
                  <p><strong>Name:</strong> {localStorage.getItem("username")}</p>
                  <p><strong>Role:</strong> {localStorage.getItem("userRole")}</p>
                  <p><strong>Email:</strong> {localStorage.getItem("email")}</p>
                </div>
              </div>



            </div>
          )}

          {activeSection === "notifications" && (
            <div className="sd-welcome-box">
              <h3>🔔 Notifications</h3>
              <p>Latest updates from teachers will be shown here.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


