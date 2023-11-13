//require('dotenv').config({path:'variables.env'});

const express=require('express');
const mongoose = require('mongoose');
const app=express();
const cookiParser=require("cookie-parser");
const session =require('express-session');
const fileStore=require('session-file-store')(session)
mongoose.connect('mongodb://localhost:27017/account')

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookiParser());
app.use(session({
  secret:'SNUST',//암호화
  resave:false,
  saveUninitialized:false,
  store:new fileStore({logFn:function(){}}),
  cookie:{httpOnly:true,}
}));

const db=mongoose.connection;

//열렸는지 체크
db.on('error',function(){
  console.log("fail");
});
db.once('open',function(){
  console.log('success')
});

const information1=mongoose.Schema({
  id:{type:String,unique:1},
  password:String
});


const Information1=mongoose.model('Schema',information1);




//서버열기

// app.all('*',function(req,res){
//   res.status(404).send("<h1>error</h1>")
// })

app.listen(4000, ()=>{
  console.log("server run")
});



//첫 페이지
app.get('/',function(req,res){
 
   if(!req.session.NickName){//세션이 없으면  로그인페이지로
    res.redirect('/signin')
  }
  else{//세션이 있으면 검색화면으로
  res.sendFile(__dirname+'/index.html');
  }
})

//로그인페이지
app.get('/signin',function(req,res){  
  if(req.session.NickName){//세션이 있으면 검색화면으로
  res.sendFile(__dirname+'/index.html');
  }
  else{
  res.sendFile(__dirname+'/signin.html');
  }
})



//회원가입페이지

app.get('/signup',function(req,res){
  res.sendFile(__dirname+'/create_account.html')
})


//회원가입
app.post('/signup',function(req,res){
  let newInfo=new Information1({
    id: req.body.ID,
    password:req.body.PASSWORD
  });
  newInfo.save();  
  return res.redirect('/')
})

//로그인
app.post('/signin',function(req,res){
  //mongodb에서 요청한 id찾기
  Information1.findOne({id:req.body.ID})
    //id 있는지 확인
    .then(information1=>{
      //비밀번호 까지 일치한다면 세션 생성
      if(req.body.PASSWORD==information1.password){
       
        //세션 생성       
        req.session.NickName=information1.id;
        req.session.save
        
        res.redirect('/');
      }
      else{
        res.send('비밀번호 오류');
      }
    })
    //id 불일치시
    .catch((err)=>{
      res.send('id오류')
    })
})

//로그 아웃
app.post('/signout',function(req,res){
  if(req.session.NickName){
    req.session.destroy();//세션삭제
  }
  else{
    console.log('error');
  }
  res.redirect('/');
});

