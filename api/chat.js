export default async function handler(req, res) {
  console.log("REQUETE RECUE :", req.body); // On vérifie si le message arrive

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `[INST] Tu es Alpina IA. Réponds brièvement : ${req.body.message} [/INST]`,
        })
      }
    );

    const data = await response.json();
    console.log("REPONSE HF :", data); // On regarde ce que Hugging Face répond vraiment

    // Si Hugging Face renvoie une erreur (quota, clé, etc.)
    if (data.error) {
      return res.status(200).json({ text: "Hugging Face dit : " + data.error });
    }

    // Extraction du texte (cas tableau ou objet)
    const rawText = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;

    if (!rawText) {
      return res.status(200).json({ text: "L'IA a répondu vide. Vérifiez vos crédits HF." });
    }

    const cleanOutput = rawText.split('[/INST]').pop().trim();
    res.status(200).json({ text: cleanOutput });

  } catch (err) {
    console.error("ERREUR SERVEUR :", err);
    res.status(500).json({ text: "Crash du serveur : " + err.message });
  }
}

