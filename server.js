/**
 * Servidor local: arquivos estáticos + validação do “acesso local” antes do admin.
 * Copie env.example para .env e defina ADMIN_LOCAL_PASS (senha do primeiro passo do admin).
 */
const fs = require("fs");
const path = require("path");
// override: true — variáveis vazias do Cursor/Windows não podem “ganhar” do .env
require("dotenv").config({
  path: path.join(__dirname, ".env"),
  override: true,
});

const {
  strEnv,
  supabaseEmAmbiente,
  montarPayloadPortalConfig,
} = require("./portal-config-env.js");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const PORT = Number(process.env.PORT) || 3000;
const app = express();

/** Atrás de Nginx: defina TRUST_PROXY_HOPS=1 (ou mais) no .env. */
const trustHops = Number(process.env.TRUST_PROXY_HOPS);
if (Number.isFinite(trustHops) && trustHops > 0) {
  app.set("trust proxy", trustHops);
}

/** Ajuda a saber se a porta é mesmo este projeto (outro app também usa /api/...). */
app.use((_req, res, next) => {
  res.setHeader("X-Mural-Portal", "admin-local-pass-1");
  next();
});

const originAlvo = (process.env.APP_ORIGIN || "").trim();
const FALLBACK_OG_ORIGIN = "https://portal-agenda-itirapina.vercel.app";

let indexHtmlCache = null;
function lerIndexHtml() {
  if (!indexHtmlCache) {
    indexHtmlCache = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
  }
  return indexHtmlCache;
}

function publicOriginParaOg(req) {
  const pub = strEnv("PORTAL_PUBLIC_ORIGIN").replace(/\/$/, "");
  if (pub) return pub;
  const app = strEnv("APP_ORIGIN").replace(/\/$/, "");
  if (app) return app;
  const proto = String(req.get("x-forwarded-proto") || req.protocol || "http")
    .split(",")[0]
    .trim();
  const host = String(req.get("x-forwarded-host") || req.get("host") || "")
    .split(",")[0]
    .trim();
  if (host) return `${proto}://${host}`.replace(/\/$/, "");
  return FALLBACK_OG_ORIGIN;
}

function indexHtmlComOgOrigin(req) {
  const pub = publicOriginParaOg(req);
  if (pub === FALLBACK_OG_ORIGIN) return lerIndexHtml();
  return lerIndexHtml().split(FALLBACK_OG_ORIGIN).join(pub);
}
app.use(
  cors({
    origin: originAlvo || true,
    credentials: true,
    exposedHeaders: ["X-Mural-Portal"],
  }),
);

// CSP do Helmet quebra o index.html monolítico (scripts inline).
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(express.json({ limit: "32kb" }));

/**
 * Lê ADMIN_LOCAL_* direto do arquivo .env (mesma pasta do server.js).
 * O Cursor às vezes injeta process.env vazio com o mesmo nome e quebra o login.
 */
