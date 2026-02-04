import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    imageOne: String,
    imageTwo: String,
    imageThree: String,
    productName: String,
    productPrice: String,
    productOnSale: String,
    allProducts: String,
    productCategory: String,
    productAbout: String,
    productLittleDetail: String,
    productInfo: String,
    productColorOne: String,
    productColortwo: String,
    isProductBestseller: String,
    isProductNew: String,
    productId: String,
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
