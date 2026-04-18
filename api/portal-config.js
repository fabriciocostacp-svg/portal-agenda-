/**
 * Vercel Serverless: gera /portal-config.js a partir das Environment Variables.
 * O rewrite em vercel.json aponta /portal-config.js -> /api/portal-config
 */
const { montarPayloadPortalConfig } = require("../portal-config-env.js");

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  const payload = montarPayloadPortalConfig();
  res.status(200).send(`window.PORTAL_CONFIG=${JSON.stringify(payload)};\n`);
};
