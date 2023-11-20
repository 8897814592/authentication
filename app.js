const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "userData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}'`;
  const user = await db.get(selectUserQuery);
  if (user === undefined) {
    const createUser = `
        INSERT INTO user(username,name,password,gender,location)
        VALUES('${username}','${name}','${hashedPassword}','${gender}','${location}')`;
    const dbResponse = await db.run(createUser);
    response.status(200);
    response.send("User created successfully");
  } else {
    if (dbResponse.password.length() < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      response.status(400);
      response.send("User already exists");
    }
  }
});
app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE username='${username}'`;
  const user = await db.get(selectUserQuery);
  if (user === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (isPasswordMatched === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

module.exports = app;
