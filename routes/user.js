const express = require("express");
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require("../controllers/auth");

const {
  userById,
  read,
  update,
  addToCart,
  totalCartItems,
  cartItems,
  updateCount,
  removeItem,
  removeAll,
  History,
} = require("../controllers/user");

router.get("/secret/:userId", requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  });
});

router.put("/user/addToCart/:userId", requireSignin, isAuth, addToCart);
router.get("/user/totalItems/:userId", requireSignin, isAuth, totalCartItems);
router.get("/user/getCartItems/:userId", requireSignin, isAuth, cartItems);
router.put("/user/updateCount/:userId", requireSignin, isAuth, updateCount);
router.put(
  "/user/removeItem/:userId/:productId",
  requireSignin,
  isAuth,
  removeItem
);
router.put("/user/removeAll/:userId", requireSignin, isAuth, removeAll);

router.get("/user/:userId", requireSignin, isAuth, read);
router.put("/user/:userId", requireSignin, isAuth, update);
router.get("/user/orders/:userId", requireSignin, isAuth, History);

router.param("userId", userById);

module.exports = router;
