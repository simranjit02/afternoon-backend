import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import userRoutes from "./routes/users.js";
import inquiryRoutes from "./routes/inquiries.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: allow frontend origins so login/cart work from localhost (store + admin)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes (order matters: specific paths first)
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes); // GET /api/users = list users (admin)
app.use("/api/inquiries", inquiryRoutes); // POST = contact form, GET = admin list

// Health check
app.get("/", (req, res) => {
  res.json({ message: "E-commerce API is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
