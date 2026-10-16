/**
 * Server Configuration & Environment Variables
 * NOTE: These variables should ONLY be accessed on the server.
 */

export const serverConfig = {
  uddoktaPay: {
    apiKey: process.env.UDDOKTAPAY_API_KEY || '982d381360a69d419689740d9f2e26ce36fb7a50',
    baseUrl: process.env.UDDOKTAPAY_BASE_URL || 'https://sandbox.uddoktapay.com/api',
  },
  database: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

export default serverConfig;
