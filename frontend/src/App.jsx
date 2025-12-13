import { Routes, Route } from "react-router-dom";
import Register from "./Register.jsx";
import StudentDashboard from "./StudentDashboard.jsx";
import TeacherDashboard from "./TeacherDashboard.jsx";
import TeacherUpload from "./components/Assignments/TeacherUpload";
import StudentAssignment from "./components/Assignments/StudentAssignment";
import CreateAssignment from "./CreateAssignment";
import ProtectedRoute from "./privateroute.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />

      {/* ---- PROTECTED ROUTES ---- */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher-dashboard"
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/upload"
        element={
          <ProtectedRoute>
            <TeacherUpload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute>
            <StudentAssignment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-assignment"
        element={
          <ProtectedRoute>
            <CreateAssignment />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
