const express = require("express");
const path = require("path");
const fs = require("fs");
const translate = require("@vitalets/google-translate-api"); // translation library

const app = express();
const PORT = 3000;

// Serve a specific tour HTML file
app.get("/maps/tour/:location", (req, res) => {
  const location = req.params.location;
  const filePath = path.join(__dirname, "tours", `${location}.html`);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Virtual tour not found");
  }
});

// List all tours with translated metadata
app.get("/maps/list", async (req, res) => {
  const userLang = req.query.lang || "en"; // default language is English
  const toursDir = path.join(__dirname, "tours");
  const files = fs.readdirSync(toursDir).filter(f => f.endsWith(".html"));

  const list = await Promise.all(files.map(async file => {
    const content = fs.readFileSync(path.join(toursDir, file), "utf8");

    // Extract metadata from HTML
    const titleMatch = content.match(/<h2>(.*?)<\/h2>/);
    const cityMatch = content.match(/<p>(İl|City|Ville|Ciudad|Stadt): (.*?)<\/p>/);
    const districtMatch = content.match(/<p>(İlçe|District|Quartier|Distrito|Bezirk): (.*?)<\/p>/);

    // Translate to user language
    const title = titleMatch ? (await translate(titleMatch[1], { to: userLang })).text : "Title not found";
    const city = cityMatch ? (await translate(cityMatch[2], { to: userLang })).text : "City not found";
    const district = districtMatch ? (await translate(districtMatch[2], { to: userLang })).text : "District not found";

    return { file, title, city, district };
  }));

  res.json(list);
});

app.listen(PORT, () => {
  console.log(`Alim Maps service running on port ${PORT}`);
});
