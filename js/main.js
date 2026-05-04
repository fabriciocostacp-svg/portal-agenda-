aplicarTextosPublicosDoPortal();
iniciarContadorVisitas();
carregarClima();
iniciarCepNovo();
iniciarAdmin();
iniciarBotaoInicioFixo();
inicializarEmpresas();

/* BUSCA */
document.getElementById("busca").addEventListener("input", function () {
  const valor = normalizarTexto(this.value);
  const valorNumero = normalizarTelefone(this.value);
  let filtrado = empresasAtivasNoPortal(empresas).filter(
    (e) =>
      normalizarTexto(e.nome).includes(valor) ||
      normalizarTexto(e.categoria).includes(valor) ||
      normalizarTexto(obterDescricaoServico(e)).includes(valor) ||
      (e.palavrasChave || []).some((termo) =>
        normalizarTexto(termo).includes(valor),
      ) ||
      (valorNumero.length > 0 &&
        normalizarTelefone(e.tel).includes(valorNumero)),
  );
  carregar(filtrado);
});

(function registrarInfoModalUi() {
  const fechar = document.getElementById("infoModalFechar");
  const wrap = document.getElementById("infoModalWrap");
  if (fechar) fechar.addEventListener("click", fecharInfoModal);
  if (wrap) {
    wrap.addEventListener("click", (event) => {
      if (event.target.id === "infoModalWrap") fecharInfoModal();
    });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") fecharInfoModal();
  });
})();

(function registrarBotoesMenuModalLegado() {
  const btnTel = document.getElementById("btnTelefonesUteis");
  const btnOni = document.getElementById("btnHorariosOnibus");
  const btnCep = document.getElementById("btnCepNovo");
  if (btnTel) {
    btnTel.addEventListener("click", () => abrirInfoModal("telefones"));
  }
  if (btnOni) {
    btnOni.addEventListener("click", () => abrirInfoModal("onibus"));
  }
  if (btnCep) {
    btnCep.addEventListener("click", () => abrirInfoModal("cep"));
  }
})();



/* MENU */
function mostrar(secao, botao) {
  document
    .querySelectorAll(".secao")
    .forEach((s) => s.classList.remove("active"));
  const alvo = document.getElementById(secao);
  if (alvo) alvo.classList.add("active");

  if (secao === "cepnovo") {
    const cepBusca = document.getElementById("cepBusca");
    if (cepBusca) {
      cepBusca.value = "";
    }
    renderizarCepNovo(cepNovoDados);
  }

  if (secao === "telefones" || secao === "onibus") {
    if (typeof preencherSecoesTelefonesOnibusCompletas === "function") {
      preencherSecoesTelefonesOnibusCompletas();
    }
  }

  document
    .querySelectorAll(".menu button[data-secao]")
    .forEach((btn) => btn.classList.remove("active-btn"));
  if (!botao) {
    botao = document.querySelector(`.menu button[data-secao="${secao}"]`);
  }
  if (botao) {
    botao.classList.add("active-btn");
  }
}

if (typeof preencherSecoesTelefonesOnibusCompletas === "function") {
  preencherSecoesTelefonesOnibusCompletas();
}
