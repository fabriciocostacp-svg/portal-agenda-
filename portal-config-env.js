/**
 * Monta o objeto PORTAL_CONFIG a partir de process.env.
 * Usado por server.js (local) e por api/portal-config.js (Vercel).
 */
function envBool(nome, padrao) {
  const v = String(process.env[nome] ?? "")
    .trim()
    .toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return padrao;
}

function strEnv(nome, padrao = "") {
  return String(process.env[nome] ?? padrao)
    .normalize("NFC")
    .trim();
}

function supabaseEmAmbiente() {
  return Boolean(strEnv("SUPABASE_URL") && strEnv("SUPABASE_ANON_KEY"));
}

function montarPayloadPortalConfig() {
  const lat = Number(process.env.PORTAL_CLIMATE_LAT);
  const lon = Number(process.env.PORTAL_CLIMATE_LON);
  const siteName = strEnv("PORTAL_SITE_NAME", "Portal");
  return {
    siteName,
    siteDescription: strEnv(
      "PORTAL_SITE_DESCRIPTION",
      "Guia local com empresas, contatos úteis e utilidades.",
    ),
    regionKicker: strEnv("PORTAL_REGION_KICKER", "Guia local"),
    heroTitle: strEnv("PORTAL_HERO_TITLE", "Tudo da cidade em um portal só"),
    heroLead: strEnv(
      "PORTAL_HERO_LEAD",
      "Encontre empresas, contatos úteis e horários de ônibus com busca rápida e acesso direto.",
    ),
    climateTitle: strEnv(
      "PORTAL_CLIMATE_TITLE",
      "Previsão do tempo",
    ),
    climateLatitude: Number.isFinite(lat) ? lat : -22.2528,
    climateLongitude: Number.isFinite(lon) ? lon : -47.8169,
    sobreTitulo: strEnv("PORTAL_SOBRE_TITULO") || siteName,
    sobreTexto: strEnv(
      "PORTAL_SOBRE_TEXTO",
      "Guia local com empresas, contatos úteis, horários de ônibus e previsão do tempo. Use o botão Anuncie para falar com quem opera o portal.",
    ),
    whatsappE164: (() => {
      const d = strEnv("PORTAL_WHATSAPP_E164").replace(/\D/g, "");
      return d.length >= 12 ? d : "5519999717781";
    })(),
    whatsappAnuncieMessage: strEnv(
      "PORTAL_WHATSAPP_ANUNCIE_MESSAGE",
      "Olá! Vim pelo portal {portal} e tenho interesse em anunciar. Poderia me enviar opções e valores?",
    ),
    whatsappClienteTemplate: strEnv(
      "PORTAL_WHATSAPP_CLIENT_TEMPLATE",
      "Olá {nome}, vi seu anúncio no {portal} e gostaria de mais informações.",
    ),
    whatsappRenewalTemplate: strEnv(
      "PORTAL_WHATSAPP_RENEWAL_TEMPLATE",
      "Olá {nome}! A assinatura do anúncio no {portal} está próxima do vencimento ({data}). Podemos renovar?",
    ),
    storagePrefix: strEnv("PORTAL_STORAGE_PREFIX", "portal_itirapina").replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    ),
    supabaseUrl: strEnv("SUPABASE_URL"),
    supabaseAnonKey: strEnv("SUPABASE_ANON_KEY"),
    supabaseTable: strEnv("SUPABASE_TABLE", "empresas") || "empresas",
    supabaseLogosPublicBase: strEnv("SUPABASE_LOGOS_PUBLIC_BASE"),
    applyDefaultCatalog: envBool("PORTAL_APPLY_DEFAULT_CATALOG", true),
    /** true = só Supabase. false = sempre pede senha .env. Em Vercel o padrão é true (sem ADMIN_LOCAL_PASS no deploy). */
    skipLocalAdminGate: envBool(
      "PORTAL_SKIP_LOCAL_ADMIN_GATE",
      Boolean(process.env.VERCEL),
    ),
    /** Com file://, URL base para /api/admin/* (ex.: http://localhost:3010). */
    localLoginOrigin: strEnv("PORTAL_LOCAL_LOGIN_ORIGIN", ""),
    /** Google Search Console → verificação alternativa à etiqueta HTML (só o valor do atributo content). */
    googleSiteVerification: strEnv("GOOGLE_SITE_VERIFICATION"),
  };
}

module.exports = {
  envBool,
  strEnv,
  supabaseEmAmbiente,
  montarPayloadPortalConfig,
};
