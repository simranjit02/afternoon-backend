import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const email = process.argv[2];
if (!email) {
  console.log("Usage: node scripts/setAdmin.js <email>");
  process.exit(1);
}

async function setAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "admin" },
      { new: true }
    );
    if (!user) {
      console.log("No user found with email:", email);
      process.exit(1);
    }
    console.log("Admin role set for:", user.email);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

setAdmin();
