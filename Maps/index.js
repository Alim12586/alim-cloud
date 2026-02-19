const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Sanal gezi endpoint: tours klasöründen HTML dosyası bulur
app.get("/maps/tour/:location", (req, res) => {
  const location = req.params.location;
  const filePath = path.join(__dirname, "tours", `${location}.html`);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Sanal gezi bulunamadı");
  }
});

// Sanal gezi listesi endpoint
app.get("/maps/list", (req, res) => {
  const toursDir = path.join(__dirname, "tours");
  const files = fs.readdirSync(toursDir).filter(f => f.endsWith(".html"));

  const list = files.map(file => {
    const content = fs.readFileSync(path.join(toursDir, file), "utf8");

    // HTML içinden <h2> ve <p> etiketlerini çekelim
    const titleMatch = content.match(/<h2>(.*?)<\/h2>/);
    const cityMatch = content.match(/<p>İl: (.*?)<\/p>/);
    const districtMatch = content.match(/<p>İlçe: (.*?)<\/p>/);

    return {
      file: file,
      title: titleMatch ? titleMatch[1] : "Başlık bulunamadı",
      city: cityMatch ? cityMatch[1] : "İl bulunamadı",
      district: districtMatch ? districtMatch[1] : "İlçe bulunamadı"
    };
  });

  res.json(list);
});

app.listen(PORT, () => {
  console.log(`Alim Maps service running on port ${PORT}`);
});
