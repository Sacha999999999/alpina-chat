import { createHuggingFace } from '@ai-sdk/huggingface';
import { generateText } from 'ai';

const hf = createHuggingFace({
  apiKey: process.env.HUGGINGFACE_API_KEY,
});

export default async function handler(req, res) {
  // 1. Headers CORS pour Webador
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ text: "Méthode non autorisée" });

  const userMessage = req.body?.message;
  if (!userMessage) return res.status(400).json({ text: "Message manquant." });

  // 2. Tes PRÉ-RÉPONSES (Priorité absolue)
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

  // Si l'utilisateur clique sur un bouton de pré-réponse
  if (preponses[userMessage]) {
    return res.status(200).json({ text: preponses[userMessage] });
  }

  // 3. IA MISTRAL pour les questions ouvertes
  try {
    const { text } = await generateText({
      model: hf('mistralai/Mistral-Small-24B-Instruct-2501'),
      system: "Tu es un expert financier suisse haut de gamme. Réponds en 2 phrases maximum. Sois précis, professionnel et invite toujours l'utilisateur à affiner sa demande.",
      prompt: userMessage,
    });

    return res.status(200).json({ text: text.trim() });
  } catch (error) {
    console.error("Détail erreur HF:", error);
    // Message de secours intelligent
    return res.status(200).json({ 
      text: "C'est une excellente question qui mérite une analyse de votre dossier. Souhaitez-vous que nous fassions un point rapide sur votre situation ?" 
    });
  }
}
