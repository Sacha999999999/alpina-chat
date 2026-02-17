// /api/chat.js
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({text:'Method not allowed'});
  const { message } = req.body;
  if(!message) return res.status(400).json({text:'Message vide'});

  // Réponse minimaliste pour test
  res.status(200).json({ text: `✅ Reçu : ${message}` });
}
