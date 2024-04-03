const express = require("express");
const path = require("path");
const app = express();
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Joi = require("joi");

const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");

mongoose.connect("mongodb://localhost:27017/yelp-camp")

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error: "));
db.once("open",()=>{
  console.log("Database connected");
});

app.engine("ejs",ejsMate);
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"))

app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));

app.get("/campgrounds", catchAsync(async (req,res)=>{
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index",{campgrounds});
}));

app.get("/campgrounds/new", (req,res) =>{
  res.render("campgrounds/new");
});

app.post("/campgrounds", catchAsync(async (req,res)=>{
  
  const campgroundSchema = Joi.object({
    campground: Joi.object({
      title : Joi.string().required(),
      price : Joi.number().required().min(0),
      image : Joi.string().required(),
      location : Joi.string().required(),
      description : Joi.string().required()
    }).required()
  })
  const {error} = campgroundSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg,400);  
  }
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.get("/campgrounds/:id", catchAsync(async (req,res)=>{
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show",{campground});
}));

app.get("/campgrounds/:id/edit",catchAsync(async (req,res)=>{
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit",{campground});
}));

app.put("/campgrounds/:id", catchAsync(async (req,res)=>{
  const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground});
  res.redirect(`/campgrounds/${req.params.id }`);
}));

app.delete("/campgrounds/:id", catchAsync(async (req,res)=>{
  const {id} = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  res.redirect(`/campgrounds`);
}));

app.get("/",(req,res)=>{
  res.render("home");
});

app.all("*",(req,res,next)=>{
  next(new ExpressError("Page not Found", 404));
})

app.use((err,req,res,next)=>{
  const {statusCode = 500}  = err;
  if(!err.message){
    err.message="Something went wrong";
  }
  res.status(statusCode).render("error",{err});
})

app.listen(47, ()=>{
  console.log("App is listening");
});



