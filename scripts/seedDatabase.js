import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import fs from "fs";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Read data from JSON file
    const data = JSON.parse(fs.readFileSync("./data/products.json", "utf8"));

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    const result = await Product.insertMany(data);
    console.log(`${result.length} products inserted successfully`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
