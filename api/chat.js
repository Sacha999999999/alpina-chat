// chat.js (Vercel) - prêt à remplacer l'ancien

export default async function handler(req, res) {
  // CORS pour que le front Webador puisse appeler cette API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;

  // === 1. Réponses fixes pour les pré-choix ===
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

  if (preponses[message]) {
    return res.status(200).json({ text: preponses[message] });
  }

  // === 2. Questions libres → appel Mistral via Hugging Face ===
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `<s>[INST] Tu es l'expert financier d'Alpina Conseil en Suisse. Réponds de manière claire, concise et professionnelle (2-3 phrases maximum). Question client : ${message} [/INST]`,
          parameters: { max_new_tokens: 150, temperature: 0.4 }
        })
      }
    );

    const data = await response.json();

    // === 3. Extraction du texte généré ===
    let aiText = "";

    if (Array.isArray(data)) {
      // Hugging Face peut renvoyer un tableau
      aiText = data[0]?.generated_text || "";
    } else {
      aiText = data.generated_text || "";
    }

    // Nettoyage pour retirer la balise d’instruction
    if (aiText.includes('[/INST]')) {
      aiText = aiText.split('[/INST]').pop().trim();
    }

    // Si la réponse est vide, fallback
    if (!aiText) {
      aiText = "Merci pour votre question. Pouvez-vous préciser votre situation afin que je vous réponde de manière adaptée ?";
    }

    return res.status(200).json({ text: aiText });

  } catch (err) {
    console.error("Erreur API Hugging Face:", err);
    return res.status(200).json({ text: "C'est une excellente question. Pour vous répondre précisément, seriez-vous disponible pour un court échange ?" });
  }
}
