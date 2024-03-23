const express = require("express");
const app = express();

app.get("*",(req,res)=>{
  res.send("Hello There");
})

app.listen(47, ()=>{
  console.log("App is listening")
})