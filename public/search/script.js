var inputSummonerName = "";
var regionIndex = "";
var matchInfos = [];
var gameCreationArray = [];
var parseMatchData = [];

function SearchSummoner()
{
    inputSummonerName = document.getElementById("summonerName").value;
    regionIndex = document.getElementById("choose_region").value;
    Data();
}

async function Data()
{
    var summonerNameUrl = "/search/by-name/" + inputSummonerName + "/" + regionIndex;
    var fullSummonerNameUrl = location.origin + summonerNameUrl;

    const dataSummoner = await fetch(fullSummonerNameUrl);
    const { summoner:fullDataSummoner, matches:fullDataMatch } = await dataSummoner.json();
    
    const {name: summonerName, summonerLevel, profileIconId, id: summonerId, puuid} = fullDataSummoner;

    //소환사 이름
    document.getElementById("summonerNameData").innerHTML = "<h1>" + summonerName + "</h1>";

    //소환사 레벨
    document.getElementById("summonerLevelData").innerHTML = "소환사 레벨 : " + summonerLevel;

    //소환사 프로필 사진
    var profilePictureUrl = "https://ddragon.leagueoflegends.com/cdn/13.21.1/img/profileicon/" + profileIconId + ".png";
    document.getElementById("summonerProfilePictureData").src = profilePictureUrl;

    //particpants까지 가는 과정
    for(matchData of fullDataMatch)
    {
        matchInfos.push(matchData['info'].participants);
        gameCreationArray.push(matchData['info'].gameCreation);
    }

    for(matchInfo of matchInfos)
    {
        for(let i = 0; i<matchInfos.length; i++)
        {
            summonerInfo = matchInfo[i];
            gameCreation = gameCreationArray[i];

            if(summonerInfo.puuid === puuid)
            {
                console.log(summonerInfo.puuid);
                console.log(puuid);
                summonerInfoDict = {
                    kills : summonerInfo.kills,
                    deaths : summonerInfo.deaths,
                    assists : summonerInfo.assists,
                    timePlayed : summonerInfo.timePlayed,
                    gameCreation : gameCreation,
                    win : summonerInfo.win,
                    champLevel : summonerInfo.champLevel,
                    championName : summonerInfo.championName,
                    doubleKills : summonerInfo.doubleKills,
                    tripleKills : summonerInfo.tripleKills,
                    quadraKills : summonerInfo.quadraKills,
                    pentaKills : summonerInfo.pentaKills,
                }
                parseMatchData.push(summonerInfoDict);
                break;
            }
        }
    }
    

    //랭크 정보
    var summonerIdUrl = "/search/by-summoner/" + summonerId + "/" + regionIndex;
    var fullSummonerIdUrl = location.origin + summonerIdUrl;
    const rankedSummoner = await fetch(fullSummonerIdUrl);
    const fullRankedSummoner = await rankedSummoner.json();

    console.log(fullRankedSummoner);

    //랭크 게임 정보
    if(fullRankedSummoner.length === 0)
    {
        //document.write("Unranked");
    }
    else
    {
        const rankedSummonerData = fullRankedSummoner[0];
        const{ wins: summonerWins, losses: summonerLosses, leaguePoints: lpLanked, tier, rank } = rankedSummonerData;
        var summonerWinRatio = Math.round((summonerWins / (summonerLosses + summonerWins))*1000/10);
        var division = tier + " " + rank;

        document.getElementById("rankedWin").innerHTML = "승리 : " + summonerWins + "<br>";
        document.getElementById("rankedLose").innerHTML = "패배 : " + summonerLosses + "<br>";
        document.getElementById("rankedWinRatio").innerHTML = "승률 : " + summonerWinRatio + "%<br>";
        document.getElementById("rankedDivision").innerHTML = "Ranked : " + division + " " + lpLanked + "LP";

        if(tier == "IRON") document.getElementById("rankedDivision").style.color = "gray";
        if(tier == "BRONZE") document.getElementById("rankedDivision").style.color = "brown";
        if(tier == "SILVER") document.getElementById("rankedDivision").style.color = "lightgray";
        if(tier == "GOLD") document.getElementById("rankedDivision").style.color = "yellow";
        if(tier == "EMERALD") document.getElementById("rankedDivision").style.color = "Emerald";
        if(tier == "DIAMOND") document.getElementById("rankedDivision").style.color = "lightblue";
        if(tier == "MASTER") document.getElementById("rankedDivision").style.color = "blueviolet";
        if(tier == "GRANDMASTER") document.getElementById("rankedDivision").style.color = "lightred";
        if(tier == "CHALLENGER") document.getElementById("rankedDivision").style.color = "gold";
    }
}