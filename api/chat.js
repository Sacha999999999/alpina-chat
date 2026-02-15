export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ text: "Méthode non autorisée" });
  }

  const message = req.body?.message;

  if (!message) {
    return res.status(400).json({ text: "Message manquant." });
  }

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

  // TEMPORAIRE : réponse simple pour stabiliser
  return res.status(200).json({
    text: "Merci pour votre question. Pouvez-vous préciser votre situation afin que je vous réponde de manière adaptée ?"
  });

}
