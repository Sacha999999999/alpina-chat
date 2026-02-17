import { google } from 'googleapis';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ text: 'Method not allowed' });

  const { message } = req.body;

  if (!message) return res.status(400).json({ text: 'Message vide' });

  // 1️⃣ Enregistrer le message dans Google Sheets
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: 'Chats!A:C',
      valueInputOption: 'RAW',
      resource: { values: [[new Date().toISOString(), message, '']] },
    });
  } catch (err) {
    console.error('Erreur Google Sheets:', err);
  }

  // 2️⃣ Appeler GPT pour générer la réponse
  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        temperature: 0.6
      })
    });

    const data = await gptRes.json();
    const reply = data.choices?.[0]?.message?.content || 'Je n’ai pas compris votre question.';

    // 3️⃣ Enregistrer la réponse dans Google Sheets
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SHEET_ID,
        range: 'Chats!A:C',
        valueInputOption: 'RAW',
        resource: { values: [[new Date().toISOString(), message, reply]] },
      });
    } catch (err) {
      console.error('Erreur Google Sheets (réponse):', err);
    }

    res.status(200).json({ text: reply });
  } catch (err) {
    console.error('Erreur GPT:', err);
    res.status(500).json({ text: 'Erreur IA, réessayez plus tard.' });
  }
}
