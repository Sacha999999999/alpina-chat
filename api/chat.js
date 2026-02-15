export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  const userMessage = req.body?.message;

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

  if (userMessage && preponses[userMessage]) {
    return res.status(200).json({ text: preponses[userMessage] });
  }

  try {
    // L'URL DOIT ETRE EXACTEMENT CELLE-CI POUR EVITER LE "NOT FOUND"
    const hfUrl = "https://router.huggingface.co/hf-infernece/v1/chat/completions";

    const hfResponse = await fetch(hfUrl, {
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        messages: [
          { role: "system", content: "Tu es un expert financier suisse. Réponds brièvement en 2 phrases." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 300
      }),
    });

    const result = await hfResponse.json();

    if (result.error) {
      return res.status(200).json({ text: "Note HF : " + (result.error.message || JSON.stringify(result.error)) });
    }

    // Extraction du format standard Router/OpenAI
    const aiText = result.choices?.[0]?.message?.content || "";

    return res.status(200).json({ 
      text: aiText || "Désolé, je n'ai pas pu formuler de réponse. Précisez votre demande ?" 
    });

  } catch (error) {
    return res.status(200).json({ text: "Erreur technique : " + error.message });
  }
}
