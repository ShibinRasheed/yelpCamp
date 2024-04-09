const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require('passport');

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

router.get("/login",(req,res)=>{
  res.render("users/login");
})

router.post("/login",passport.authenticate("local",{failureFlash:true, failureRedirect : "/login"}) ,(req,res)=>{
  req.flash("success","Welcome Back!");
  res.redirect("/campgrounds");
})

router.get("/logout",(req,res,next)=>{
  req.logout( function (err){
    if(err){
      return next(err);
    }
    
  req.flash("success", "you are logged out");
  res.redirect("/campgrounds");
  });
})

module.exports = router;