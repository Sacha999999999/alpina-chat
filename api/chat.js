export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  const userMessage = req.body?.message;

  // Tes préréponses (Priorité)
  const preponses = {
    "Fiscalité": "L'optimisation fiscale est le levier le plus rapide pour augmenter votre revenu disponible...",
    "3ème pilier": "Les 3ème piliers sont une excellente opportunité...",
    "Hypothèque": "Le choix de votre stratégie hypothécaire..."
    // ... Garde tes autres préréponses ici
  };

  if (userMessage && preponses[userMessage]) {
    return res.status(200).json({ text: preponses[userMessage] });
  }

  // RECONSTITUTION DE L'URL ROUTER (Zéro erreur de copier-coller)
  const base = "https://router.huggingface.co";
  const service = "/hf-inference/v1/chat/completions";
  const url = base + service;

  try {
    const hfResponse = await fetch(url, {
      headers: {
        "Authorization": "Bearer " + process.env.HUGGINGFACE_API_KEY,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          { role: "system", content: "Tu es un expert financier suisse professionnel." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 300
      }),
    });

    const result = await hfResponse.json();

    if (result.error) {
      return res.status(200).json({ text: "Note HF : " + (result.error.message || JSON.stringify(result.error)) });
    }

    // Extraction du format Router (choices[0])
    const aiText = result.choices?.[0]?.message?.content || "";

    return res.status(200).json({ 
      text: aiText || "Je peux vous aider sur ce point, pouvez-vous préciser votre question ?" 
    });

  } catch (error) {
    return res.status(200).json({ text: "Erreur technique : " + error.message });
  }
}
