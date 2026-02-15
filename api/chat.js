export default async function handler(req, res) {
  // 1. Headers de sécurité (CORS) pour Webador
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const userMessage = req.body?.message;

  // 2. Vos PRÉ-RÉPONSES (Indestructibles)
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

  // On vérifie les préréponses AVANT d'essayer de contacter l'IA
  if (userMessage && preponses[userMessage]) {
    return res.status(200).json({ text: preponses[userMessage] });
  }

  // 3. IA OUVERTE (Version corrigée pour le format Mistral)
  try {
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] Tu es un expert financier suisse. Réponds brièvement à : ${userMessage} [/INST]`,
          options: { wait_for_model: true }
        }),
      }
    );

    const result = await hfResponse.json();
    
    // Correction ici : on gère si c'est un tableau (fréquent chez HF)
    let aiText = Array.isArray(result) ? result[0].generated_text : (result.generated_text || "");

    // On nettoie pour ne garder que la réponse après la balise [/INST]
    if (aiText.includes("[/INST]")) {
      aiText = aiText.split("[/INST]").pop().trim();
    }

    return res.status(200).json({ 
      text: aiText || "Je peux vous aider sur ce point, pouvez-vous préciser votre question ?" 
    });

  } catch (error) {
    return res.status(200).json({ text: "Une petite erreur technique, veuillez reformuler votre question ?" });
  }

    return res.status(200).json({ text: "Service en cours de mise à jour. Retentez dans une minute ?" });
  }
}
