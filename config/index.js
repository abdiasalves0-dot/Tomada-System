require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'Tomada-padeiro-secret-2026',
  BASE_URL: process.env.BASE_URL || 'https://tomada-seven.vercel.app',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || undefined,
  ZAPSIGN_TOKEN: process.env.ZAPSIGN_TOKEN || '24375006-6190-4f65-8170-d83bf0faa6d6b5a10ccd-c164-4393-bf4d-59c411e6a7de',
  ZAPSIGN_SANDBOX: process.env.ZAPSIGN_SANDBOX !== 'false',
  ADMIN_ALLOWED_IP_HASH: process.env.ADMIN_ALLOWED_IP_HASH || null,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || null,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || null
};
