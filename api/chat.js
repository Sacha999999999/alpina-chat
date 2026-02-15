export default async function handler(req, res) {
  // 1. AUTORISATION CORS (Pour que Webador puisse parler à Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. RÉCUPÉRATION DU MESSAGE
  const { message } = req.body;

  // 3. RÉPONSES AUTOMATIQUES (Boutons de thèmes)
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

  if (message && preponses[message]) {
    return res.status(200).json({ text: preponses[message] });
  }

  // 4. APPEL IA (Lien Router V1 complet)
  try {
    const response = await fetch("https://router.huggingface.co", {
      headers: { 
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json" 
      },
      method: "POST",
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        messages: [
          { role: "system", content: "Tu es l'expert d'Alpina Conseil en Suisse. Réponds en 2 phrases maximum et termine toujours par une question de qualification." },
          { role: "user", content: message }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    
    // Extraction sécurisée du texte
    const aiText = data.choices[0].message.content;
    res.status(200).json({ text: aiText });

  } catch (error) {
    res.status(200).json({ text: "C'est un sujet important. Pour vous répondre précisément selon votre situation, seriez-vous disponible pour un court échange ?" });
  }
}
