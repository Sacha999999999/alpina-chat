import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ text: "Méthode non autorisée" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ text: "Message vide" });

  try {
    // Appel Hugging Face via Vercel
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2", // tu peux remplacer gpt2 par le modèle Hugging Face de ton choix
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: message })
      }
    );

    const data = await response.json();

    // Hugging Face renvoie un tableau ou un objet selon le modèle
    const output = data[0]?.generated_text || "Désolé, je n'ai pas compris.";

    // Renvoie au frontend
    res.status(200).json({ text: output });

  } catch (err) {
    console.error(err);
    res.status(500).json({ text: "Erreur serveur" });
  }
}