function sanitizarTextoCredencial(s) {
  return String(s ?? "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .normalize("NFC")
    .trim();
}

function lerAdminLocalDoArquivo() {
  const envPath = path.join(__dirname, ".env");
  let user = "";
  /** Todas as ocorrências de ADMIN_LOCAL_PASS (a última vazia não deve apagar a anterior). */
  const passLinhas = [];
  try {
    let raw = fs.readFileSync(envPath, "utf8");
    if (raw.charCodeAt(0) === 0xfeff) {
      raw = raw.slice(1);
    }
    for (const linha of raw.split(/\r?\n/)) {
      let t = linha.trim();
      if (t.charCodeAt(0) === 0xfeff) {
        t = t.slice(1).trim();
      }
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i <= 0) continue;
      const chave = t.slice(0, i).trim();
      let valor = t.slice(i + 1).trim();
      const aspasDuplas = valor.startsWith('"') && valor.endsWith('"');
      const aspasSimples = valor.startsWith("'") && valor.endsWith("'");
      if (aspasDuplas || aspasSimples) {
        valor = valor.slice(1, -1);
      } else {
        const corteComentario = valor.search(/\s+#/);
        if (corteComentario !== -1) {
          valor = valor.slice(0, corteComentario).trim();
        }
      }
      if (chave === "ADMIN_LOCAL_USER") user = valor;
      if (chave === "ADMIN_LOCAL_PASS") passLinhas.push(valor);
    }
  } catch {
    /* .env ausente */
  }
  const passBruto =
    [...passLinhas].reverse().find((v) => String(v).trim() !== "") ?? "";
  return {
    user: sanitizarTextoCredencial(user),
    pass: sanitizarTextoCredencial(passBruto),
  };
}

function credenciaisAdminLocal() {
  const arq = lerAdminLocalDoArquivo();
  /** Preferir sempre o arquivo; process.env só se a linha não existir no .env */
  const u =
    arq.user !== "" ? arq.user : sanitizarTextoCredencial(process.env.ADMIN_LOCAL_USER);
  const p =
    arq.pass !== ""
      ? arq.pass
      : sanitizarTextoCredencial(process.env.ADMIN_LOCAL_PASS);
  return { user: u, pass: p };
}

const windowMs = Number(process.env.ADMIN_LOCAL_WINDOW_MS) || 15 * 60 * 1000;
const maxAttempts = Number(process.env.ADMIN_LOCAL_MAX_ATTEMPTS) || 120;
const loginLimiter = rateLimit({
  windowMs,
  max: maxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Diagnóstico: confirme se a porta 3000 é ESTE projeto (caminho + tamanhos, sem revelar senha). */
app.get("/api/admin/self-check", (_req, res) => {
  res.setHeader("X-Mural-Portal", "admin-local-pass-1");
  const { pass: p } = credenciaisAdminLocal();
  res.json({
    ok: true,
    versao: "admin-local-pass-1",
    localGate: p.length > 0,
    pastaDoServidor: __dirname,
    envNoDisco: fs.existsSync(path.join(__dirname, ".env")),
    localPassCaracteres: p.length,
    supabaseEmAmbiente: supabaseEmAmbiente(),
  });
});

app.post("/api/admin/local-login", loginLimiter, (req, res) => {
  const { pass: esperadoPass } = credenciaisAdminLocal();

  if (!esperadoPass) {
    return res.status(503).json({
      error:
        "Acesso local não configurado. Defina ADMIN_LOCAL_PASS no arquivo .env (veja env.example).",
    });
  }

  const senha = sanitizarTextoCredencial(req.body?.senha);
  const passEsp = sanitizarTextoCredencial(esperadoPass);

  if (!senha) {
    return res.status(401).json({ error: "Preencha a senha." });
  }

  if (senha === passEsp) {
    return res.status(204).send();
  }

  // eslint-disable-next-line no-console
  console.warn("[local-login] negado", {
    passOk: false,
    lenSenha: senha.length,
    lenPassEnv: passEsp.length,
  });

  const dicaComprimento =
    passEsp.length > 0 && senha.length !== passEsp.length
      ? ` (a senha configurada tem ${passEsp.length} caracteres)`
      : "";
  return res.status(401).json({
    error: `Senha inválida.${dicaComprimento} Confira o .env na pasta do projeto (junto ao server.js), reinicie o servidor após alterar e use a mesma URL (ex.: http://localhost:${PORT}/).`,
  });
});

app.get("/portal-config.js", (_req, res) => {
  res.type("application/javascript; charset=utf-8");
  res.set("Cache-Control", "no-store, max-age=0");
  const payload = montarPayloadPortalConfig();
  res.send(`window.PORTAL_CONFIG=${JSON.stringify(payload)};\n`);
});

const raiz = __dirname;

app.use(
  express.static(raiz, {
    index: false,
    dotfiles: "deny",
  }),
);

app.get("/", (req, res) => {
  res.type("html; charset=utf-8");
  res.send(indexHtmlComOgOrigin(req));
});

app.use((_req, res) => {
  res.status(404).send("Não encontrado");
});

app.listen(PORT, () => {
  const { pass: p } = credenciaisAdminLocal();
  // eslint-disable-next-line no-console
  console.log(
    `Portal: http://localhost:${PORT}/  | Acesso local: senha ${p.length} caracteres no .env (ADMIN_LOCAL_PASS)`,
  );
});
