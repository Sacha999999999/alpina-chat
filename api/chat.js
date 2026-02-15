export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ text: "Méthode non autorisée" });

  const message = req.body?.message;
  if (!message) return res.status(400).json({ text: "Message manquant." });

  const preponses = {
    "Fiscalité": "L'optimisation fiscale est le levier le plus rapide pour augmenter votre revenu disponible...",
    "3ème pilier": "Les 3ème piliers sont une excellente opportunité...",
    "Hypothèque": "Le choix de votre stratégie hypothécaire peut vous faire économiser...",
    "Succession": "Protéger ses proches et structurer son héritage est essentiel...",
    "Prévoyance et retraite": "Anticiper sa retraite permet de maintenir votre niveau de vie...",
    "Gestion de fortune": "Une gestion rigoureuse est la clé pour pérenniser votre capital...",
    "Conseil immobilier": "L'immobilier est une valeur refuge majeure en Suisse...",
    "Conseil financier et placements": "Placer son capital intelligemment nécessite une vision globale..."
  };

  if (preponses[message]) return res.status(200).json({ text: preponses[message] });

  // Pour questions ouvertes
  try {
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Tu es l'expert financier d'Alpina Conseil en Suisse. Réponds de manière claire et concise (2-3 phrases max) : ${message} [/INST]`,
          parameters: { max_new_tokens: 150, temperature: 0.4 }
        })
      }
    );

    const data = await hfResponse.json();
    let aiText = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : data.generated_text || "";
    if (aiText.includes('[/INST]')) aiText = aiText.split('[/INST]').pop().trim();
    if (!aiText) aiText = "Merci pour votre question. Pouvez-vous préciser votre situation ?";
    return res.status(200).json({ text: aiText });

  } catch (err) {
    console.error(err);
    return res.status(200).json({ text: "Erreur de connexion au serveur IA." });
  }
}
