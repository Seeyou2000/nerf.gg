//require('dotenv').config({path:'variables.env'});

const express=require('express');
const mongoose = require('mongoose');
const app=express();
const cookiParser=require("cookie-parser");
const session =require('express-session');
const fileStore=require('session-file-store')(session)
const path = require('path')
const ejs=require('ejs');
mongoose.connect('mongodb://127.0.0.1:27017/account, /challenges').then(
  ()=>{console.log('Success')},//연결 성공
  err=>{console.log(err)}//연결실패
  )

const AccountObj=mongoose.createConnection('mongodb://127.0.0.1:27017/account');
const ChallengesObj=mongoose.createConnection('mongodb://127.0.0.1:27017/challenges');


app.set('views', '../views')
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



require("dotenv").config({path: '../.env'});
const API_KEY = process.env.API_KEY;



const Regions = {
  BR : ['br1.api.riotgames.com', 'americas.api.riotgames.com'],
  EUN : ['eun1.api.riotgames.com', 'europe.api.riotgames.com'],
  EUW : ['euw1.api.riotgames.com', 'europe.api.riotgames.com'],
  JP : ['jp1.api.riotgames.com', 'asia.api.riotgames.com'],
  KR : ['kr.api.riotgames.com', 'asia.api.riotgames.com'],
  LA : ['la1.api.riotgames.com', 'americas.api.riotgames.com'],
  LA2 :['la2.api.riotgames.com', 'americas.api.riotgames.com'],
  NA :['na1.api.riotgames.com', 'americas.api.riotgames.com'],
  OC : ['oc1.api.riotgames.com', 'sea.api.riotgames.com'],
  TR : ['tr1.api.riotgames.com', 'europe.api.riotgames.com'],
  RU :['ru.api.riotgames.com', 'europe.api.riotgames.com'],
  PH2 : ['ph2.api.riotgames.com', 'sea.api.riotgames.com'],
  SG2 : ['sg2.api.riotgames.com', 'sea.api.riotgames.com'],
  TH2 : ['th2.api.riotgames.com', 'sea.api.riotgames.com'],
  TW2 : ['tw2.api.riotgames.com', 'sea.api.riotgames.com'],
  VN2 : ['vn2.api.riotgames.com', 'sea.api.riotgames.com'],
}

const AccountSchema = new mongoose.Schema({
  id:{type:String,unique:1},
  password:String,
  AttendanceCounter:{type:Number,default:0},//출석횟수=로그인횟수.나중에변경필요
  SearchCounter:{type:Number,default:0}//검색횟수
})
const AccountTable=AccountObj.model('AccountTable',AccountSchema)
//const Account=new AccountTable;


const ChallengesSchema = new mongoose.Schema({
  id:String,//로그인한 계정의 ID
  date:String//로그인한날짜
})
const ChallengesTable=ChallengesObj.model('ChallengesTable',ChallengesSchema)
//const Challenges=new ChallengesTable;
//module.exports={AccountTable,ChallengesTable};



//서버열기

// app.all('*',function(req,res){
//   res.status(404).send("<h1>error</h1>")
// })

app.listen(4000, ()=>{
  console.log("server run")
});



//첫 페이지
app.get('/',function(req,res){ 
  if(!req.session.Sid){//세션이 없으면  로그인페이지로
    res.render('signin')
  }
  else{//세션이 있으면 검색화면으로
    res.render('search',{UserId:req.session.Sid})
  }
})

//소환사 이름, 지역을 통해 서버에서 소환사 정보, 랭크 게임 정보 받아오기
app.get('/search/by-name/:name/:region', async function(req, res){ 
  var summonerNameUrl = "/lol/summoner/v4/summoners/by-name/" + req.params.name;
  var fullSummonerNameUrl = "https://" + Regions[req.params.region][0] + summonerNameUrl + "?api_key=" + API_KEY;

  const dataSummoner = await fetch(fullSummonerNameUrl);
  const fullDataSummoner = await dataSummoner.json();

  var puuid = fullDataSummoner['puuid'];
  var matchListUrl = "/lol/match/v5/matches/by-puuid/"+ puuid +"/ids?queue=420&type=ranked&start=0&count=20&api_key=" + API_KEY;
  var fullMatchListUrl = "https://" + Regions[req.params.region][1] + matchListUrl;
  const dataMatchIdList = await fetch(fullMatchListUrl);
  const fullDataMatchIdList = await dataMatchIdList.json();

  const matchPromises = fullDataMatchIdList.map(async (matchId) => {
      var retryCount = 0;

      var matchUrl = "/lol/match/v5/matches/"+ matchId +"?api_key=" + API_KEY;
      var fullMatchUrl = "https://" + Regions[req.params.region][1] + matchUrl;
      let dataMatch = await fetch(fullMatchUrl);

      //429면 다시 시도하는 코드
      while (dataMatch.status === 429 && retryCount < 3)
      {
        function sleep(ms) {
          return new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
        }
        await sleep(300);
        dataMatch = await fetch(fullMatchUrl);
        retryCount++;
      }

      const fullDataMatch = await dataMatch.json();
      return fullDataMatch;
    }
  );

  const matches = await Promise.all(matchPromises);

  const combinedData = {
    summoner: fullDataSummoner,
    matches
  };

  res.json(combinedData);
})

