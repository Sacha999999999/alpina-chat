export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  const HF_KEY = process.env.HUGGINGFACE_API_KEY;

  // 1. RÉPONSES DIRECTES (FONCTIONNENT MÊME SANS IA)
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

  // 2. APPEL IA AVEC GESTION DE FORMAT STRICTE
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        headers: { 
          Authorization: `Bearer ${HF_KEY}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `<s>[INST] Tu es l'expert d'Alpina Conseil. Réponds en 2 phrases max. Valide le choix, donne un conseil flash, et termine par une question. Question : ${message} [/INST]`,
          parameters: { max_new_tokens: 150, temperature: 0.5 }
        }),
      }
    );

    const data = await response.json();
    
    // GESTION DU FORMAT (Tableau vs Objet)
    let aiText = "";
    if (Array.isArray(data)) {
      aiText = data[0].generated_text;
    } else {
      aiText = data.generated_text || data.error || "";
    }

    // NETTOYAGE DU TEXTE
    const finalAnswer = aiText.split('[/INST]').pop().trim();

    res.status(200).json({ text: finalAnswer || "Je n'ai pas pu générer de réponse. Pouvons-nous en discuter de vive voix ?" });

  } catch (error) {
    res.status(200).json({ text: "Une erreur technique s'est produite, mais votre question est pertinente. Fixons un rendez-vous pour en parler !" });
  }
}
