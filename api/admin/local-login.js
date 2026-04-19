/**
 * Vercel: POST /api/admin/local-login
 * Defina ADMIN_LOCAL_PASS nas Environment Variables do projeto (mesmo valor do .env local).
 */
function sanitizarTextoCredencial(s) {
  return String(s ?? "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .normalize("NFC")
    .trim();
}

module.exports = (req, res) => {
  res.setHeader("X-Mural-Portal", "admin-local-pass-1");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const esperadoPass = sanitizarTextoCredencial(process.env.ADMIN_LOCAL_PASS);
  if (!esperadoPass) {
    return res.status(503).json({
      error:
        "Acesso local não configurado no Vercel. Defina ADMIN_LOCAL_PASS nas variáveis de ambiente ou use só o login Supabase (sem ADMIN_LOCAL_PASS).",
    });
  }

  let body = req.body;
  if (body == null) body = {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }

  const senha = sanitizarTextoCredencial(body?.senha);
  const passEsp = sanitizarTextoCredencial(esperadoPass);

  if (!senha) {
    return res.status(401).json({ error: "Preencha a senha." });
  }

  if (senha === passEsp) {
    return res.status(204).send();
  }

  const dicaComprimento =
    passEsp.length > 0 && senha.length !== passEsp.length
      ? ` (a senha configurada tem ${passEsp.length} caracteres)`
      : "";
  return res.status(401).json({
    error: `Senha inválida.${dicaComprimento} Confira ADMIN_LOCAL_PASS no painel Vercel → Settings → Environment Variables.`,
  });
};