//소환사 고유 id, 지역을 통해 서버에서 소환사의 랭크게임 승패 정보 받아오기
app.get('/search/by-summoner/:id/:region', async function(req, res){
  var summonerIdUrl = "/lol/league/v4/entries/by-summoner/" + req.params.id;
  var rankedSummonerUrl = "https://" + Regions[req.params.region][0] + summonerIdUrl + "?api_key=" + API_KEY;
  
  const rankedSummoner = await fetch(rankedSummonerUrl);
  const fullRankedSummoner = await rankedSummoner.json();
  res.json(fullRankedSummoner);

   //검색횟수 db에서 가져온후 +1하고 저장
   let tempId=req.session.Sid
   let Account=await AccountTable.findOne({id:tempId})
   Account.SearchCounter+=1;
   req.session.search=Account.SearchCounter;
   Account.save();
})

//로그인페이지


app.get('/signin',function(req,res,next){  
  if(req.session.Sid){//세션이 있으면 검색화면으로
    res.redirect('/');
  }
  next()
})

//회원가입페이지
app.get('/signup',function(req,res){
  res.render('signup')
})

//회원가입
app.post('/signup',async function(req,res){
   let tempId=req.body.ID;
   let tempPw=req.body.PASSWORD;
   let Account= await AccountTable.findOne({id:tempId});
   //중복ID입력시경고
  if (Account){
    return res.render('PreexistId',{error:'이미 존재하는 ID입니다.'})
  }
  else
  {
    let Account=new AccountTable({
      id:tempId,
      password:tempPw
    });
    Account.save()
    return res.redirect('/')
  } ;
  
})
app.get('/signin',function(req,res){
  res.render('signin')
})

//로그인
app.post('/signin',async function(req,res){
  //mongodb에서 요청한 id찾기
  let tempId=req.body.ID;
  let tempPw=req.body.PASSWORD;
  let Account=await AccountTable.findOne({id:tempId})
 // let challenges=await ChallengesTable.find({id:tempId})
       //id 있는지 확인
    if(Account){
      //비밀번호 까지 일치한다면 세션 생성
      if(tempPw==Account.password){
        
        let tempdate=ChangeDateNow();
        //로그인 기록확인   
          //오늘 로그인 한적이 있는지 확인
          let challenges=await ChallengesTable.find({$and:[{id:tempId},{date:tempdate}]});
          //로그인한적이 없다면
          if(challenges.length==0){      
             let challenges=new ChallengesTable({//challenges db에 저장
             id:tempId,
             date:tempdate});
             challenges.save()
             //출석카운터 +1
             let Account=await AccountTable.findOne({id:tempId})
             Account.AttendanceCounter+=1;
             Account.save();
             req.session.date=Account.AttendanceCounter;
          }
          //오늘 로그인 한적이 있는경우
          else{console.log('로그인기록있음');}

          //세션 생성       
          req.session.Sid=tempId;
          let Account=await AccountTable.findOne({id:tempId})
          //console.log(Account)
          req.session.date=Account.AttendanceCounter;
          req.session.save
          UserId=req.session.Sid;
       res.redirect('/');}
      else{//비밀번호 오류
        return res.render('WrongPw',{error:'잘못된 비밀번호 입니다.비밀번호를 확인해주세요'});
      }
    }
    //id가 없을시
    else{     
      res.render('NullId',{error:'ID가 존재하지 않습니다'})
    }
})

//로그 아웃
app.post('/signout',function(req,res){
  if(req.session.Sid){
    req.session.destroy();//세션삭제
  }
  else{
    console.log('error');
  }
  res.redirect('/');
});


//비밀번호 변경
app.post('/change_password',async function(req,res){
if(req.session){//세션이 있을때만(로그인중일때) 변경가능
  let tempId=req.session.Sid;//세션에 저장한 id의 비밀번호수정
  let Account=await AccountTable.findOne({"id":tempId})
  Account.password=req.body.NEWPASSWORD;
  Account.save()
  req.session.destroy();//세션삭제
  res.redirect('/');//첫화면으로
  }
else
  res.redirect('/')//세션이 없으면=로그인정보가 없을시 첫화면으로
});

//계정삭제
app.post('/delete_account',async function(req,res){
  if(req.session){//세션이 있을때만(로그인중일때) 삭제가능
  await AccountTable.deleteOne({"id":req.session.Sid})
  await ChallengesTable.deleteMany({"id":req.session.Sid})
  req.session.destroy();//세션삭제
  res.redirect('/');//첫화면으로
  }
  else
  res.redirect('/')//세션이 없으면=로그인정보가 없을시 첫화면으로
});


//현재날짜형식 변환함수
function ChangeDateNow(){
var date=new Date();
var year=date.getFullYear();
var month=new String(date.getMonth()+1);
month=(month>=10?month:'0'+month);
var day=new String(date.getDate());
day=(day>=10?day:'0'+day);
var korFormat=year+'-'+month+'-'+day;
return korFormat;
}

//도전과제 페이지

app.get('/challenges',async function(req,res){
  if(req.session){
  let Account=await AccountTable.findOne({"id":req.session.Sid})
    
  res.render('Challenges',{UserId:req.session.Sid,date:req.session.date,search:Account.SearchCounter})}
  else{
    res.redirect('/')
  }
})

//마이페이지
app.get('/mypage',function(req,res){
  if(req.session){
  res.render('mypage',{UserId:req.session.Sid})
  }
  else{
    res.redirect('/')
  }
})