export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  const HF_TOKEN = process.env.HUGGINGFACE_API_KEY; // Assure-toi que le nom correspond à ton interface Vercel

  // 1. TES RÉPONSES DE CONVERSION (Boutons du Front)
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

  // Si l'utilisateur a cliqué sur un thème, on répond instantanément
  if (preponses[message]) {
    return res.status(200).json({ text: preponses[message] });
  }

  // 2. LOGIQUE IA POUR LES QUESTIONS LIBRES (URL CORRIGÉE)
  try {
    const promptInstruction = "Tu es l'expert d'Alpina Conseil. Réponds en 2 phrases max. Valide le choix, donne un conseil flash, et termine par une question pour aider le client.";

    const response = await fetch(
      "https://router.huggingface.co",
      {
        headers: { 
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `<s>[INST] ${promptInstruction} Question : ${message} [/INST]`,
          parameters: { max_new_tokens: 150, temperature: 0.5 }
        }),
      }
    );

    const data = await response.json();
    
    // Hugging Face Router renvoie souvent un tableau [ { generated_text: "..." } ]
    const result = Array.isArray(data) ? data[0] : data;
    let aiText = result?.generated_text || "";

    // Nettoyage de la réponse
    const finalAnswer = aiText.includes('[/INST]') 
      ? aiText.split('[/INST]').pop().trim() 
      : aiText || "C'est une excellente question. Pour vous répondre précisément, seriez-vous disponible pour un court échange ?";

    res.status(200).json({ text: finalAnswer });

  } catch (error) {
    res.status(200).json({ text: "C'est un sujet important qui mérite une analyse personnalisée. Souhaitez-vous fixer un rendez-vous pour en discuter ?" });
  }
}
