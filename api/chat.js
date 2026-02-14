export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ text: "Méthode non autorisée" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ text: "Message vide" });

  if (!process.env.HUGGINGFACE_API_KEY) {
    return res.status(500).json({ text: "Clé API manquante dans Vercel." });
  }

  try {
    // Utilisation d'un modèle performant (Mistral 7B)
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // On donne un rôle à l'IA avec les balises [INST]
          inputs: `[INST] Tu es Alpina IA, un expert fiscal professionnel et concis. Réponds en français à : ${message} [/INST]`,
          parameters: { 
            max_new_tokens: 250,
            temperature: 0.7 
          }
        })
      }
    );

      const data = await response.json();

    // On vérifie si la réponse est dans un tableau (Hugging Face fait souvent ça)
    // ou si c'est un objet direct.
    let resultText = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      resultText = data[0].generated_text;
    } else if (data.generated_text) {
      resultText = data.generated_text;
    }

    if (resultText) {
      // On enlève l'instruction [INST] pour ne garder que la réponse de l'IA
      const cleanOutput = resultText.split('[/INST]').pop().trim();
      res.status(200).json({ text: cleanOutput });
    } else if (data.error) {
      // Gestion de l'attente si le modèle dort
      const msg = data.error.includes("currently loading") 
        ? "L'expert Alpina prépare ses dossiers... Réessayez dans 20 secondes."
        : "Erreur : " + data.error;
      res.status(200).json({ text: msg });
    } else {
      res.status(200).json({ text: "Je n'ai pas reçu de réponse textuelle." });
    }


  } catch (err) {
    console.error(err);
    res.status(500).json({ text: "Problème de connexion au serveur fiscal." });
  }
}

