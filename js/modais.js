const telefonesUteisDados = [
  ["ALMOXARIFADO", "3575-1526 / 3575-2527"],
  ["APAE - ASSOCIAÇÃO PAIS E AMIGOS", "3575-1090"],
  ["ASSOCIAÇÃO COMERCIAL E INDUSTRIAL", "3575-1443"],
  ["BIBLIOTECA MUNICIPAL", "3575-1852"],
  ["BROA - BALNEÁRIO SANTO ANTONIO", "3575-1060 - 3575-1351"],
  ["CÂMARA MUNICIPAL DE ITIRAPINA", "3575-1186 - 3575-3006"],
  ["CARTORIO DE REGISTRO CIVIL", "3575-4186"],
  ["CASA DA AGRICULTURA", "3575-1305"],
  ["CASA DA CULTURA (GUARIENTO)", "3575-1852"],
  ["CEAC - JARDIM DOS EUCALIPTOS", "3575-4077"],
  ["CEAC - NOVA ITIRAPINA", "3575-1826"],
  ["CENTRO COMUNITÁRIO 'CARMO CHICARELLI'", "3575-2156"],
  ["CENTRO SAÚDE - CENTRO", "3575-9030"],
  ["CENTRO SAÚDE NOVA ITIRAPINA", "3575-1112"],
  ["CEREM", "3575-2090"],
  ["CONSELHO TUTELAR DE ITIRAPINA", "3575-3434"],
  ["CORREIOS", "3575-1496"],
  ["CRASS - CENTRO REFERENCIA ASSISTENCIA SOCIAL", "3575-1826"],
  ["CRECHE INFANTIL 'ANA CÂNDIDA ROSSLER'", "3575-1983"],
  ["CRECHE INFANTIL 'CARMO GOVANETTI'", "3575-1609"],
  ["CRECHE INFANTIL 'MENINO JESUS'", "3575-1227"],
  ["DAE - DEPARTAMENTO DE ÁGUA E ESGOTO", "3575-1901 - 3575-2156"],
  ["DELEGACIA DE POLÍCIA DE ITIRAPINA", "3575-1333"],
  ["EE PROF JOAQUIM DE TOLEDO CAMARGO", "3575-1232"],
  ["ELETRICIDADE - ELEKTRO", "0800701-0102 - 3575-1266"],
  ["EMEF 'ARACY LEAL BERNARDI' BLOCO I", "3575-1867"],
  ["EMEF 'ARACY LEAL BERNARDI' BLOCO II", "3575-2535"],
  ["EMEF 'ARACY LEAL BERNARDI' BLOCO III (Infantil)", "3575-1446"],
  [
    "EMEF 'JOSÉ CRUZ' EMEI 'ENEIDA CÁRIO CORNACHIONNI'",
    "3575-2435",
  ],
  ["ESCOLA 'HILDA BARROS' - NOVA ITIRAPINA", "3575-4077"],
  ["ESTAÇÃO EXPERIMENTAL - FAZENDINHA", "3575-1345"],
  ["ESTAÇÃO RODOVIARIA (Telefone Público)", "3575-0240"],
  ["FORUM DE ITIRAPINA - Administração", "3575-1270"],
  ["FORUM DE ITIRAPINA - Geral", "3575-1772"],
  ["FORUM DE ITIRAPINA - Pequenas Causas", "3575 1105"],
  ["FORUM DE ITIRAPINA - Promotoria Pública", "3575-1874"],
  ["FUNDO SOCIAL", "3575-1246"],
  ["GINÁSIO DE ESPORTES - CIEC - CENTRO", "3575-1104"],
  [
    "GINÁSIO DE ESPORTES - NOVA ITIRAPINA (Telefone Público)",
    "3575-0365",
  ],
  ["HOSPITAL MUNICIPAL 'SÃO JOSÉ'", "3575-9200"],
  ["ORDEM DOS ADVOGADOS DO BRASIL", "3575-4156"],
  [
    "POLÍCIA MILITAR (190)",
    "Administração 3575 2234 - Atendimento 3575-1779",
  ],
  ["PREFEITURA MUNICIPAL DE ITIRAPINA", "3575-9000"],
  ["RODOVIA AYRTON SENNA - Atendimento ao Usuário", "3575-1060"],
  ["SANTA CASA DE LIMEIRA", "(19) 3446-6100"],
  ["SANTA CASA DE RIO CLARO", "(19) 3535-7000"],
  [
    "SECRETARIA DESENVOLVIMENTO SOCIAL",
    "3575-2162 - 3575-3716",
  ],
  ["TAXISTAS - PONTO CENTRAL", "3575-1017 - 3575-1300"],
  ["TERMINAL RODOVIÁRIO - Telefone Público", "3575-0240"],
  ["VIGILANCIA SANITARIA", "3575-9030"],
];

const onibusHorariosDados = [
  {
    titulo: "SEGUNDA A SEXTA",
    rotas: [
      {
        nome: "Itirapina → São Carlos",
        horarios: ["05:50", "08:00", "12:00", "15:05", "17:10"],
      },
      {
        nome: "São Carlos → Itirapina",
        horarios: ["07:00", "11:00", "13:00", "16:05", "18:30"],
      },
    ],
  },
  {
    titulo: "SÁBADO",
    rotas: [
      {
        nome: "Itirapina → São Carlos",
        horarios: ["08:00", "15:00", "17:10"],
      },
      {
        nome: "São Carlos → Itirapina",
        horarios: ["07:00", "13:00", "16:05"],
      },
    ],
  },
];

function hrefTelefoneUtil(telefone) {
  const primeiro = String(telefone || "").match(/(?:\(\d{2}\)\s*)?\d[\d\s-]{2,}\d|\b190\b/);
  const numero = normalizarTelefone(primeiro ? primeiro[0] : telefone);
  return numero ? `tel:${numero}` : "#";
}

