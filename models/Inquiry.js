import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    textmessage: { type: String, required: true },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);
