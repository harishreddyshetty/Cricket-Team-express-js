const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server started");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertToCamelCase = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
};

app.get("/players/", async (request, response) => {
  const playersListQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(playersListQuery);
  const playerDetails = playersArray.map(convertToCamelCase);
  response.send(playerDetails);
});

module.exports = app;

//API 2 Creates a new player in the team (database)

app.post("/players/", async (request, response) => {
  const playerObj = request.body;
  const { playerName, jerseyNumber, role } = playerObj;
  const addPlayerQuery = `INSERT INTO cricket_team
    (player_name,jersey_number,role)
    VALUES('${playerName}',${jerseyNumber},'${role}');
    `;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//API 3 Returns a player based on a player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team
    WHERE player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayerQuery);
  response.send(convertToCamelCase(playerDetails));
});

// API 4 Updates the details of a player in the team (database) based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerObj = request.body;
  const { playerName, jerseyNumber, role } = playerObj;
  const UpdatePlayerQuery = `UPDATE cricket_team
  SET 
  player_name = '${playerName}',
  jersey_number = ${jerseyNumber},
  role = '${role}'
  
  WHERE player_id = ${playerId};`;
  await db.run(UpdatePlayerQuery);
  response.send("Player Details Updated");
});

//API 5 Deletes a player from the team (database) based on the player ID

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team
    WHERE player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
