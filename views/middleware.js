module.exports.isLoggedIn =  (req,res,next) =>{
  if(!req.isAuthenticated()) {
    req.flash("error","You must login to view the page.");
    return res.redirect("/login");
  }
  next();
}