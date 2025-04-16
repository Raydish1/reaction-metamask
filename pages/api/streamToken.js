// --- pages/api/streamToken.js ---
import { StreamChat } from 'stream-chat';



const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const client = StreamChat.getInstance(apiKey, apiSecret);
  const token = client.createToken(userId);

  res.status(200).json({ token });
}