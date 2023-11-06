var API_key = "RGAPI-72bc1e39-dd63-4145-aaa8-c2e4f17e949b";
var krUrl = "https://kr.api.riotgames.com";
var summonerName = "";

function SearchSummoner()
{
    summonerName = document.getElementById("summonerName").value;
    console.log(summonerName);
    Data();
}

async function Data()
{
    var summonerNameUrl = "/lol/summoner/v4/summoners/by-name/" + summonerName;
    var fullSummonerNameUrl = krUrl + summonerNameUrl + "?api_key=" + API_key;

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