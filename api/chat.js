export default async function handler(req, res) {
  // Autorisations CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { message } = req.body;

  // Réponses pré-définies pour les boutons rapides
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

  // Si c'est une réponse pré-définie, on la renvoie directement
  if (preponses[message]) return res.status(200).json({ text: preponses[message] });

  // Sinon, on appelle Hugging Face Mistral pour une réponse libre
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
          inputs: `Tu es un expert financier pour Alpina Conseil. Réponds clairement et concisément (max 2 phrases) à la question suivante : "${message}"`,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.4,
            return_full_text: false
          }
        })
      }
    );

    const data = await response.json();

    let aiText = "";

    // Lecture robuste selon le format renvoyé par Hugging Face
    if (Array.isArray(data) && data.length && data[0].generated_text) {
      aiText = data[0].generated_text.trim();
    } else if (data.generated_text) {
      aiText = data.generated_text.trim();
    }

    // Si Hugging Face ne renvoie rien de correct, fallback
    if (!aiText) {
      aiText = "Merci pour votre question. Pouvez-vous préciser votre situation afin que je vous réponde de manière adaptée ?";
    }

    res.status(200).json({ text: aiText });

  } catch (error) {
    console.error("Erreur Hugging Face :", error);
    res.status(200).json({
      text: "Merci pour votre question. Pouvez-vous préciser votre situation afin que je vous réponde de manière adaptée ?"
    });
  }
}
ur vous répondre précisément, seriez-vous disponible pour un court échange ?" });
  }
}
