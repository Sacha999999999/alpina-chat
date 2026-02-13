import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rediriger les appels /api/chat vers le fichier api/chat.js
app.use("/api/chat", (req, res) => import("./api/chat.js").then(mod => mod.default(req, res)));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
