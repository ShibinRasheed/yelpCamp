const express = require("express");
const router = express.Router();

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const Campground = require("../models/campground");
const {campgroundSchema} = require("../views/schemas");
const {isLoggedIn} = require("../views/middleware");


const validateCampground = (req,res,next) =>{
  const {error} = campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg,400);  
  }else{
    next();
  }
};


router.get("/", catchAsync(async (req,res)=>{
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index",{campgrounds});
}));

router.get("/new", isLoggedIn, (req,res) =>{
  res.render("campgrounds/new");
});

router.post("/", isLoggedIn, validateCampground, catchAsync(async (req,res)=>{
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Successfully made a new Campground!");
  res.redirect(`/campgrounds/${campground._id}`);
}));

router.get("/:id", catchAsync(async (req,res)=>{
  const campground = await Campground.findById(req.params.id).populate("reviews").populate("author");
  if(!campground){
    req.flash("error","Cannot find Campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show",{campground});
}));


router.get("/:id/edit", isLoggedIn, catchAsync(async (req,res)=>{
  const campground = await Campground.findById(req.params.id);
  if(!campground){
    req.flash("error","Cannot find Campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit",{campground});
}));

router.put("/:id",isLoggedIn, validateCampground, catchAsync(async (req,res)=>{
  const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground});
  res.redirect(`/campgrounds/${req.params.id }`);
}));

router.delete("/:id",isLoggedIn, catchAsync(async (req,res)=>{
  const {id} = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  req.flash("success","successfully deleted a Campground");
  res.redirect(`/campgrounds`);
}));



module.exports = router;
