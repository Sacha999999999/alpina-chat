export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: "Méthode non autorisée" });
  const message = req.body?.message;
  if (!message) return res.status(400).json({ text: "Message manquant." });

  try {
    const response = await fetch(
      "https://router.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Tu es l'expert financier d'Alpina Conseil. Réponds de manière claire et concise : ${message} [/INST]`,
          parameters: { max_new_tokens: 150, temperature: 0.4 }
        })
      }
    );

    const data = await response.json();

    let aiText = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiText = data[0].generated_text;
    } else if (data.generated_text) {
      aiText = data.generated_text;
    }

    // Supprimer le texte avant [/INST]
    if (aiText.includes('[/INST]')) aiText = aiText.split('[/INST]').pop().trim();
    if (!aiText) aiText = "Pouvez-vous préciser votre question ?";

    res.status(200).json({ text: aiText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ text: "Erreur de connexion au modèle IA." });
  }
}
