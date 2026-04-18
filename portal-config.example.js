/**
 * Hospedagem estática (sem Node): copie para portal-config.js e preencha.
 * Com npm start, o servidor gera /portal-config.js a partir do .env (tem prioridade).
 */
window.PORTAL_CONFIG = {
  siteName: "Meu portal local",
  siteDescription:
    "Guia local com empresas, contatos úteis e utilidades num só lugar.",
  regionKicker: "Guia local da sua cidade",
  heroTitle: "Tudo da cidade em um portal só",
  heroLead:
    "Encontre empresas, contatos úteis e horários de ônibus com busca rápida e acesso direto.",
  climateTitle: "Previsão do tempo",
  climateLatitude: -22.2528,
  climateLongitude: -47.8169,
  sobreTitulo: "Meu portal local",
  sobreTexto:
    "Guia local com empresas, contatos úteis e horários de ônibus. Use Anuncie para falar com quem opera o portal.",
  whatsappE164: "5519999717781",
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
  applyDefaultCatalog: false,
};
