/**
 * Hospedagem estática (sem Node): copie para portal-config.js e preencha.
 * Com npm start, o servidor gera /portal-config.js a partir do .env (tem prioridade).
 */
window.PORTAL_CONFIG = {
  siteName: "MULTLar VARIEDADES",
  siteDescription:
    "Guia local com variedades, empresas e utilidades em Itirapina e região.",
  regionKicker: "Itirapina e região",
  heroTitle: "Tudo que você procura em um só lugar",
  heroLead:
    "Empresas, contatos úteis, ônibus, CEP novo e mais — com busca rápida.",
  climateTitle: "Previsão do tempo",
  climateLatitude: -22.2528,
  climateLongitude: -47.8169,
  sobreTitulo: "MULTLar VARIEDADES",
  sobreTexto:
    "Guia local com empresas, contatos úteis e horários de ônibus. Use Anuncie para falar com a MULTLar VARIEDADES.",
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
  // true: insere empresas legadas (Valdecir, Gordo…). false: só dados do banco, mas
  // Instagram/logo/descrição dos patrocinadores em EXTRAS ainda são mesclados no código.
  applyDefaultCatalog: false,
};
