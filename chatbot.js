const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./public")));


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
          Authorization: `Bearer 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`,
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

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Chatbot is running on http://localhost:${PORT}`);
});
