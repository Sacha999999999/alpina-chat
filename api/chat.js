export default async function handler(req, res) {
  // 1. AUTORISATION TOTALE POUR TON SITE (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Réponse obligatoire pour la sécurité du navigateur
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { message } = req.body;

  // 2. RÉPONSES AUTOMATIQUES (Boutons)
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

  // 3. APPEL IA (URL Router V1 complète)
  try {
    const response = await fetch("https://router.huggingface.co", {
      headers: { 
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [{ role: "user", content: "Expert Alpina Conseil. Réponds en 2 phrases max : " + message }],
        max_tokens: 150
      })
    });

    const data = await response.json();
    
    // Lecture sécurisée du message
    const aiText = data.choices[0].message.content;
    res.status(200).json({ text: aiText });

  } catch (e) {
    res.status(200).json({ text: "C'est une excellente question. Pour vous répondre précisément selon votre situation, seriez-vous disponible pour un court échange ?" });
  }
}

}
