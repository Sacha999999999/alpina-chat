import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
import fetch from "node-fetch"; // si Node < 18

const app = express();
app.use(bodyParser.json());

const DATA_FILE = path.join("./data.json");

// Initialiser fichier de stockage si inexistant
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ conversations: [], preResponses: [] }));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ text: "Message vide" });

  const data = readData();

  // Vérifier pré-réponses
  const pre = data.preResponses.find(pr => pr.question.toLowerCase() === message.toLowerCase());
  if (pre) return res.json({ text: pre.answer });

  // Sinon, appel au modèle Hugging Face
  if (!process.env.HUGGINGFACE_API_KEY) {
    return res.status(500).json({ text: "Clé Hugging Face manquante." });
  }

  try {
    const modelResponse = await fetch(
      "https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125M",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: [message],
          parameters: { max_new_tokens: 50 }
        })
      }
    );

    const json = await modelResponse.json();
    const output = json[0]?.generated_text || "Je n'ai pas compris votre message.";

    // Sauvegarder conversation
    data.conversations.push({ question: message, answer: output });
    writeData(data);

    res.json({ text: output.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ text: "Erreur serveur, réessayez." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend démarré sur le port ${PORT}`));
