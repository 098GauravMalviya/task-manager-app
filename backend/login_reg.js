require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = 3000;
// cors because backend and front end are running on different port numbers
const cors = require("cors");
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"], // <-- change to your React app origin (protocol + host + port)
  credentials: true
}));

app.use("/uploads", express.static("uploads"));
// --------------------------------------------------
// Serve HTML files from /public
// --------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.set("trust proxy", 1);

app.use(
  session({
    secret: "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // keep false since you are on http localhost
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);
//upload assignment 
const taskRoutes = require("./routes/taskRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userdata');

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB error:", err);
});



// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,

    // different roles in the user schema
   role: {
    type: String,
    enum: ["admin", "teacher", "student"],
    default: "student"
  },

  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  currentToken: { type: String },   // ← ADD THIS
  lastLogin: { type: Date }
});

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/notifications", notificationRoutes);


const User = mongoose.model('User', userSchema);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "vishwakarmag018@gmail.com",
    pass: "lszghbzptjhkezbr"
  }
});

app.use("/tasks", taskRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/submissions", submissionRoutes);

function verifySession(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

app.get("/auth/check", verifySession, (req, res) => {
  res.json({
    loggedIn: true,
    role: req.session.role,
    userId: req.session.userId
  });
});

// Register route
app.post('/register', async (req, res) => {
  const { username, password, email, role } = req.body;

  console.log("Received data:", req.body); 

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Please provide username, email and password' });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role: role||"student",
    verificationCode,
    isVerified: false
  });

  await newUser.save();

  console.log("Verification Code (for testing):", verificationCode);

  // Try sending email - but even if it fails, register still works
  try {
    await transporter.sendMail({
      from: "your_email@gmail.com",
      to: email,
      subject: "Email Verification Code",
      text: `Your verification code is: ${verificationCode}`
    });

    res.status(201).json({ message: 'User registered. Check email for verification code.' });
  } 
  catch (error) {
    console.log("Email sending failed:", error.message);

    res.status(201).json({
      message: 'User registered BUT email failed. Check console for verification code.',
      code: verificationCode
    });
  }
});

// Verify Email Route
app.post('/verify-email', async (req, res) => {
  const { username, code } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({ message: "User not found" });

  if (user.verificationCode !== code)
    return res.status(400).json({ message: "Invalid verification code" });

  user.isVerified = true;
  user.verificationCode = null;
  await user.save();

  res.json({ message: "Email verified successfully!" });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Please provide username and password' });

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  if (!user.isVerified)
    return res.status(400).json({ message: "Email not verified" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

  // Invalidate any previous login by storing current token in user doc
  user.currentToken = token;
  user.lastLogin = new Date();
  await user.save();

  req.session.token = token;
  req.session.userId = user._id;
  req.session.role = user.role;
  req.session.save(err => {
    if (err) {
      console.log("Session save error:", err);
      return res.status(500).json({ message: "Session error" });
    }

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      role: user.role,
      userId: user._id
    });
  });
});



// Profile route
app.get('/profile', async (req, res) => {
  if (!req.session.token)
    return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(req.session.token, 'your_jwt_secret');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Invalid session or token' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err)
      return res.status(500).json({ message: 'Error logging out' });
    
    res.json({ message: 'Logged out successfully' });
  });
});

// NOTIFICATIONS API
const Notification = require("./models/Notification");

// SEND NOTIFICATION
app.post("/notifications/send", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message)
    return res.status(400).json({ message: "Missing data" });

  const note = new Notification({ userId, message });
  await note.save();

  res.json({ success: true });
});

// GET USER NOTIFICATIONS
app.get("/notifications/user/:id", async (req, res) => {
  const notes = await Notification.find({ userId: req.params.id })
    .sort({ createdAt: -1 });

  res.json(notes);
});

// MARK AS READ
app.put("/notifications/mark/:id", async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



