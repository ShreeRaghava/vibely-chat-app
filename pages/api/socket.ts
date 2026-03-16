import { NextApiRequest } from 'next';
import { NextApiResponseServerIo, initSocket } from '@/lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  if (req.method === 'GET') {
    initSocket(res);
    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}