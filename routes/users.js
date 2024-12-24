const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { storeReturnTo } = require("../views/middleware");

const users = require("../controllers/user");

router.route("/register").get(users.renderRegisterFrom).post(users.createUser);

router
  .route("/login")
  .get(users.renderLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.loginUser
  );

router.get("/logout", users.logout);

module.exports = router;
