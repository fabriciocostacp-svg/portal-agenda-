/**
 * Vercel: GET /api/admin/self-check
 * localGate=false quando ADMIN_LOCAL_PASS não está no ambiente → o site pula o modal.
 */
module.exports = (req, res) => {
  res.setHeader("X-Mural-Portal", "admin-local-pass-1");
  const p = String(process.env.ADMIN_LOCAL_PASS ?? "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .normalize("NFC")
    .trim();
  res.status(200).json({
    ok: true,
    versao: "admin-local-pass-1",
    localGate: p.length > 0,
    vercel: true,
  });
};
