const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { storeReturnTo } = require("../views/middleware");

const users = require("../controllers/user");

router.get("/register", users.renderRegisterFrom);

router.post("/register", users.createUser);

router.get("/login", users.renderLoginForm);

router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.loginUser
);

router.get("/logout", users.logout);

module.exports = router;
