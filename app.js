const express = require("express");
const path = require("path");
const app = express();
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const {campgroundSchema, reviewSchema} = require("./views/schemas");

const campgrounds = require("./routes/campgrounds");

const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Review = require("./models/review");
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

app.use("/campgrounds", campgrounds);

const validateReview = (req,res,next) => {
  const{error} = reviewSchema.validate(req.body);
  if(error){
    const msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(msg,400);  
  }else{
    next();
  }
}



app.post("/campgrounds/:id/reviews",validateReview, catchAsync(async (req,res)=>{
  const {id} = req.params;
  const campground = await Campground.findById(id);
  const review = new Review(req.body.review);
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  res.redirect(`/campgrounds/${id}`);
}))

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async (req,res)=>{
  const {id , reviewId} = req.params;
  await Campground.findByIdAndUpdate(id, {$pull : {reviews : reviewId}});
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
}))

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



