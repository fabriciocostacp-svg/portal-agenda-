/**
 * Configuração padrão do portal (sem segredos).
 * Carregada antes de /portal-config.js: no Live Server o segundo ficheiro pode 404,
 * mas esta garante window.PORTAL_CONFIG para o index.html funcionar.
 * Com npm start ou Vercel, /portal-config.js sobrescreve com valores do ambiente.
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
  whatsappE164: "5519999717781",
  whatsappAnuncieMessage:
    "Olá! Vim pelo portal {portal} e tenho interesse em anunciar. Poderia me enviar opções e valores?",
  whatsappClienteTemplate:
    "Olá {nome}, vi seu anúncio no {portal} e gostaria de mais informações.",
  whatsappRenewalTemplate:
    "Olá {nome}! A assinatura do anúncio no {portal} está próxima do vencimento ({data}). Podemos renovar?",
  storagePrefix: "portal_itirapina",
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseTable: "empresas",
  supabaseLogosPublicBase: "",
  applyDefaultCatalog: true,
  skipLocalAdminGate: true,
  localLoginOrigin: "",
  googleSiteVerification: "",
};
