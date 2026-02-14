export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ text: "Méthode non autorisée" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ text: "Message vide" });

  if (!process.env.HUGGINGFACE_API_KEY) {
    return res.status(500).json({ text: "Clé Hugging Face manquante." });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/distilgpt2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: message })
      }
    );

    const data = await response.json();
    let output;

    if (Array.isArray(data) && data[0]?.generated_text) {
      output = data[0].generated_text;
    } else if (data.generated_text) {
      output = data.generated_text;
    } else if (data.error) {
      output = "Erreur Hugging Face : " + data.error;
    } else {
      output = "Je n'ai pas compris votre message.";
    }

    res.status(200).json({ text: output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ text: "Problème serveur, réessayez." });
  }
}
