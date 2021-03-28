let request = require("request");
let cheerio = require("cheerio");
let path = require("path");
let fs = require("fs");
let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595" + "/match-results";
request(url, cb);

function createdirectory(foldername) {
    let folderpath = path.join(__dirname, foldername);
    if (!fs.existsSync(folderpath)) {
        fs.mkdirSync(folderpath);
    }
}

function createfile(filename) {
    let filepath = path.join(__dirname, "ipl_2020", filename);
    if (!fs.existsSync(filepath)) {
        fs.openSync(filepath, "w");
    }
}

function cb(err, response, html) {
    if (err) {
        console.log(err);
    } else {
        extractData(html);
    }
}


function extractData(html) {
    let seltool = cheerio.load(html);
    createdirectory("ipl_2020")
    let ScorecardAnchors = seltool("a[data-hover='Scorecard']"); //give all (60) score card tabs...
    for (let i = 0; i < ScorecardAnchors.length; i++) {
        let link = "https://www.espncricinfo.com" + seltool(ScorecardAnchors[i]).attr("href"); //Link of every scoreCard one by one
        GetScorecardpage(link);
    }

}

function GetScorecardpage(link) {
    request(link, cb)

    function cb(err, response, html) {
        if (err) {
            console.log(err);
        } else {
            extractMatchResult(html); //this html is of Scorecard page
        }
    }
}

function extractMatchResult(html) {
    let seltool = cheerio.load(html);
    let result = seltool(".match-info.match-info-MATCH .status-text").text();
    // console.log(result);
    let teams = [];
    let batsmantableArray = seltool(".table.batsman"); //two tables
    let teamstitleArray = seltool(".section-header.border-bottom.text-danger.cursor-pointer .header-title.label");
    for (let i = 0; i < teamstitleArray.length; i++) {
        let teamname = seltool(teamstitleArray[i]).text().split("INNINGS").shift();
        let playersArray = seltool(batsmantableArray[i]).find("tbody tr");
        // teams.push(teamname);

        for (let j = 2; j <= playersArray.length - 3; j += 2) {
            let arrforcurrentplayer = [];

            let playername = seltool(playersArray[j]).find("a").text();
            // console.log(playername);
            createfile(playername + ".json"); //file creation 
            let runScored = seltool(seltool(playersArray[j]).find("td")[2]).text();
            let Balls = seltool(seltool(playersArray[j]).find("td")[3]).text();
            let fours = seltool(seltool(playersArray[j]).find("td")[5]).text();
            let sixes = seltool(seltool(playersArray[j]).find("td")[6]).text();

            // console.log(fours);
            arrforcurrentplayer.push({
                name: playername,
                r: runScored,
                b: Balls,
                fours: fours,
                sixes: sixes,
                Result: result,
                team: teamname
            });
            let filepath = path.join(__dirname, "ipl_2020", playername + ".json");

            fs.appendFile(filepath, JSON.stringify(arrforcurrentplayer), (err) => {
                if (err) { console.log(err); } else {

                }
            })


            console.table(arrforcurrentplayer);
        }
    }

}