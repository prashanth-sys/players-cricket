const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1 GET

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM 
    player_details;`;
  const playersArray = await db.all(getPlayersQuery);
  const ans = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };
  response.send(playersArray.map((eachPlayer) => ans(eachPlayer)));
  //response.send(playersArray);
});

//API 2 GET

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `
    SELECT 
    *
    FROM 
    player_details
    WHERE 
    player_id = ${playerId};`;
  const player = await db.get(getPlayerDetails);
  const ans = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };
  response.send(ans(player));
});

//API 3 PUT

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const addPlayerQuery = request.body;
  const { playerName } = addPlayerQuery;
  const updateQuery = `
  UPDATE player_details
  SET 
  player_name '${playerName}'
  WHERE 
  player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//API 4 GET

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `
    SELECT 
    *
    FROM
    match_details
    WHERE 
    match_id = ${matchId};`;
  const match = await db.get(getMatchDetails);
  const ans = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };
  response.send(ans(match));
});

//API 5 GET

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT 
    match_id,
    match,
    year
    FROM player_match_score
    NATURAL JOIN match_details 
    WHERE 
    player_id = ${playerId};`;
  const playerMatches = await db.get(getPlayerMatchesQuery);
  const ans = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };
  response.send(ans(playerMatches));
});

module.exports = app;
