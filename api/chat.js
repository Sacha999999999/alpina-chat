export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  const { message } = req.body;
  const HF_KEY = process.env.HUGGINGFACE_API_KEY;

  // 1. TES RÉPONSES DE CONVERSION (Boutons)
  const preponses = {
    "Fiscalité": "L'optimisation fiscale est le levier le plus rapide pour augmenter votre revenu disponible. Avez-vous une idée du montant que vous souhaiteriez économiser cette année ?",
    "3ème pilier": "Les 3ème piliers sont une excellente opportunité de développement de patrimoine et de protection. En quoi puis-je vous aider précisément sur ce sujet ?",
    "Hypothèque": "Le choix de votre stratégie hypothécaire peut vous faire économiser des dizaines de milliers de francs. Votre projet concerne-t-il un achat ou un renouvellement ?",
    "Succession": "Protéger ses proches et structurer son héritage est essentiel. Avez-vous déjà mis en place des mesures de protection pour votre famille ?",
    "Prévoyance et retraite": "Anticiper sa retraite permet de maintenir son niveau de vie sans surprises. À quel âge envisagez-vous idéalement d'arrêter votre activité ?",
    "Gestion de fortune": "Une gestion rigoureuse est la clé pour pérenniser votre capital. Quel est votre objectif principal : la croissance ou la sécurité ?",
    "Conseil immobilier": "L'immobilier est une valeur refuge majeure en Suisse. Cherchez-vous une résidence principale ou un investissement de rendement ?",
    "Conseil financier et placements": "Placer son capital intelligemment nécessite une vision globale. Quel horizon de placement envisagez-vous ?"
  };

  if (preponses[message]) {
    return res.status(200).json({ text: preponses[message] });
  }

  // 2. APPEL IA (URL Router V1 corrigée)
  try {
    const response = await fetch(
      "https://router.huggingface.co",
      {
        headers: { 
          "Authorization": `Bearer ${HF_KEY}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          messages: [
            { role: "system", content: "Tu es l'expert d'Alpina Conseil en Suisse. Réponds en 2 phrases maximum. Termine toujours par une question pour aider le client." },
            { role: "user", content: message }
          ],
          max_tokens: 150,
          temperature: 0.5
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
       console.error("HF Error:", data.error);
       return res.status(200).json({ text: "C'est une excellente question. Pour vous répondre précisément, seriez-vous disponible pour un court échange ?" });
    }

    const aiText = data.choices[0].message.content;
    res.status(200).json({ text: aiText });

  } catch (error) {
    res.status(200).json({ text: "Une analyse personnalisée est nécessaire pour ce sujet. Souhaitez-vous fixer un rendez-vous ?" });
  }
}

