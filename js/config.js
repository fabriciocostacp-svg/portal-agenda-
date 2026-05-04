(function mergePortalConfig() {
  const incoming =
    window.PORTAL_CONFIG && typeof window.PORTAL_CONFIG === "object"
      ? window.PORTAL_CONFIG
      : {};
  const def = {
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
      "Guia local com empresas, contatos úteis, horários de ônibus e previsão do tempo. Use o botão Anuncie para falar com quem opera o portal.",
    whatsappE164: "5519999717781",
    whatsappAnuncieMessage: "Quero anunciar no Portal Itirapina",
    whatsappClienteTemplate:
      "Olá {nome}, vi seu anúncio no {portal} e gostaria de mais informações.",
    whatsappRenewalTemplate:
      "Olá {nome}! A assinatura do anúncio no {portal} está próxima do vencimento ({data}). Podemos renovar?",
    storagePrefix: "portal_itirapina",
    supabaseUrl: "",
    supabaseAnonKey: "",
    supabaseTable: "empresas",
    supabaseLogosPublicBase: "",
    supabaseLogosBucket: "logos",
    applyDefaultCatalog: true,
    localLoginOrigin: "",
    googleSiteVerification: "",
  };
  const merged = { ...def, ...incoming };
  const waIn = String(merged.whatsappE164 || "").replace(/\D/g, "");
  const waDef = String(def.whatsappE164 || "").replace(/\D/g, "");
  merged.whatsappE164 =
    waIn.length >= 12 ? waIn : waDef.length >= 12 ? waDef : "";
  const msgIn = String(merged.whatsappAnuncieMessage || "").trim();
  merged.whatsappAnuncieMessage = msgIn || def.whatsappAnuncieMessage;
  if (String(merged.whatsappE164 || "").replace(/\D/g, "").length < 12) {
    merged.whatsappE164 = def.whatsappE164;
  }
  if (!String(merged.supabaseUrl || "").trim()) {
    merged.supabaseUrl = def.supabaseUrl;
  }
  if (!String(merged.supabaseAnonKey || "").trim()) {
    merged.supabaseAnonKey = def.supabaseAnonKey;
  }
  window.PORTAL_CONFIG = merged;
  const gv = String(merged.googleSiteVerification || "").trim();
  if (gv) {
    document
      .querySelectorAll('meta[name="google-site-verification"]')
      .forEach((el) => el.remove());
    const metaG = document.createElement("meta");
    metaG.name = "google-site-verification";
    metaG.content = gv;
    document.head.appendChild(metaG);
  }
})();

const P = window.PORTAL_CONFIG;

function preencherPlaceholdersWhatsApp(
  tpl,
  { nome = "", data = "", portal = "" } = {},
) {
  return String(tpl ?? "")
    .split("{nome}")
    .join(String(nome))
    .split("{data}")
    .join(String(data))
    .split("{portal}")
    .join(String(portal));
}

function aplicarTextosPublicosDoPortal() {
  document.title = P.siteName;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute("content", P.siteDescription);
  const rk = document.getElementById("portalRegionKicker");
  if (rk) rk.textContent = P.regionKicker || "Guia local";
  const ht = document.getElementById("portalHeroTitle");
  if (ht) ht.textContent = P.heroTitle || "";
  const hl = document.getElementById("portalHeroLead");
  if (hl) hl.textContent = P.heroLead || "";
  const ct = document.getElementById("portalClimateTitle");
  if (ct) ct.textContent = P.climateTitle || "Previsão do tempo";
  const st = document.getElementById("portalSobreTitulo");
  if (st) st.textContent = P.sobreTitulo || P.siteName || "";
  const sp = document.getElementById("portalSobreTexto");
  if (sp) sp.textContent = P.sobreTexto || "";
  const wa = document.getElementById("portalLinkAnuncie");
  if (wa) {
    const tel = String(P.whatsappE164 || "").replace(/\D/g, "");
    if (tel.length >= 12) {
      const textoAnuncie = preencherPlaceholdersWhatsApp(
        P.whatsappAnuncieMessage,
        { portal: P.siteName || "portal local" },
      ).trim();
      const msg = encodeURIComponent(textoAnuncie);
      const waUrl = `https://wa.me/${tel}?text=${msg}`;
      wa.setAttribute("href", waUrl);
      wa.setAttribute("data-wa-href", waUrl);
      wa.setAttribute("target", "_blank");
      wa.setAttribute("rel", "noopener noreferrer");
      wa.classList.remove("is-disabled");
      wa.removeAttribute("title");
    } else {
      wa.setAttribute("href", "#");
      wa.removeAttribute("data-wa-href");
      wa.removeAttribute("target");
      wa.removeAttribute("rel");
      wa.classList.add("is-disabled");
      wa.setAttribute(
        "title",
        "Defina PORTAL_WHATSAPP_E164 no .env (DDI+DDD+número, ex.: 5519999717781).",
      );
    }
  }
}

