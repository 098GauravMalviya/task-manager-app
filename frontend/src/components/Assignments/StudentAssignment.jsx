import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";

const StudentAssignment = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/assignments/all`)
      .then(res => setAssignments(res.data))
      .catch(() => alert("Error fetching assignments"));
  }, []);

  return (
    <div className="assignments-container">
      <h2>Available Assignments</h2>

      {assignments.length === 0 ? (
        <p>No assignments yet</p>
      ) : (
        assignments.map((ass) => (
          <div key={ass._id} className="assignment-card">
            <h3>{ass.title}</h3>
            <p>{ass.description}</p>
            <p><b>Due:</b> {new Date(ass.dueDate).toDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentAssignment;