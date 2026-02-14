export default async function handler(req, res) {
  const { message } = req.body;
  try {
    const response = await fetch(
      "https://router.huggingface.co",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Tu es Alpina IA, expert fiscal. Réponds court : ${message} [/INST]`,
          parameters: { max_new_tokens: 200 }
        })
      }
    );

    const data = await response.json();
    
    // On gère le format tableau ou objet de Hugging Face
    const result = Array.isArray(data) ? data[0] : data;
    const text = result?.generated_text || result?.error || "Erreur inconnue";

    // On nettoie la réponse pour enlever l'instruction [INST]
    const finalAnswer = text.includes('[/INST]') ? text.split('[/INST]').pop().trim() : text;

    res.status(200).json({ text: finalAnswer });
  } catch (err) {
    res.status(500).json({ text: "Erreur serveur : " + err.message });
  }
}

