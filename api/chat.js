export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ text: "Méthode non autorisée" });

  const message = req.body?.message;
  if (!message) return res.status(400).json({ text: "Message manquant." });

  const preponses = {
    "Fiscalité": "L'optimisation fiscale est le levier le plus rapide pour augmenter votre revenu disponible. Avez-vous une idée du montant que vous souhaiteriez économiser cette année ?",
    "3ème pilier": "Les 3ème piliers sont une excellente opportunité de développement de patrimoine et de protection. En quoi puis-je vous aider précisément sur ce sujet ?",
    "Hypothèque": "Le choix de votre stratégie hypothécaire peut vous faire économiser des dizaines de milliers de francs. Votre projet concerne-t-il un achat ou un renouvellement ?",
    "Succession": "Protéger ses proches et structurer son héritage est essentiel. Avez-vous déjà mis en place des mesures de protection ?",
    "Prévoyance et retraite": "Anticiper sa retraite permet de maintenir son niveau de vie sans surprises. À quel âge envisagez-vous d'arrêter ?",
    "Gestion de fortune": "Une gestion rigoureuse est la clé pour pérenniser votre capital. Quel est votre objectif principal : la croissance ou la sécurité ?",
    "Conseil immobilier": "L'immobilier est une valeur refuge majeure en Suisse. Cherchez-vous une résidence principale ou un investissement de rendement ?",
    "Conseil financier et placements": "Placer son capital intelligemment nécessite une vision globale. Quel horizon de placement envisagez-vous ?"
  };

  // Réponse pré-définie
  if (preponses[message]) return res.status(200).json({ text: preponses[message] });

  // 🎯 Questions ouvertes → Hugging Face
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
          parameters: {
            max_new_tokens: 150,
            temperature: 0.4
          }
        })
      }
    );

    const data = await hfResponse.json();

    // Extraction du texte généré
    let aiText = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiText = data[0].generated_text;
    } else if (data.generated_text) {
      aiText = data.generated_text;
    }

    // Nettoyage pour garder seulement la réponse après [/INST]
    if (aiText.includes('[/INST]')) {
      aiText = aiText.split('[/INST]').pop().trim();
    }

    if (!aiText) aiText = "Merci pour votre question. Pouvez-vous préciser votre situation afin que je vous réponde de manière adaptée ?";

    return res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Erreur Hugging Face:", error);
    return res.status(200).json({
      text: "Merci pour votre question. Pouvez-vous préciser votre situation afin que je vous réponde de manière adaptée ?"
    });
  }
}
