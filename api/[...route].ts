import dotenv from 'dotenv';
import app from '../server/app';

dotenv.config();

export default function handler(req: any, res: any) {
  return app(req, res);
}
