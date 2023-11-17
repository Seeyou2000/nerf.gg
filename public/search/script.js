var API_key = "RGAPI-cf7287ad-5d21-4082-82a2-2fa95f9760c1";
var serverUrl = "";
var regionName = "";
var summonerName = "";
const Regions = [
    'br1.api.riotgames.com',
    'eun1.api.riotgames.com',
    'euw1.api.riotgames.com',
    'jp1.api.riotgames.com',
    'kr.api.riotgames.com',
    'la1.api.riotgames.com',
    'la2.api.riotgames.com',
    'na1.api.riotgames.com',
    'oc1.api.riotgames.com',
    'tr1.api.riotgames.com',
    'ru.api.riotgames.com',
    'ph2.api.riotgames.com',
    'sg2.api.riotgames.com',
    'th2.api.riotgames.com',
    'tw2.api.riotgames.com',
    'vn2.api.riotgames.com',
]

function ChooseRegion()
{
    regionIndex = document.getElementById("choose_region").value;
    serverUrl = Regions[regionIndex];
}

function SearchSummoner()
{
    summonerName = document.getElementById("summonerName").value;
    console.log(summonerName);
    ChooseRegion();
    Data();
}

async function Data()
{
    var summonerNameUrl = "/lol/summoner/v4/summoners/by-name/" + summonerName;
    var fullSummonerNameUrl = "https://" + serverUrl + summonerNameUrl + "?api_key=" + API_key;

    console.log(fullSummonerNameUrl);

    const dataSummoner = await fetch(fullSummonerNameUrl);
    const fullDataSummoner = await dataSummoner.json();

    console.log(fullDataSummoner);

    //소환사 이름
    summonerName = fullDataSummoner.name;
    document.getElementById("summonerNameData").innerHTML = "소환사 이름 : " + summonerName;

    //소환사 레벨
    var summonerLevel = fullDataSummoner.summonerLevel;
    document.getElementById("summonerLevelData").innerHTML = "소환사 레벨 : " + summonerLevel;

    //소환사 프로필 사진
    var profileIconId = fullDataSummoner.profileIconId;
    var profilePictureUrl = "https://ddragon.leagueoflegends.com/cdn/13.21.1/img/profileicon/" + profileIconId + ".png";
    document.getElementById("summonerProfilePictureData").src = profilePictureUrl;
}