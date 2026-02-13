import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Middleware to verify JWT token
 */
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Get user's cart
 * GET /cart
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      items: user.cart || [],
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

/**
 * Merge guest cart with user's backend cart
 * POST /cart/merge
 * Takes guest cart items and merges with existing user cart
 */
router.post("/merge", authenticateToken, async (req, res) => {
  try {
    const { guestItems = [] } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only merge guest items that have valid productId and quantity so save() never fails
    const validGuestItems = (Array.isArray(guestItems) ? guestItems : []).filter(
      (item) => item && item.productId != null && item.productId !== "" && Number(item.quantity) > 0
    );

    const existingCart = user.cart || [];
    const mergedCart = mergeCartItems(existingCart, validGuestItems);

    user.cart = mergedCart;
    await user.save();

    res.json({
      items: user.cart,
      message: "Cart merged successfully",
    });
  } catch (error) {
    console.error("Error merging cart:", error);
    res.status(500).json({ message: "Failed to merge cart" });
  }
});

/**
 * Sync cart (replace user's cart with new items)
 * POST /cart/sync
 * Used to update the entire cart with current items
 */
router.post("/sync", authenticateToken, async (req, res) => {
  try {
    const { items = [] } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate items
    const validItems = items.filter(validateCartItem);

    user.cart = validItems;
    await user.save();

    res.json({
      items: user.cart,
      message: "Cart synced successfully",
    });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ message: "Failed to sync cart" });
  }
});

/**
 * Add item to cart
 * POST /cart/add
 */
router.post("/add", authenticateToken, async (req, res) => {
  try {
    const { product, quantity = 1 } = req.body;

    if (!product || !product.productId) {
      return res.status(400).json({ message: "Invalid product" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingItem = user.cart.find(
      (item) => item.productId === product.productId,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({
        ...product,
        quantity,
        addedAt: new Date(),
      });
    }

    await user.save();

    res.json({
      items: user.cart,
      message: "Item added to cart",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
});

/**
 * Remove item from cart
 * DELETE /cart/:productId
 */
router.delete("/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter((item) => item.productId !== productId);
    await user.save();

    res.json({
      items: user.cart,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
});

/**
 * Clear cart
 * DELETE /cart
 */
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = [];
    await user.save();

    res.json({
      items: [],
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

/**
 * Helper function: Merge cart items
 * Combines items and avoids duplicates by summing quantities
 */
function mergeCartItems(existingCart, guestItems) {
  const mergedMap = {};

  // Add existing items
  existingCart.forEach((item) => {
    mergedMap[item.productId] = { ...item };
  });

  // Merge guest items
  guestItems.forEach((item) => {
    if (mergedMap[item.productId]) {
      mergedMap[item.productId].quantity += item.quantity;
    } else {
      mergedMap[item.productId] = { ...item, addedAt: new Date() };
    }
  });

  return Object.values(mergedMap);
}

/**
 * Helper function: Validate cart item
 */
function validateCartItem(item) {
  return (
    item.productId && item.productName && item.productPrice && item.quantity > 0
  );
}

export default router;
