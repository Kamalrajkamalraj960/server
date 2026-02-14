const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/Users");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/crud")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ================= CREATE =================
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

// ================= READ ALL =================
app.get("/getUsers", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= READ ONE (🔥 FIXED) =================
app.get("/getUser/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ❗ invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await UserModel.findById(id);

    // ❗ not found
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE =================
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

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE =================
// DELETE USER
app.delete("/deleteUser/:id", async (req, res) => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🚀 START SERVER
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
