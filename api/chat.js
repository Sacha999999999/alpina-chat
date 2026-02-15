export default async function handler(req, res) {
  // --- ÉTAPE A : AUTORISER TON SITE (CORS) ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permet à ton site de se connecter
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Non autorisé' });

  const { message } = req.body;
  const HF_KEY = process.env.HUGGINGFACE_API_KEY;

  // --- ÉTAPE B : TES RÉPONSES FLASH (CONVERSION) ---
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

  // --- ÉTAPE C : APPEL IA (URL SIMPLE) ---
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: { 
          "Authorization": `Bearer ${HF_KEY}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `<s>[INST] Tu es l'expert d'Alpina Conseil. Réponds en 2 phrases à : ${message} [/INST]`,
          parameters: { max_new_tokens: 150, temperature: 0.5 }
        }),
      }
    );

    const data = await response.json();
    
    // On extrait le texte peu importe le format (tableau ou objet)
    const result = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    const cleanText = result.split('[/INST]').pop().trim();

    res.status(200).json({ text: cleanText });

  } catch (error) {
    res.status(200).json({ text: "C'est une excellente question. Pour vous répondre précisément selon votre situation, seriez-vous disponible pour un court échange ?" });
  }
}
