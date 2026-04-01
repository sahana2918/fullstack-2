import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load .env

const app = express();

/* ====== MONGOOSE CONNECTION LOGS ====== */
mongoose.connection.on("connected", () => {
  console.log("🟢 MongoDB Connected");
});
mongoose.connection.on("error", (err) => {
  console.log("🔴 DB Error:", err.message);
});
mongoose.connection.on("disconnected", () => {
  console.log("🟡 DB Disconnected");
});

/* ====== MIDDLEWARE ====== */
app.use(cors({ origin: "*" }));
app.use(express.json());

/* ====== DB CONNECTION FUNCTION ====== */
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;

    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      family: 4   // ✅ FIX ADDED HERE
    });

    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
  }
};

/* ====== SCHEMA & MODEL ====== */
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: String,
  date: { type: Date, default: Date.now },
});

const Contact =
  mongoose.models.Contact || mongoose.model("Contact", ContactSchema);

/* =====================================
              CRUD ROUTES
   ===================================== */

/* 🔵 READ ALL CONTACTS */
app.get("/contact", async (req, res) => {
  try {
    await connectDB();
    const data = await Contact.find().sort({ date: -1 });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* 🟢 CREATE CONTACT */
app.post("/contact", async (req, res) => {
  try {
    await connectDB();
    const contact = await Contact.create(req.body);

    res.status(201).json({
      success: true,
      message: "Contact added successfully ✔️",
      data: contact,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/* ✏️ UPDATE CONTACT */
app.put("/contact/:id", async (req, res) => {
  try {
    await connectDB();
    const updated = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, error: "Record not found" });

    res.json({ success: true, message: "Updated ✔️", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* 🗑 DELETE CONTACT */
app.delete("/contact/:id", async (req, res) => {
  try {
    await connectDB();
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ success: false, error: "Record not found" });

    res.json({ success: true, message: "Deleted ✔️" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =====================
     DEFAULT ROUTE
   ===================== */
app.get("/", (req, res) => {
  res.send("CRUD API Running Successfully 🚀");
});

/* 🔥 CONNECT DB */
connectDB();

/* =====================
       START SERVER
   ===================== */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));