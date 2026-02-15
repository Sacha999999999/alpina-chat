export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  const userMessage = req.body?.message;

  const preponses = {
    "Fiscalité": "L'optimisation fiscale est le levier le plus rapide pour augmenter votre revenu disponible...",
    "3ème pilier": "Les 3ème piliers sont une excellente opportunité...",
    "Hypothèque": "Le choix de votre stratégie hypothécaire..."
  };

  if (userMessage && preponses[userMessage]) {
    return res.status(200).json({ text: preponses[userMessage] });
  }

  try {
    // LA SEULE URL QUE LE ROUTER ACCEPTE EN 2026
    const url = "https://router.huggingface.co";

    const hfResponse = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          { role: "system", content: "Tu es un expert financier suisse. Réponds en 2 phrases." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 300
      }),
    });

    const result = await hfResponse.json();

    if (result.error) {
      return res.status(200).json({ text: "Note HF : " + (result.error.message || JSON.stringify(result.error)) });
    }

    const aiText = result.choices?.[0]?.message?.content || "";

    return res.status(200).json({ 
      text: aiText || "Désolé, je n'ai pas pu formuler de réponse." 
    });

  } catch (error) {
    return res.status(200).json({ text: "Erreur technique : " + error.message });
  }
}
