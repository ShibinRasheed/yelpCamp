const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/register", (req, res) => {
  res.render("users/register");
})

router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ username, email });
    const registerUser = await User.register(user, password);
    req.flash("success", "You are registered");
    res.redirect("/campgrounds");
  }catch (err) {
    req.flash("error", err.message);
    res.redirect("register");
  }

});

module.exports = router;