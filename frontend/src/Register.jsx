import "./Register.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";


export default function Register() {
  const navigate = useNavigate();
  const [page, setPage] = useState("login");

  // Register states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");

  // Login states
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // verification
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${API_BASE_URL}/register`,
        { username, email, password, role },
        { withCredentials: true }
      );

      setMessage(res.data.message);
      setShowVerifyPopup(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  // VERIFY
  const handleVerify = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/verify-email`,
        { username, code: verificationCode },
        { withCredentials: true }
      );


      setMessage(res.data.message);
      setShowVerifyPopup(false);
      setPage("login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Verification failed");
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    axios.defaults.withCredentials = true;

    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        username: loginUser,
        password: loginPass,

      }, { withCredentials: true });



      localStorage.setItem("userRole", res.data.role);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("profilePic", res.data.profilePic || "");


      alert("Login Successful!");
      const userRole = res.data.role;

      localStorage.setItem("activeTab", "open");

      if (userRole === "admin") navigate("/admin-dashboard");
      else if (userRole === "teacher") navigate("/teacher-dashboard");
      else navigate("/student-dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page-wrapper">

      {/* ---------------- LEFT SIDE (Logo + Image) ---------------- */}
      <div className="left-side">
        <div className="floating-bg">

        </div>

        <div className="image-box">
          {/* You will replace this with your own design or image */}
          <h1 className="logo">Task Manager </h1>
          <p className="tagline">Your smart portal </p>
          <p className="image">a</p>

        </div>
      </div>

      {/* ---------------- RIGHT SIDE (Content + Navbar) ---------------- */}
      <div className="right-side">

        {/* NAV BAR */}
        <nav className="nav-bar">


          <button onClick={() => setPage("login")}>Login</button>
          <button onClick={() => setPage("register")}>Register</button>
          <button onClick={() => setPage("home")}>Why Us?</button>
        </nav>

        {/* ---------------- HOME PAGE ---------------- */}
        {page === "home" && (
          <div className="section">
            <h2> Why Choose Us?</h2>
            <h4>Stay Organized, Stay Ahead</h4>
            <p>Our task manager helps you bring clarity to your day. No more scattered notes or forgotten deadlines — everything you need is in one place.</p>

            <h4>Simple, Fast & Intuitive</h4>
            <p>Designed with a clean and minimal interface, managing tasks feels effortless. Add, edit, track, and complete tasks without any confusion or clutter.</p>
            <h4>Smart Reminders</h4>
            <p>Never miss a deadline again. Our intelligent reminder system notifies you exactly when you need it — not too early, not too late.</p>
            <h4>Personalized Productivity</h4>
            <p>Customize your workflow with categories, priorities, tags, and themes. Make the app adapt to your way of working, not the other way around.</p>


            <h4>Sync Across All Devices</h4>
            <p>Your tasks stay updated everywhere — mobile, desktop, or tablet. Continue working seamlessly from where you left off.</p>

            <h4>Team Collaboration Made Easy</h4>
            <p>Share tasks, assign responsibilities, and track progress together. Perfect for students, professionals, and teams alike.</p>

          </div>
        )}

        {/* ---------------- REGISTER PAGE ---------------- */}
        {page === "register" && (
          <div className="form-box">
            <h2>Create Account</h2>

            <form onSubmit={handleSubmit}>
              <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>

              <button type="submit">Register</button>
            </form>

            <p>
              Already registered?{" "}
              <span className="link" onClick={() => setPage("login")}>
                Login here
              </span>
            </p>

            {message && <p className="msg">{message}</p>}
          </div>
        )}

        {/* ---------------- LOGIN PAGE ---------------- */}
        {page === "login" && (
          <div className="form-box">
            <h2>Login</h2>

            <form onSubmit={handleLogin}>
              <input
                placeholder="Username"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />

              <button type="submit">Login</button>
            </form>

            <p>
              New user?{" "}
              <span className="link" onClick={() => setPage("register")}>
                Register here
              </span>
            </p>
          </div>
        )}

        {/* VERIFICATION POPUP */}
        {showVerifyPopup && (
          <div className="popup">
            <div className="popup-content">
              <h3>Enter Verification Code</h3>

              <input
                type="text"
                placeholder="Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />

              <button onClick={handleVerify}>Verify</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

