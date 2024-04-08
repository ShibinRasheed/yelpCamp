const express = require("express");
const path = require("path");
const app = express();
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const {campgroundSchema, reviewSchema} = require("./views/schemas");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");


const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Review = require("./models/review");
const methodOverride = require("method-override");
const { resourceUsage } = require('process');

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

const sessionConfig = {
  secret : "thisshouldbeabettersecret!",
  resave : true,
  saveUninitialized : true,
  cookie : {
    httpOnly : true,
    expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge : 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next(); 
})

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);
app.use(express.static(path.join(__dirname,"public")));


app.get("/",(req,res)=>{
  res.render("home");
});

app.get("/fakeUser",async(req,res)=>{
  const user = new User({
    email : "robinhood@gmail.com",
    username : "robin",
  })

  const newUser = await User.register(user,"chicken");
 res.send(newUser);

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



