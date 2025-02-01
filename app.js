const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const fs = require('fs');
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
  const { username, email, password, phone, DateofBirth, language, CountryOfOrigin } = req.body;
  const query = `
    INSERT INTO UserInfo (Name, Email, Password, Phone, DateOfBirth, CountryOfOrigin, Language) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [username, email, password, phone, DateofBirth, CountryOfOrigin, language];
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting data into database:", err);
      res.status(500).send(`
        <script>
          alert("Sign-up failed. Please try again.");
          window.history.back(); // Go back to the sign-up form
        </script>
      `);
      return; 
    }
    console.log("User data inserted successfully:", result);
    res.send(`
      <script>
        alert("Sign-up successful! Redirecting to the sign-in page.");
        window.location.href = "/signin.html";
      </script>
    `);
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

        const password = results[0].Password; 
        res.send(`
          <script>
            alert("Your password is: ${password}");
            window.location.href = "/signin.html";
          </script>
        `);
      } else {

        res.send(`
          <script>
            alert("No matching account found with the provided username and email.");
          </script>
        `);
      }
    });
  });
  
  function extractContent(filePath) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      return fileContent.replace(/<[^>]*>?/gm, ""); 
    } catch (err) {
      console.error("Error reading file:", err);
      return "";
    }
  }
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/homepage.html"));
  });
  
  const pages = {
    homepage: extractContent(path.join(__dirname, "./public/homepage.html")),
    communities: extractContent(path.join(__dirname, "./public/communities.html")),
    healthcare: extractContent(path.join(__dirname, "./public/healthcare.html")),
    legalities: extractContent(path.join(__dirname, "./public/legalities.html")),
    housing: extractContent(path.join(__dirname, "./public/housing.html")),
  };
  
  
  
  app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
  
  
    const websiteContent = Object.entries(pages)
      .map(([page, content]) => `${page.toUpperCase()}:\n${content}`)
      .join("\n\n");
  
  
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: "You are a chatbot for the OneRefuge website. Answer questions by quoting relevant website content." },
            { role: "user", content: `Here is the website content:\n\n${websiteContent}\n\nUser question: ${userMessage}` },
          ],
        },
        {
          headers: {

          },
        }
      );
  
      const botResponse = response.data.choices[0].message.content;
      res.json({ response: botResponse });
    } catch (error) {
      console.error("Error with OpenAI API:", error.message);
      res.status(500).json({ response: "I'm sorry, something went wrong." });
    }
  });
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
