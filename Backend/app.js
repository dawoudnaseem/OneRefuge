const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "OneRefuge",
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/homiepagie.html"));
});
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to the database!");
});
app.post("/signup", (req, res) => {
  const { username, email, password, phone, DateofBirth, language, CountryOfOrigin } =
    req.body;
    const query = `
    INSERT INTO UserInfo (Name, Email, Password, Phone, DateOfBirth, CountryOfOrigin, Language) values (?,?,?,?,?,?,?)`;
    const values = [username, email, password, phone, DateofBirth, language,CountryOfOrigin];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error inserting data into the database:", err);
        res.status(500).send("Error saving data. Please try again.");
        return;
      }
      console.log("User data inserted:", result);
    });
  });
// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});