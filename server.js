const express = require('express');
const mongoose = require('mongoose');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/createaccount')
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error: ' + err);
  });

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const db = mongoose.connection;

db.on('error',function(){
  console.log("fail");
});
db.once('open',function(){
  console.log('success')
});

const information1 = mongoose.Schema({
  id:String,password:String
});

const Information1 = mongoose.model('Schema',information1);

app.listen(4000, () => {
  console.log("server run")
});

app.get('/',function(req,res){
  res.sendFile(__dirname+'/create_account.html');
});

app.post('/',function(req,res){
  
  let newInfo = new Information1({
    id: req.body.ID,
    password: req.body.PASSWORD
  });
  newInfo.save()
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      console.error('Error saving data: ' + err);
      res.redirect('/');
    });
});