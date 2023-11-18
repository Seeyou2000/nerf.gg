//require('dotenv').config({path:'variables.env'});

const express=require('express');
const mongoose = require('mongoose');
const app=express();
const cookiParser=require("cookie-parser");
const session =require('express-session');
const fileStore=require('session-file-store')(session)
const path = require('path')
const ejs=require('ejs');
mongoose.connect('mongodb://127.0.0.1:27017/account')

app.set('view engine','ejs')
app.use(express.static(path.join(__dirname, '../public')))
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

require("dotenv").config({path: '../.env'});
const API_KEY = process.env.API_KEY;

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

const Regions = {
  BR : 'br1.api.riotgames.com',
  EUN : 'eun1.api.riotgames.com',
  EUW : 'euw1.api.riotgames.com',
  JP : 'jp1.api.riotgames.com',
  KR : 'kr.api.riotgames.com',
  LA : 'la1.api.riotgames.com',
  LA2 :'la2.api.riotgames.com',
  NA :'na1.api.riotgames.com',
  OC : 'oc1.api.riotgames.com',
  TR : 'tr1.api.riotgames.com',
  RU :'ru.api.riotgames.com',
  PH2 : 'ph2.api.riotgames.com',
  SG2 : 'sg2.api.riotgames.com',
  TH2 : 'th2.api.riotgames.com',
  TW2 : 'tw2.api.riotgames.com',
  VN2 : 'vn2.api.riotgames.com',
}


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
    res.redirect('/search')
  }
})

//소환사 이름, 지역을 통해 서버에서 정보 받아오기
app.get('/search/by-name/:name/:region', async function(req, res){ 
  var summonerNameUrl = "/lol/summoner/v4/summoners/by-name/" + req.params.name;
  var fullSummonerNameUrl = "https://" + Regions[req.params.region] + summonerNameUrl + "?api_key=" + API_KEY;

  const dataSummoner = await fetch(fullSummonerNameUrl);
  const fullDataSummoner = await dataSummoner.json();
  res.json(fullDataSummoner);
})

//소환사 고유 id, 지역을 통해 서버에서 정보 받아오기
app.get('/search/by-summoner/:id/:region', async function(req, res){
  var summonerIdUrl = "/lol/league/v4/entries/by-summoner/" + req.params.id;
  var rankedSummonerUrl = "https://" + Regions[req.params.region] + summonerIdUrl + "?api_key=" + API_KEY;
  
  const rankedSummoner = await fetch(rankedSummonerUrl);
  const fullRankedSummoner = await rankedSummoner.json();
  res.json(fullRankedSummoner);
})

//로그인페이지
app.get('/signin',function(req,res,next){  
  if(req.session.NickName){//세션이 있으면 검색화면으로
    res.redirect('/search')
  }
  next()
})

//회원가입
app.post('/signup',function(req,res){
  //중복ID입력시경고
  if (Information1.findOne({id:req.body.ID})){
    return res.render('PreexistId',{error:'이미 존재하는 ID입니다.'})
  }
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
        return res.render('WrongPw',{error:'잘못된 비밀번호 입니다.비밀번호를 확인해주세요'});
      }
    })
    //id가 없을시
    .catch((err)=>{
      res.render('NullId',{error:'ID가 존재하지 않습니다'})
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

