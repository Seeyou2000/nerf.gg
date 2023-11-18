var summonerName = "";
var regionIndex = "";

function SearchSummoner()
{
    summonerName = document.getElementById("summonerName").value;
    regionIndex = document.getElementById("choose_region").value;
    Data();
}

async function Data()
{
    var summonerNameUrl = "/search/by-name/" + summonerName + "/" + regionIndex;
    var fullSummonerNameUrl = location.origin + summonerNameUrl;

    const dataSummoner = await fetch(fullSummonerNameUrl);
    const fullDataSummoner = await dataSummoner.json();

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

    //랭크 정보
    var summonerIdUrl = "/search/by-summoner/" + fullDataSummoner.id + "/" + regionIndex;
    var fullSummonerIdUrl = location.origin + summonerIdUrl;
    const rankedSummoner = await fetch(fullSummonerIdUrl);
    const fullRankedSummoner = await rankedSummoner.json();
    if(fullRankedSummoner.length === 0)
    {
        //document.write("Unranked");
    }
    else
    {
        const rankedSummonerData = fullRankedSummoner[0];
        var summonerWins = rankedSummonerData.wins;
        var summonerLosses = rankedSummonerData.losses;
        var summonerWinRatio = Math.round((summonerWins / (summonerLosses + summonerWins))*1000/10);
        var division = rankedSummonerData.tier + " " + rankedSummonerData.rank;
        var lpLanked = rankedSummonerData.leaguePoints;

        document.getElementById("rankedWin").innerHTML = "승리 : " + summonerWins;
        document.getElementById("rankedLose").innerHTML = "패배 : " + summonerLosses;
        document.getElementById("rankedWinRatio").innerHTML = "승률 : " + summonerWinRatio + "%";
        document.getElementById("rankedDivision").innerHTML = "Ranked : " + division + " " + lpLanked + "LP";

        var divisionTier = rankedSummonerData.tier;
        if(divisionTier == "IRON") document.getElementById("rankedDivision").style.color = "gray";
        if(divisionTier == "BRONZE") document.getElementById("rankedDivision").style.color = "brown";
        if(divisionTier == "SILVER") document.getElementById("rankedDivision").style.color = "lightgray";
        if(divisionTier == "GOLD") document.getElementById("rankedDivision").style.color = "yellow";
        if(divisionTier == "EMERALD") document.getElementById("rankedDivision").style.color = "lightgreen";
        if(divisionTier == "DIAMOND") document.getElementById("rankedDivision").style.color = "lightblue";
        if(divisionTier == "MASTER") document.getElementById("rankedDivision").style.color = "lightpurple";
        if(divisionTier == "GRANDMASTER") document.getElementById("rankedDivision").style.color = "lightred";
        if(divisionTier == "CHALLENGER") document.getElementById("rankedDivision").style.color = "gold";
    }
}