/** HTML completo da grelha de telefones (lista oficial em `telefonesUteisDados`). */
function htmlTelefonesUteisCompleto() {
  return `
<div class="telefones-grid">
  ${telefonesUteisDados
    .map(
      ([nome, telefone]) => `<article class="telefone-card">
    <strong>${escaparHtml(nome)}</strong>
    <span>${escaparHtml(telefone)}</span>
    <a class="telefone-ligar" href="${hrefTelefoneUtil(telefone)}">☎ Ligar</a>
  </article>`,
    )
    .join("")}
</div>
<p class="info-modal-nota">Fonte: <a href="https://turismoemitirapina.webnode.page/telefones-uteis/" target="_blank" rel="noopener noreferrer">turismoemitirapina.webnode.page/telefones-uteis</a></p>`;
}

/** HTML completo dos horários de ônibus (`onibusHorariosDados`). */
function htmlOnibusCompleto() {
  return `
<div class="onibus-grid">
  ${onibusHorariosDados
    .map(
      (grupo) => `<article class="onibus-card">
    <div class="onibus-card-topo">
      <span class="onibus-card-icone" aria-hidden="true">🚌</span>
      <div>
        <span class="onibus-card-label">Horários</span>
        <h3>${escaparHtml(grupo.titulo)}</h3>
      </div>
    </div>
    ${grupo.rotas
      .map(
        (rota) => `<div class="onibus-rota">
<strong><span aria-hidden="true">↔</span>${escaparHtml(rota.nome)}</strong>
<div class="onibus-horarios">
  ${rota.horarios.map((h) => `<span>${escaparHtml(h)}</span>`).join("")}
</div>
    </div>`,
      )
      .join("")}
  </article>`,
    )
    .join("")}
</div>`;
}

function renderizarCepModal(lista) {
  const destino = document.getElementById("infoCepLista");
  if (!destino) return;
  const itens = Array.isArray(lista) ? lista : [];
  if (!itens.length) {
    destino.innerHTML =
      '<div class="cep-item"><strong>Nenhum CEP encontrado.</strong></div>';
    return;
  }
  destino.innerHTML = itens
    .map(
      (item) => `<div class="cep-item">
  <strong>${escaparHtml(item.logradouro || "")}</strong>
  <span>Bairro: ${escaparHtml(item.bairro || "")}</span>
  <span>CEP: ${escaparHtml(item.cep || "")}</span>
  <span>${escaparHtml(item.cidade || "")} - ${escaparHtml(item.estado || "")}</span>
</div>`,
    )
    .join("");
}

function htmlCepCompleto() {
  return `
<div class="cep-wrap cep-wrap-modal">
  <input
    class="cep-busca"
    id="infoCepBusca"
    type="text"
    placeholder="Buscar por rua, bairro ou CEP..."
    autocomplete="off"
  />
  <div class="cep-lista" id="infoCepLista"></div>
</div>`;
}

/**
 * Preenche as secções da página (#telefonesCorpo, #onibusCorpo) com a mesma lista
 * completa usada no modal — funciona em index.html e index_teste.html.
 */
function preencherSecoesTelefonesOnibusCompletas() {
  const tel = document.getElementById("telefonesCorpo");
  const oni = document.getElementById("onibusCorpo");
  if (tel) tel.innerHTML = htmlTelefonesUteisCompleto();
  if (oni) oni.innerHTML = htmlOnibusCompleto();
}

function abrirInfoModal(tipo) {
  const wrap = document.getElementById("infoModalWrap");
  const kicker = document.getElementById("infoModalKicker");
  const titulo = document.getElementById("infoModalTitulo");
  const descricao = document.getElementById("infoModalDescricao");
  const corpo = document.getElementById("infoModalCorpo");
  if (!wrap || !titulo || !corpo) return;

  if (tipo === "telefones") {
    if (kicker) kicker.textContent = "Itirapina - DDD 19";
    titulo.textContent = "Telefones Úteis";
    if (descricao) {
      descricao.textContent =
        "Contatos importantes organizados para consulta rápida.";
    }
    corpo.innerHTML = htmlTelefonesUteisCompleto();
  } else if (tipo === "cep") {
    if (kicker) kicker.textContent = "Endereçamento";
    titulo.textContent = "CEP";
    if (descricao) {
      descricao.textContent =
        "Consulte todos os CEPs por rua, bairro ou número do CEP.";
    }
    corpo.innerHTML = htmlCepCompleto();
    renderizarCepModal(cepNovoDados);
    const buscaCep = document.getElementById("infoCepBusca");
    if (buscaCep) {
      buscaCep.addEventListener("input", () => {
        const termo = normalizarTexto(buscaCep.value);
        const filtrada = (cepNovoDados || []).filter(
          (item) =>
            normalizarTexto(item.logradouro).includes(termo) ||
            normalizarTexto(item.bairro).includes(termo) ||
            normalizarTexto(item.cep).includes(termo),
        );
        renderizarCepModal(filtrada);
      });
      setTimeout(() => buscaCep.focus(), 50);
    }
  } else {
    if (kicker) kicker.textContent = "Transporte";
    titulo.textContent = "Horários de Ônibus";
    if (descricao) {
      descricao.textContent =
        "Linhas entre Itirapina e São Carlos organizadas por dia.";
    }
    corpo.innerHTML = htmlOnibusCompleto();
  }

  wrap.classList.add("active");
  wrap.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function fecharInfoModal() {
  const wrap = document.getElementById("infoModalWrap");
  if (!wrap) return;
  wrap.classList.remove("active");
  wrap.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
