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
    // L'URL DOIT ÊTRE COMPLÈTE COMME CI-DESSOUS
    const hfResponse = await fetch(
      "https://router.huggingface.co",
      {
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `[INST] ${userMessage} [/INST]`,
          parameters: { max_new_tokens: 250, temperature: 0.7 },
          options: { wait_for_model: true }
        }),
      }
    );

    // Sécurité pour voir l'erreur réelle si ce n'est pas du JSON
    if (!hfResponse.ok) {
      const errorDetail = await hfResponse.text();
      return res.status(200).json({ text: `Erreur HF (${hfResponse.status}): ${errorDetail}` });
    }

    const result = await hfResponse.json();
    
    let aiText = "";
    if (Array.isArray(result) && result.length > 0) {
      aiText = result[0].generated_text || "";
    } else if (result.generated_text) {
      aiText = result.generated_text;
    }

    if (aiText.includes("[/INST]")) {
      aiText = aiText.split("[/INST]").pop().trim();
    }

    return res.status(200).json({ 
      text: aiText || "Je peux vous aider, pouvez-vous préciser votre question ?" 
    });

  } catch (error) {
    return res.status(200).json({ text: "Erreur technique : " + error.message });
  }
}
