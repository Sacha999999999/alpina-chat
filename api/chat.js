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
    // ON CHANGE DE MODELE ET D'URL POUR SORTIR DU BUG
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: userMessage }),
      }
    );

    const result = await hfResponse.json();

    // Si on a encore un problème, on affiche le résultat BRUT pour comprendre
    if (result.error) {
      return res.status(200).json({ text: "Info HF: " + JSON.stringify(result.error) });
    }

    // Extraction simplifiée
    const aiText = Array.isArray(result) ? result[0].summary_text : (result.generated_text || "Pas de réponse.");

    return res.status(200).json({ text: aiText });

  } catch (error) {
    return res.status(200).json({ text: "Erreur technique: " + error.message });
  }
}
