export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ text: "Méthode non autorisée" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ text: "Message vide" });

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: message })
    });

    const data = await response.json();

    // Toujours renvoyer un texte même si Hugging Face renvoie un problème
    const output = data[0]?.generated_text || "Je n'ai pas compris votre message.";

    res.status(200).json({ text: output });

  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(200).json({ text: "Je rencontre un problème pour répondre, réessayez." });
  }
}

