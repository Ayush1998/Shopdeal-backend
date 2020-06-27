const User = require("../models/user");
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;

  return res.json(req.profile);
};

exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: "You are not authorized to perform this action",
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;

      return res.json(user);
    }
  );
};

exports.addToCart = (req, res) => {
  const id = req.profile._id;
  const item = req.body;
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      console.log(user);
      if (err || !user) {
        return res.status(400).json({
          error: "User not found",
        });
      }

      let cart = [];
      if (user.cart.length !== 0) {
        user.cart.map((p) => {
          cart.push(p);
        });
      }

      cart.push(item);

      cart = Array.from(new Set(cart.map((p) => p.item._id))).map((id) => {
        return cart.find((p) => p.item._id === id);
      });

      user.cart = cart;
      user.save().then((user) => res.json(user.cart));
    }
  );
};

exports.totalCartItems = (req, res) => {
  const id = req.profile._id;
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    res.json(user.cart.length);
  });
};

exports.cartItems = (req, res) => {
  const id = req.profile._id;
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    res.json(user.cart);
  });
};

exports.updateCount = (req, res) => {
  const productId = req.body.productId;
  const count = req.body.count;
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      user.cart.map((p) => {
        if (p.item._id === productId) {
          p.item.count = count;
        }
      });
      user.markModified("cart");
      user.save().then((user) => res.json(user.cart));
    }
  );
};

exports.removeItem = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      user.cart.map((p, i) => {
        if (p.item._id === req.params.productId) {
          user.cart.splice(user.cart[i], 1);
        }
      });
      user.markModified("cart");
      user.save().then((user) => res.json(user.cart));
    }
  );
};

exports.removeAll = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      user.cart = [];
      user.markModified("cart");
      user.save().then((user) => res.json(user.cart));
    }
  );
};

exports.addToUserHistory = (req, res, next) => {
  let history = [];
  req.body.order.products.forEach((item) => {
    history.push({
      _id: item.item._id,
      name: item.item.name,
      descreption: item.item.descreption,
      category: item.item.category,
      quantity: item.item.count,
      transaction_id: req.body.order.transaction_id,
      amount: item.item.price,
    });
  });
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: "Could not update user purchase history",
        });
      }
      next();
    }
  );
};

exports.History = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .sort("-created")
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(orders);
    });
};
