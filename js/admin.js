function iniciarAdmin() {
  const btnInicio = document.getElementById("btnInicio");
  const btnSaibaMais = document.getElementById("btnSaibaMais");
  const sobreWrap = document.getElementById("sobreWrap");
  const abrirAdminNoSobre = document.getElementById("abrirAdminNoSobre");
  const fecharSobre = document.getElementById("fecharSobre");
  const adminWrap = document.getElementById("adminWrap");
  const adminFechar = document.getElementById("adminFechar");
  const adminSair = document.getElementById("adminSair");
  const adminLoginBox = document.getElementById("adminLoginBox");
  const adminUsuario = document.getElementById("adminUsuario");
  const adminSenha = document.getElementById("adminSenha");
  const adminEntrar = document.getElementById("adminEntrar");
  const adminLoginMsg = document.getElementById("adminLoginMsg");
  const adminForm = document.getElementById("adminForm");
  const adminMsg = document.getElementById("adminMsg");
  const adminPlano = document.getElementById("adminPlano");
  const adminSite = document.getElementById("adminSite");
  const adminDescricao = document.getElementById("adminDescricao");
  const adminAtivo = document.getElementById("adminAtivo");
  const adminPatrocinado = document.getElementById("adminPatrocinado");
  const adminLimpar = document.getElementById("adminLimpar");
  const adminExcluir = document.getElementById("adminExcluir");
  const adminStatusLista = document.getElementById("adminStatusLista");
  const adminStatusBusca = document.getElementById("adminStatusBusca");
  const adminAtualizarStatus = document.getElementById(
    "adminAtualizarStatus",
  );
  const acessoLocalWrap = document.getElementById("acessoLocalWrap");
  const acessoLocalForm = document.getElementById("acessoLocalForm");
  const acessoLocalSenha = document.getElementById("acessoLocalSenha");
  const acessoLocalMsg = document.getElementById("acessoLocalMsg");
  const acessoLocalCancelar = document.getElementById(
    "acessoLocalCancelar",
  );
  let tentativasFalhasLogin = 0;
  let bloqueioLoginAte = 0;
  const CHAVE_ACESSO_LOCAL = `${P.storagePrefix}_acesso_local_ok_ate`;
  const ACESSO_LOCAL_TTL_MS = 30 * 60 * 1000;

  function acessoLocalValido() {
    const ate = Number(sessionStorage.getItem(CHAVE_ACESSO_LOCAL) || 0);
    return Number.isFinite(ate) && Date.now() < ate;
  }

  function marcarAcessoLocal() {
    sessionStorage.setItem(
      CHAVE_ACESSO_LOCAL,
      String(Date.now() + ACESSO_LOCAL_TTL_MS),
    );
  }

  /** Só existe com npm start (server.js). Em Vercel/só estático → false. */
  async function servicoLocalAdminDisponivel() {
    try {
      const base =
        window.location.protocol === "file:"
          ? originParaAcessoLocal()
          : window.location.origin;
      const r = await fetch(
        new URL("/api/admin/self-check", base),
        { method: "GET", cache: "no-store" },
      );
      if (!r.ok) return false;
      const j = await r.json();
      if (!j || !j.ok || !j.versao) return false;
      /* Servidor antigo sem o campo: mantém comportamento de “há API de admin”. */
      if (Object.prototype.hasOwnProperty.call(j, "localGate")) {
        return j.localGate === true;
      }
      return true;
    } catch {
      return false;
    }
  }

  function originParaAcessoLocal() {
    if (window.location.protocol !== "file:") {
      return window.location.origin;
    }
    const o = String(P.localLoginOrigin || "").trim().replace(/\/$/, "");
    return o || "http://localhost:3000";
  }

  /** Atualiza P e o cliente Supabase após redeploy (evita /portal-config.js antigo em cache). */
  async function sincronizarPortalConfigDoServidor() {
    try {
      const base =
        window.location.protocol === "file:"
          ? originParaAcessoLocal()
          : window.location.origin;
      const u = new URL("/api/portal-config-data", base);
      u.searchParams.set("cb", String(Date.now()));
      const r = await fetch(u.href, { method: "GET", cache: "no-store" });
      if (!r.ok) return;
      const payload = await r.json();
      if (!payload || typeof payload !== "object") return;
      Object.assign(P, payload);
      const su = (P.supabaseUrl || "").trim();
      const sk = (P.supabaseAnonKey || "").trim();
      if (
        su &&
        sk &&
        typeof window.supabase !== "undefined" &&
        !supabaseClient
      ) {
        supabaseClient = window.supabase.createClient(su, sk, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage,
            storageKey: `${P.storagePrefix}_supabase_auth`,
          },
        });
      }
    } catch (e) {
      console.warn(
        "[portal] Falha ao sincronizar /api/portal-config-data.",
        e,
      );
    }
  }

  async function abrirAdminComProtecaoLocal() {
    await sincronizarPortalConfigDoServidor();
    if (acessoLocalValido()) {
      adminLoginMsg.textContent = "";
      adminWrap.classList.add("active");
      aplicarEstadoAdmin();
      return;
    }
    /* true = nunca pede senha local. Caso contrário: só modal se a API disser localGate (ADMIN_LOCAL_PASS no servidor). */
    if (P.skipLocalAdminGate === true) {
      adminLoginMsg.textContent = "";
      adminWrap.classList.add("active");
      aplicarEstadoAdmin();
      return;
    }
    const temSenhaLocalNoServidor =
      await servicoLocalAdminDisponivel();
    if (!temSenhaLocalNoServidor) {
      adminLoginMsg.textContent = "";
      adminWrap.classList.add("active");
      aplicarEstadoAdmin();
      return;
    }
    acessoLocalMsg.textContent = "";
    acessoLocalSenha.value = "";
    acessoLocalWrap.classList.add("active");
  }

  function aplicarCorPlanoSelecionado() {
    adminPlano.classList.remove(
      "plano-basico",
      "plano-standard",
      "plano-vip",
    );
    if (adminPlano.value === "vip") {
      adminPlano.classList.add("plano-vip");
    } else if (adminPlano.value === "standard") {
      adminPlano.classList.add("plano-standard");
    } else {
      adminPlano.classList.add("plano-basico");
    }
  }

  adminPlano.addEventListener("change", aplicarCorPlanoSelecionado);
  aplicarCorPlanoSelecionado();

  async function adminLogado() {
    if (!supabaseConfigurado()) return false;
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    return Boolean(session);
  }

  async function aplicarEstadoAdmin() {
    if (await adminLogado()) {
      adminLoginBox.classList.add("admin-hidden");
      adminForm.classList.remove("admin-hidden");
      adminSair.style.display = "inline-block";
      atualizarDatalistNomesAdmin();
    } else {
      adminLoginBox.classList.remove("admin-hidden");
      adminForm.classList.add("admin-hidden");
      adminSair.style.display = "none";
    }
  }

  function preencherAdminComCliente(nome) {
    const chave = normalizarTexto(nome);
    if (!chave) return;
    const cliente = (empresas || []).find(
      (e) => normalizarTexto(e.nome) === chave,
    );
    if (!cliente) return;

    document.getElementById("adminNome").value = cliente.nome || "";
    document.getElementById("adminPlano").value = cliente.plano || "basico";
    document.getElementById("adminCategoria").value =
      cliente.categoria || "Outros";
    document.getElementById("adminTelefone").value = normalizarTelefone(
      cliente.tel,
    ).replace(/^55/, "");
    document.getElementById("adminEndereco").value =
      cliente.endereco || "";
    document.getElementById("adminInstagram").value =
      cliente.instagram || "";
    if (adminSite) adminSite.value = cliente.site || "";
    document.getElementById("adminLogoUrl").value = cliente.logo || "";
    adminDescricao.value = String(cliente.descricao || "").trim();
    if (adminAtivo) adminAtivo.checked = empresaAtivaNoPortal(cliente);
    if (adminPatrocinado) adminPatrocinado.checked = Boolean(cliente.patrocinado);
    aplicarCorPlanoSelecionado();
  }

  function limparFormularioAdmin() {
    adminForm.reset();
    if (adminAtivo) adminAtivo.checked = true;
    if (adminPatrocinado) adminPatrocinado.checked = false;
    aplicarCorPlanoSelecionado();
    adminMsg.textContent = "Pronto para novo cadastro.";
  }

  function focarFormularioAdmin() {
    document.getElementById("adminNome").focus();
    adminForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  aplicarEstadoAdmin();

  document.getElementById("adminNome").addEventListener("change", (event) => {
    preencherAdminComCliente(event.target.value);
  });

  if (adminStatusBusca) {
    adminStatusBusca.addEventListener("input", () => {
      renderizarControleStatusAdmin();
    });
  }

  adminAtualizarStatus.addEventListener("click", async () => {
    adminMsg.textContent = "Atualizando lista...";
    try {
      if (supabaseConfigurado()) {
        empresas = aplicarAjustesEmpresas(
          await carregarEmpresasDoPortalComCatalogo(),
        );
      }
      atualizarDatalistNomesAdmin();
      adminMsg.textContent = "Lista atualizada.";
    } catch (erro) {
      adminMsg.textContent = mensagemErroSupabase(erro);
    }
  });

  adminStatusLista.addEventListener("click", async (event) => {
    const editar = event.target.closest("[data-admin-edit-nome]");
    if (editar) {
      const nomeEditar = editar.getAttribute("data-admin-edit-nome") || "";
      preencherAdminComCliente(nomeEditar);
      adminMsg.textContent = "Cliente carregado para edição.";
      focarFormularioAdmin();
      return;
    }

    const btn = event.target.closest("[data-admin-status-nome]");
    if (!btn) return;
    if (!(await adminLogado())) {
      adminMsg.textContent = "Faça login para alterar o status.";
      return;
    }

    const nome = btn.getAttribute("data-admin-status-nome") || "";
    const ativo = btn.getAttribute("data-admin-status-ativo") === "true";
    if (!ativo) {
      const confirmar = window.confirm(
        `Pausar o anúncio de "${nome}"? O cadastro será preservado.`,
      );
      if (!confirmar) return;
    }
    btn.disabled = true;
    adminMsg.textContent = ativo ? "Reativando anúncio..." : "Pausando anúncio...";
    try {
      await definirAtivoClienteNoBanco(nome, ativo);
      if (supabaseConfigurado()) {
        empresas = aplicarAjustesEmpresas(
          await carregarEmpresasDoPortalComCatalogo(),
        );
      }
      carregar(empresasAtivasNoPortal(empresas));
      criarEscada();
      atualizarDatalistNomesAdmin();
      adminMsg.textContent = ativo
        ? "Anúncio reativado no portal."
        : "Anúncio pausado. O cadastro foi preservado.";
    } catch (erro) {
      adminMsg.textContent = mensagemErroSupabase(erro);
    } finally {
      btn.disabled = false;
    }
  });

  if (adminLimpar) {
    adminLimpar.addEventListener("click", limparFormularioAdmin);
  }

  if (adminExcluir) {
    adminExcluir.addEventListener("click", async () => {
      const nome = document.getElementById("adminNome").value.trim();
      if (!(await adminLogado())) {
        adminMsg.textContent = "Faça login para excluir.";
        return;
      }
      if (!nome) {
        adminMsg.textContent = "Informe ou selecione o cliente para excluir.";
        return;
      }
      const confirmar = window.confirm(
        `Excluir definitivamente "${nome}" do banco?`,
      );
      if (!confirmar) return;
      adminMsg.textContent = "Excluindo cliente...";
      try {
        await excluirClienteDoBanco(nome);
        if (supabaseConfigurado()) {
          empresas = aplicarAjustesEmpresas(
            await carregarEmpresasDoPortalComCatalogo(),
          );
        }
        carregar(empresasAtivasNoPortal(empresas));
        criarEscada();
        atualizarDatalistNomesAdmin();
        limparFormularioAdmin();
        adminMsg.textContent = "Cliente excluído com sucesso.";
      } catch (erro) {
        adminMsg.textContent = `Erro ao excluir: ${mensagemErroSupabase(erro)}`;
      }
    });
  }

  btnInicio.addEventListener("click", () => {
    const alvo = document.querySelector('.menu button[data-secao="empresas"]');
    if (typeof mostrar === "function") {
      mostrar("empresas", alvo || undefined);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  btnSaibaMais.addEventListener("click", () => {
    sobreWrap.classList.add("active");
  });

  fecharSobre.addEventListener("click", () => {
    sobreWrap.classList.remove("active");
  });

  sobreWrap.addEventListener("click", (event) => {
    if (event.target === sobreWrap) {
      sobreWrap.classList.remove("active");
    }
  });

  abrirAdminNoSobre.addEventListener("click", async () => {
    sobreWrap.classList.remove("active");
    await abrirAdminComProtecaoLocal();
  });

  acessoLocalCancelar.addEventListener("click", () => {
    acessoLocalWrap.classList.remove("active");
    acessoLocalMsg.textContent = "";
  });

  acessoLocalWrap.addEventListener("click", (event) => {
    if (event.target === acessoLocalWrap) {
      acessoLocalWrap.classList.remove("active");
      acessoLocalMsg.textContent = "";
    }
  });

  acessoLocalForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const senha = acessoLocalSenha.value.trim();

    if (!senha) {
      acessoLocalMsg.textContent = "Preencha a senha.";
      return;
    }

    acessoLocalMsg.textContent = "Validando...";

    try {
      const base = originParaAcessoLocal();
      const loginUrl = new URL("/api/admin/local-login", base).href;
      const resposta = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });

      if (!resposta.ok) {
        const payload = await resposta.json().catch(() => ({}));
        const texto =
          payload.error ||
          payload.message ||
          (typeof payload === "string" ? payload : "");
        acessoLocalMsg.textContent =
          texto.trim() ||
          (resposta.status === 429
            ? "Muitas tentativas. Aguarde ~10 min ou pare e rode npm start de novo."
            : "Senha inválida.");
        return;
      }

      marcarAcessoLocal();
      acessoLocalWrap.classList.remove("active");
      adminLoginMsg.textContent = "";
      adminWrap.classList.add("active");
      aplicarEstadoAdmin();
    } catch (erro) {
      const msg = erro && erro.message ? String(erro.message) : "rede";
      acessoLocalMsg.textContent =
        window.location.protocol === "file:"
          ? `Sem servidor em ${originParaAcessoLocal()}: abra pelo Node (npm start) ou defina localLoginOrigin no portal-config. (${msg})`
          : `Falha ao validar acesso local. Confirme npm start e .env com ADMIN_LOCAL_PASS. (${msg})`;
    }
  });

  adminFechar.addEventListener("click", () => {
    adminWrap.classList.remove("active");
  });

  adminWrap.addEventListener("click", (event) => {
    if (event.target === adminWrap) {
      adminWrap.classList.remove("active");
    }
  });

  adminEntrar.addEventListener("click", async () => {
    const agora = Date.now();
    if (agora < bloqueioLoginAte) {
      const segundos = Math.ceil((bloqueioLoginAte - agora) / 1000);
      adminLoginMsg.textContent = `Muitas tentativas. Tente novamente em ${segundos}s.`;
      return;
    }

    await sincronizarPortalConfigDoServidor();

    const usuario = adminUsuario.value.trim();
    const senha = adminSenha.value;
    if (!usuario || !senha) {
      adminLoginMsg.textContent = "Preencha e-mail e senha.";
      return;
    }

    if (!supabaseConfigurado()) {
      const diag = `${window.location.origin}/api/admin/self-check`;
      adminLoginMsg.textContent =
        `Supabase não configurado: defina SUPABASE_URL e SUPABASE_ANON_KEY na Vercel (nomes exatos), guarde, faça Redeploy e feche/abra o admin. Diagnóstico: ${diag} → supabaseEmAmbiente deve ser true.`;
      return;
    }

    adminLoginMsg.textContent = "Entrando...";

    const { error } = await supabaseClient.auth.signInWithPassword({
      email: usuario,
      password: senha,
    });

    if (error) {
      tentativasFalhasLogin += 1;
      if (tentativasFalhasLogin >= 5) {
        bloqueioLoginAte = Date.now() + 60 * 1000;
        tentativasFalhasLogin = 0;
        adminLoginMsg.textContent =
          "Muitas tentativas inválidas. Aguarde 60s.";
        return;
      }
      adminLoginMsg.textContent = "E-mail ou senha inválidos.";
      return;
    }

    tentativasFalhasLogin = 0;
    bloqueioLoginAte = 0;
    adminLoginMsg.textContent = "Acesso liberado.";
    adminSenha.value = "";
    aplicarEstadoAdmin();
  });

  adminSair.addEventListener("click", async () => {
    if (supabaseConfigurado()) {
      await supabaseClient.auth.signOut();
    }
    adminMsg.textContent = "";
    adminLoginMsg.textContent = "Sessão encerrada.";
    aplicarEstadoAdmin();
  });

  adminForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!(await adminLogado())) {
      adminMsg.textContent = "Faça login para cadastrar.";
      return;
    }

    adminMsg.textContent = "Salvando...";

    const nome = document.getElementById("adminNome").value.trim();
    const plano = document.getElementById("adminPlano").value;
    const categoria = document.getElementById("adminCategoria").value;
    const telInformado = normalizarTelefone(
      document.getElementById("adminTelefone").value,
    );
    const tel = telInformado.startsWith("55")
      ? telInformado
      : `55${telInformado}`;
    const endereco = document
      .getElementById("adminEndereco")
      .value.trim();
    const instagram = document
      .getElementById("adminInstagram")
      .value.trim();
    const site = adminSite ? adminSite.value.trim() : "";
    const descricao = adminDescricao.value.trim();
    const logoUrl = document.getElementById("adminLogoUrl").value.trim();
    const logoArquivo =
      document.getElementById("adminLogoArquivo").files[0];

    if (!nome || !tel) {
      adminMsg.textContent = "Preencha nome e telefone.";
      return;
    }

    const instagramSeguro = urlHttpSegura(instagram);
    const siteSeguro = urlHttpSegura(site);

    if (instagram && !instagramSeguro) {
      adminMsg.textContent =
        "Instagram inválido. Use URL iniciando com http:// ou https://.";
      return;
    }

    if (site && !siteSeguro) {
      adminMsg.textContent =
        "Site inválido. Use URL iniciando com http:// ou https://.";
      return;
    }

    let logo = logoSegura(logoUrl);
    if (logoArquivo) {
      try {
        adminMsg.textContent = "Enviando imagem...";
        logo = await enviarLogoAdmin(logoArquivo, nome);
      } catch (erro) {
        adminMsg.textContent = "Não foi possível ler a imagem enviada.";
        return;
      }
    }

    const novo = normalizarEmpresa({
      nome,
      logo,
      tel,
      categoria,
      plano,
      patrocinado: adminPatrocinado
        ? adminPatrocinado.checked
        : planoParaPatrocinio(plano),
      ativo: adminAtivo ? adminAtivo.checked : true,
      descricao: descricao || undefined,
      endereco: endereco || undefined,
      instagram: instagramSeguro || undefined,
      site: siteSeguro || undefined,
      palavrasChave: [categoria, nome],
    });

    salvarDescricaoCustomizada(nome, descricao);

    try {
      if (supabaseConfigurado()) {
        const acao = await inserirEmpresaBanco(novo);
        empresas = aplicarAjustesEmpresas(
          await carregarEmpresasDoPortalComCatalogo(),
        );
        adminMsg.textContent =
          acao === "updated"
            ? "Cliente atualizado com sucesso."
            : "Cliente cadastrado no banco com sucesso.";
      } else {
        const chave = normalizarTexto(nome);
        const idx = empresas.findIndex(
          (e) => normalizarTexto(e.nome) === chave,
        );
        if (idx >= 0) {
          empresas[idx] = novo;
        } else {
          empresas.push(novo);
        }
        salvarEmpresasStorage(empresas);
        adminMsg.textContent =
          idx >= 0
            ? "Cliente atualizado com sucesso."
            : "Cliente cadastrado com sucesso.";
      }

      carregar(empresasAtivasNoPortal(empresas));
      criarEscada();
      atualizarDatalistNomesAdmin();
    } catch (erro) {
      adminMsg.textContent = `Erro ao salvar: ${mensagemErroSupabase(erro)}`;
      return;
    }

    limparFormularioAdmin();
  });

  if (supabaseConfigurado()) {
    supabaseClient.auth.onAuthStateChange(() => {
      aplicarEstadoAdmin();
    });
  }
}

function iniciarBotaoInicioFixo() {
  const rodape = document.querySelector(".rodape-fixo");
  if (!rodape) return;

  function atualizarVisibilidade() {
    const alturaDocumento = document.documentElement.scrollHeight;
    const posicaoAtual = window.scrollY + window.innerHeight;
    const mostrar = posicaoAtual >= alturaDocumento - 180;
    rodape.classList.toggle("oculto", !mostrar);
  }

  atualizarVisibilidade();
  window.addEventListener("scroll", atualizarVisibilidade, {
    passive: true,
  });
}
