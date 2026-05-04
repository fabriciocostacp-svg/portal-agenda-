let cepNovoDados = [];

async function carregarCepNovoDados() {
  const embutido =
    typeof window !== "undefined" &&
    Array.isArray(window.__CEP_ITIRAPINA_EMBUTIDO)
      ? window.__CEP_ITIRAPINA_EMBUTIDO
      : null;

  const urls = [];
  try {
    urls.push(new URL("data/ceps-itirapina.json", window.location.href).href);
  } catch (_) {
    urls.push("data/ceps-itirapina.json");
  }
  urls.push("data/ceps-itirapina.json");

  let carregado = false;
  for (const u of urls) {
    try {
      const resposta = await fetch(u, { cache: "no-store" });
      if (!resposta.ok) continue;
      cepNovoDados = await resposta.json();
      if (Array.isArray(cepNovoDados) && cepNovoDados.length) {
        carregado = true;
        break;
      }
    } catch (_) {
      /* tenta próximo URL */
    }
  }

  if (!carregado) {
    if (embutido && embutido.length) {
      cepNovoDados = embutido;
    } else {
      console.warn(
        "[portal] CEP: não foi possível carregar data/ceps-itirapina.json (use Live Server ou npm start).",
      );
      cepNovoDados = [];
    }
  }

  renderizarCepNovo(cepNovoDados);
}

function renderizarCepNovo(lista) {
  const cepLista = document.getElementById("cepLista");
  if (!cepLista) return;
  cepLista.innerHTML = "";

  (lista || []).forEach((item) => {
    cepLista.innerHTML += `
<div class="cep-item">
  <strong>${escaparHtml(item.logradouro || "")}</strong>
  <span>Bairro: ${escaparHtml(item.bairro || "")}</span>
  <span>CEP: ${escaparHtml(item.cep || "")}</span>
  <span>${escaparHtml(item.cidade || "")} - ${escaparHtml(item.estado || "")}</span>
</div>`;
  });

  if (!lista || !lista.length) {
    cepLista.innerHTML =
      '<div class="cep-item"><strong>Nenhum CEP encontrado.</strong></div>';
  }
}


async function iniciarCepNovo() {
  const cepBusca = document.getElementById("cepBusca");
  await carregarCepNovoDados();
  if (!cepBusca) return;
  cepBusca.addEventListener("input", function () {
    const termo = normalizarTexto(this.value);
    const filtrada = cepNovoDados.filter(
      (item) =>
        normalizarTexto(item.logradouro).includes(termo) ||
        normalizarTexto(item.bairro).includes(termo) ||
        normalizarTexto(item.cep).includes(termo),
    );
    renderizarCepNovo(filtrada);
  });
}
