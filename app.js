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
  res.sendFile(path.join(__dirname, "public/homepage.html"));
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
        res.send(`
          <script>
            alert("Sign-up successful! Redirecting to the sign in page");
            window.location.href = "/signin.html";
          </script>
        `);
      }
      console.log("User data inserted:", result);
      res.redirect("/signin.html");
    });
  });
  app.post("/signin", (req, res) => {
    const { username,password } = req.body;
  
    const query = `
      SELECT * 
      FROM UserInfo
      WHERE Name = ?
        AND Password = ?
    `;
    const values = [username,password];
  
    db.query(query, values, (err, results) => {
      if (err) {
        console.error("Error querying the database:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
  
      if (results.length > 0) {
        res.send(`
          <script>
            alert("Sign-in successful! Redirecting to the dashboard...");
            window.location.href = "/homiepagie2.html";
          </script>
        `);
      } else {
        // No match found
        res.send("No matching user found.");
      }
    });
  });
  app.post("/forgot", (req, res) => {
    const { username, email } = req.body;
  
    const query = `
      SELECT Password 
      FROM UserInfo
      WHERE Name = ?
        AND Email = ?
    `;
    const values = [username, email];
  
    db.query(query, values, (err, results) => {
      if (err) {
        console.error("Database error:", err);
        res.status(500).send(`
          <script>
            alert("An error occurred. Please try again later.");
            window.history.back();
          </script>
        `);
        return;
      }
  
      if (results.length > 0) {
        // Password found
        const password = results[0].Password; // Extract the password
        res.send(`
          <script>
            alert("Your password is: ${password}");
            window.location.href = "/signin.html";
          </script>
        `);
      } else {
        // No matching user found
        res.send(`
          <script>
            alert("No matching account found with the provided username and email.");
          </script>
        `);
      }
    });
  });
  
// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});