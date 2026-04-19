/**
 * Origem pública (URL base) para sitemap / robots / indexação.
 * 1) PORTAL_PUBLIC_ORIGIN no .env / Vercel
 * 2) VERCEL_URL (só em deploy Vercel)
 * 3) fallback do projeto em produção
 */
const { strEnv } = require("./portal-config-env.js");

const FALLBACK_ORIGIN_INDEXACAO =
  "https://portal-agenda-lime.vercel.app";

function originPublicoParaIndexacaoSemReq() {
  const pub = strEnv("PORTAL_PUBLIC_ORIGIN").replace(/\/$/, "");
  if (pub) return pub;
  const v = String(process.env.VERCEL_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (v) {
    const host = v.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return FALLBACK_ORIGIN_INDEXACAO;
}

function escXmlLoc(url) {
  return String(url)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function conteudoSitemapXml(origin) {
  const base = String(origin || "").replace(/\/$/, "");
  const loc = escXmlLoc(`${base}/`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

function conteudoRobotsTxt(origin) {
  const base = String(origin || "").replace(/\/$/, "");
  return `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;
}

module.exports = {
  FALLBACK_ORIGIN_INDEXACAO,
  originPublicoParaIndexacaoSemReq,
  conteudoSitemapXml,
  conteudoRobotsTxt,
};
