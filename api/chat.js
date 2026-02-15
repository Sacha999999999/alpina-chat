import { huggingface } from '@ai-sdk/huggingface';
import { generateText } from 'ai';

export default async function handler(req, res) {
  // Configuration CORS pour Webador
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const userMessage = req.body?.message;
  if (!userMessage) return res.status(400).json({ text: "Message vide." });

  // 1. Tes PRÉ-RÉPONSES
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

  if (preponses[userMessage]) {
    return res.status(200).json({ text: preponses[userMessage] });
  }

  // 2. IA OUVERTE (Mistral)
  try {
    const { text } = await generateText({
      model: huggingface('mistralai/Mistral-Small-24B-Instruct-2501'),
      prompt: userMessage,
      system: "Tu es un expert financier suisse. Réponds brièvement en 2 phrases."
    });
    return res.status(200).json({ text: text.trim() });
  } catch (e) {
    return res.status(200).json({ text: "Une analyse personnalisée est nécessaire. Pouvons-nous en discuter ?" });
  }
}
