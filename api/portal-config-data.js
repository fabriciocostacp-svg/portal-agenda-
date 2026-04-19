/**
 * Vercel: GET /api/portal-config-data — mesmo payload que /portal-config.js, em JSON.
 * Usado pelo browser com cache: no-store para apanhar SUPABASE_* após redeploy.
 */
const { montarPayloadPortalConfig } = require("../portal-config-env.js");

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).json(montarPayloadPortalConfig());
};
