require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/Users");

const app = express();

require("dotenv").config();
mongoose.connect(process.env.MONGO_URI);


/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ENV CONFIG ================= */
const PORT = process.env.PORT || 3001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crud";

/* ================= MONGODB CONNECTION ================= */
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

/* ================= BASIC FRONTEND ================= */
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Backend Status</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 100px;
            background: #f4f4f4;
          }
          .card {
            display: inline-block;
            padding: 40px;
            border-radius: 10px;
            background: white;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          }
          h1 { color: green; }
          button {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            background: black;
            color: white;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ Backend is Running</h1>
          <p>Server is live 🚀</p>
          <button onclick="checkUsers()">Check Users API</button>
          <p id="result"></p>
        </div>

        <script>
          function checkUsers() {
            fetch('/getUsers')
              .then(res => res.json())
              .then(data => {
                document.getElementById("result").innerText =
                  "Total Users: " + data.length;
              })
              .catch(err => {
                document.getElementById("result").innerText =
                  "API Error";
              });
          }
        </script>
      </body>
    </html>
  `);
});

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
  });
});

/* ================= CREATE ================= */
app.post("/createUser", async (req, res) => {
  try {
    const user = await UserModel.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

/* ================= READ ALL ================= */
app.get("/getUsers", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= READ ONE ================= */
app.get("/getUser/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= UPDATE ================= */
app.put("/updateUser/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

mongoose.connection.once("open", () => {
  console.log("Connected DB:", mongoose.connection.name);
});


/* ================= DELETE ================= */
app.delete("/deleteUser/:id", async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
