/**
 * Hospedagem estática (sem Node): copie para portal-config.js e preencha.
 * Com npm start, o servidor gera /portal-config.js a partir do .env (tem prioridade).
 */
window.PORTAL_CONFIG = {
  siteName: "Portal",
  siteDescription:
    "Guia local com variedades, empresas e utilidades em Itirapina e região.",
  regionKicker: "Itirapina e região",
  heroTitle: "Tudo que você procura em um só lugar",
  heroLead:
    "Empresas, contatos úteis, ônibus, CEP novo e mais — com busca rápida.",
  climateTitle: "Previsão do tempo",
  climateLatitude: -22.2528,
  climateLongitude: -47.8169,
  sobreTitulo: "Portal",
  sobreTexto:
    "Guia local com empresas, contatos úteis e horários de ônibus. Use Anuncie para falar com quem opera o portal.",
  whatsappE164: "5519971689501",
  whatsappAnuncieMessage:
    "Olá! Vim pelo portal {portal} e tenho interesse em anunciar. Poderia me enviar opções e valores?",
  whatsappClienteTemplate:
    "Olá {nome}, vi seu anúncio no {portal} e gostaria de mais informações.",
  whatsappRenewalTemplate:
    "Olá {nome}! A assinatura do anúncio no {portal} está próxima do vencimento ({data}). Podemos renovar?",
  storagePrefix: "portal_local",
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseTable: "empresas",
  supabaseLogosPublicBase: "",
  // true: com Supabase, une a tabela com nomes que faltam do data/empresas-demo.json.
  // false: somente linhas do banco (white-label).
  applyDefaultCatalog: false,
  // true = sem modal de senha .env (só login Supabase). Em Vercel costuma ser true.
  skipLocalAdminGate: true,
  // file:// + Node noutra porta: "http://localhost:3010"
  localLoginOrigin: "",
  // Google Search Console (só o token do content da meta, sem aspas)
  googleSiteVerification: "",
};
