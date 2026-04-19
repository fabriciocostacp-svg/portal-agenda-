const {
  originPublicoParaIndexacaoSemReq,
  conteudoRobotsTxt,
} = require("../seo-origin.js");

module.exports = (req, res) => {
  const origin = originPublicoParaIndexacaoSemReq();
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=1800, s-maxage=1800");
  res.status(200).send(conteudoRobotsTxt(origin));
};
