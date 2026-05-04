function normalizarTelefone(tel) {
  return String(tel || "").replace(/\D/g, "");
}

function textoPareceArquivoImagem(valor) {
  const texto = String(valor || "").trim();
  if (!texto) return false;
  return /(?:^|[/\\])[^/\\]+\.(?:jpe?g|png|webp|gif)$/i.test(texto);
}

/** Número completo com DDI 55 para wa.me (aceita tel só com DDD+número). */
function telefoneInternacionalBr(tel) {
  let d = normalizarTelefone(tel);
  if (!d) return "";
  if (d.startsWith("55")) return d;
  if (d.length >= 10 && d.length <= 11) return `55${d}`;
  return d;
}

function telefoneValido(tel) {
  const d = telefoneInternacionalBr(tel);
  return d.length >= 12 && d.length <= 13;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00e7/g, "c")
    .replace(/\u00c7/g, "c")
    .toLowerCase()
    .trim();
}



function escaparHtml(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function urlHttpSegura(url) {
  if (!url) return "";
  try {
    const parsed = new URL(String(url), window.location.origin);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
  } catch (erro) {
    return "";
  }
  return "";
}

function urlLogoPublico(caminho) {
  const s = String(caminho || "").trim();
  if (!s) return s;
  if (s.startsWith("data:")) return s;
  if (/^https?:\/\//i.test(s)) return s;
  let rel = s.replace(/^\.\//, "").replace(/^\/+/, "");
  /* Logos versionados em /assets do repo: sempre na mesma origem do index
     (Live Server, Vercel). SUPABASE_LOGOS_PUBLIC_BASE é para storage (ex. ativos/). */
  if (/^assets\//i.test(rel)) {
    try {
      return new URL(rel, window.location.href).href;
    } catch {
      return rel;
    }
  }
  const base = String(SUPABASE_LOGOS_PUBLIC_BASE || "")
    .trim()
    .replace(/\/+$/, "");
  if (!base) {
    try {
      return new URL(rel, window.location.href).href;
    } catch {
      return rel;
    }
  }
  return `${base}/${rel}`;
}

function resolverCaminhoLogoLegado(valor) {
  let n = String(valor || "").trim().replace(/\\/g, "/");
  try {
    n = decodeURIComponent(n);
  } catch (_) {
    /* mantém bruto */
  }
  while (n.startsWith("./")) n = n.slice(2);
  if (n.startsWith("/assets/")) n = n.slice(1);
  /* Banco ou legado com só o ficheiro ("beto.jpeg") → evita URL na raiz e imagem partida. */
  if (!n.includes("/") && /\.(jpe?g|png|webp|gif)$/i.test(n)) {
    n = `assets/${n}`;
  }

  const chave = n.toLowerCase();
  const mapa = {
    "assets/01.jpeg": "assets/conecta.jpeg",
    "assets/julia.jpeg": "assets/julia.jpeg",
    "assets/alves.jpeg": "assets/deposito.jpeg",
    "assets/logo apib.jpeg": "assets/apib.jpeg",
    "assets/sempre bela.jpeg": "assets/sempre-bela.jpeg",
    "assets/sempre-bella.jpeg": "assets/sempre-bela.jpeg",
    "assets/limp-gel.jpeg": "assets/limpgel.jpeg",
    "assets/impulsionaveiculos.jpeg": "assets/impulsiona.jpeg",
    "assets/ec-escavaçoes.jpeg": "assets/escavacoes.jpeg",
    "assets/ec-escavacoes.jpeg": "assets/escavacoes.jpeg",
    "assets/gu.jpeg": "assets/espetaria.jpeg",
    "assets/iara-uber.jpeg": "assets/iara.png",
    "assets/ponto de encontro.jpg": "assets/ponto de encontro.jpeg",
    "assets/beto.jpeg": "assets/beto.png",
    "assets/dona-lena.jpeg": "assets/dona-lena.png",
  };
  if (mapa[chave]) return mapa[chave];
  if (chave.startsWith("assets/")) return n;
  if (chave.startsWith("ativos/")) return n;
  return n;
}

function logoSegura(logo) {
  const valor = String(logo || "").trim();
  if (!valor) return urlLogoPublico("assets/conecta.jpeg");
  if (valor.startsWith("data:image/")) return valor;

  const urlSegura = urlHttpSegura(valor);
  if (urlSegura) return urlSegura;

  const rel = valor.replace(/^\.\//, "").replace(/^\/+/, "");
  const pareceCaminhoImagem =
    rel.startsWith("assets/") ||
    rel.startsWith("ativos/") ||
    (/\.(jpe?g|png|webp)$/i.test(rel) && !/^[a-z][a-z0-9+.-]*:/i.test(rel));

  if (pareceCaminhoImagem) {
    return urlLogoPublico(resolverCaminhoLogoLegado(valor));
  }

  return urlLogoPublico("assets/conecta.jpeg");
}