function mensagemWhatsAppCliente(nomeEmpresa) {
  const tpl =
    P.whatsappClienteTemplate ||
    "Olá {nome}, vi seu anúncio no {portal} e gostaria de mais informações.";
  return preencherPlaceholdersWhatsApp(tpl, {
    nome: String(nomeEmpresa || "").trim(),
    portal: P.siteName || "portal",
  });
}

function mensagemWhatsAppRenovacao(nomeEmpresa, dataFmt) {
  const tpl =
    P.whatsappRenewalTemplate ||
    "Olá {nome}! A assinatura do anúncio no {portal} está próxima do vencimento ({data}). Podemos renovar?";
  return preencherPlaceholdersWhatsApp(tpl, {
    nome: String(nomeEmpresa || "").trim(),
    data: String(dataFmt || "").trim(),
    portal: P.siteName || "portal",
  });
}

const STORAGE_EMPRESAS = `${P.storagePrefix}_empresas`;
const STORAGE_VISITAS = `${P.storagePrefix}_visitas`;
const STORAGE_DESCRICOES = `${P.storagePrefix}_descricoes`;
const STORAGE_ROTACAO_VIP = `${P.storagePrefix}_rotacao_vip`;
const SUPABASE_URL = (P.supabaseUrl || "").trim();
const SUPABASE_ANON_KEY = (P.supabaseAnonKey || "").trim();
const SUPABASE_TABLE = (P.supabaseTable || "empresas").trim() || "empresas";

const SUPABASE_LOGOS_PUBLIC_BASE = (P.supabaseLogosPublicBase || "").trim();

let supabaseClient =
  SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
          storageKey: `${P.storagePrefix}_supabase_auth`,
        },
      })
    : null;

if (!supabaseClient) {
  if (typeof window.supabase === "undefined") {
    console.warn(
      "[portal] Biblioteca Supabase não carregou (CDN / bloqueador).",
    );
  } else if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      "[portal] Defina SUPABASE_URL e SUPABASE_ANON_KEY. Na Vercel: Settings → Environment Variables → Redeploy. Confira no navegador (F12 → Rede) se GET /portal-config.js responde 200.",
    );
  }
}

let empresasPadrao = [];

function obterIndiceRotacaoVip() {
  try {
    const atual = Number(localStorage.getItem(STORAGE_ROTACAO_VIP) || 0);
    const seguro = Number.isFinite(atual) && atual >= 0 ? atual : 0;
    localStorage.setItem(STORAGE_ROTACAO_VIP, String(seguro + 1));
    return seguro;
  } catch {
    return Math.floor(Date.now() / 1000);
  }
}

const INDICE_ROTACAO_VIP = obterIndiceRotacaoVip();

async function carregarEmpresasPadraoJson() {
  const bust = "20";
  const candidatos = [
    new URL(`data/empresas-demo.json?v=${bust}`, window.location.href)
      .href,
    `${window.location.origin}/data/empresas-demo.json?v=${bust}`,
  ];
  for (let k = 0; k < candidatos.length; k += 1) {
    const url = candidatos[k];
    try {
      const resposta = await fetch(url, { cache: "no-store" });
      if (!resposta.ok) continue;
      const dados = await resposta.json();
      if (!Array.isArray(dados)) continue;
      empresasPadrao = dados;
      return;
    } catch {
      /* tenta próxima URL */
    }
  }
  console.warn(
    "[portal] Não foi possível carregar data/empresas-demo.json (Live Server: abra a pasta do projeto como raiz). Usando lista mínima.",
  );
  empresasPadrao = [
    {
      nome: "MULTLar VARIEDADES",
      logo: "assets/multilar-logo.jpeg",
      tel: "5519971689501",
      instagram: "https://www.instagram.com/multlar_itirapina/",
      endereco:
        "R. Jaguarucu, 669 - Jardim Nova Itirapina, Itirapina - CEP 13530-268",
      categoria: "Variedades / Loja",
      descricao:
        "Produtos de limpeza, utilidades domésticas, material escolar, brinquedos e eletrônicos.",
      palavrasChave: [
        "multilar",
        "variedades",
        "loja",
        "itirapina",
        "jaguarucu",
        "limpeza",
        "escolar",
        "brinquedos",
        "eletronicos",
      ],
      plano: "vip",
      patrocinado: true,
    },
    {
      nome: "Samarina Marino",
      logo: "assets/samarina.png",
      tel: "5519997399970",
      instagram: "https://www.instagram.com/samarinagomesmarino/",
      categoria: "Beleza",
      descricao:
        "Consultora de Beleza Natura e Avon — atendimento e pedidos com praticidade.",
      palavrasChave: ["natura", "avon", "beleza", "consultora"],
      plano: "vip",
      patrocinado: true,
    },
  ];
}
