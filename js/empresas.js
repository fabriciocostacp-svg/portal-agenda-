function planoParaPatrocinio(plano) {
  return plano === "vip";
}

function empresaAtivaNoPortal(empresa) {
  const a = empresa && empresa.ativo;
  if (a === false || a === 0 || a === "0") return false;
  if (String(a).toLowerCase() === "false") return false;
  const ate = normalizarDataIsoCobranca(
    empresa.ativoAte ?? empresa.ativo_ate,
  );
  if (ate) {
    const hoje = new Date().toISOString().slice(0, 10);
    if (ate < hoje) return false;
  }
  return true;
}

/** ISO yyyy-mm-dd, N dias a partir de hoje (calendário local). */
function somarDiasIsoDesdeHoje(dias) {
  const n = Number(dias);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function empresasAtivasNoPortal(lista) {
  return (lista || []).filter(empresaAtivaNoPortal);
}

function empresasPatrocinadasNoPortal(lista) {
  return (lista || []).filter(
    (empresa) => empresaAtivaNoPortal(empresa) && Boolean(empresa.patrocinado),
  );
}

function normalizarDataIsoCobranca(val) {
  if (val == null || val === "") return undefined;
  const s = String(val).trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  return s;
}

function normalizarNomeIgualdade(texto) {
  const limpo = String(texto || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\s\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, " ")
    .trim();
  return normalizarTexto(limpo);
}

function tituloCorrigidoSamarinaMarino(nomeBruto) {
  const n = normalizarNomeIgualdade(nomeBruto);
  if (!n) return null;
  if (n === "samarina gomes marino") return "Samarina Marino";
  const soLetras = n.replace(/[^a-z]/g, "");
  if (soLetras === "samarinagomesmarino") return "Samarina Marino";
  return null;
}

function renomearLegadoSamarinaMarino(empresa) {
  if (!empresa || empresa.nome == null) return empresa;
  const t = tituloCorrigidoSamarinaMarino(empresa.nome);
  if (t) return { ...empresa, nome: t };
  return empresa;
}

function normalizarEmpresa(empresa) {
  empresa = renomearLegadoSamarinaMarino(empresa);
  const plano = empresa.plano === "vip" ? "vip" : "basico";
  const patrocinado =
    empresa.patrocinado === true ||
    empresa.patrocinado === 1 ||
    empresa.patrocinado === "1" ||
    String(empresa.patrocinado).toLowerCase() === "true" ||
    (empresa.patrocinado == null && planoParaPatrocinio(plano));
  const descricao = String(empresa.descricao || "").trim();
  const rawAte = empresa.ativoAte ?? empresa.ativo_ate;
  const ativoAteNorm = normalizarDataIsoCobranca(rawAte);
  const ativo = empresaAtivaNoPortal(
    rawAte === null
      ? { ...empresa, ativoAte: undefined, ativo_ate: undefined }
      : {
          ...empresa,
          ...(ativoAteNorm
            ? { ativoAte: ativoAteNorm, ativo_ate: ativoAteNorm }
            : {}),
        },
  );
  const proximaCobranca = normalizarDataIsoCobranca(
    empresa.proximaCobranca ?? empresa.proxima_cobranca,
  );
  const base = {
    ...empresa,
    descricao: descricao || undefined,
    plano,
    patrocinado,
    ativo,
    ...(proximaCobranca ? { proximaCobranca } : {}),
  };
  if (ativoAteNorm) {
    base.ativoAte = ativoAteNorm;
  } else if (rawAte === null) {
    base.ativoAte = null;
  } else {
    delete base.ativoAte;
    delete base.ativo_ate;
  }
  return base;
}

function carregarDescricoesStorage() {
  try {
    const bruto = localStorage.getItem(STORAGE_DESCRICOES);
    if (!bruto) return {};
    const mapa = JSON.parse(bruto);
    if (!mapa || typeof mapa !== "object" || Array.isArray(mapa)) {
      return {};
    }
    return mapa;
  } catch (erro) {
    return {};
  }
}

let descricoesCustomizadas = carregarDescricoesStorage();

function salvarDescricoesStorage(mapa) {
  localStorage.setItem(STORAGE_DESCRICOES, JSON.stringify(mapa));
}

function chaveDescricaoEmpresa(nome) {
  return normalizarNomeIgualdade(nome);
}

function obterDescricaoCustomizada(nome) {
  const chave = chaveDescricaoEmpresa(nome);
  let t = String(descricoesCustomizadas[chave] || "").trim();
  if (!t && chave === "samarina marino") {
    t = String(descricoesCustomizadas["samarina gomes marino"] || "").trim();
  }
  if (!t && tituloCorrigidoSamarinaMarino(nome)) {
    t = String(descricoesCustomizadas["samarina gomes marino"] || "").trim();
  }
  return t;
}

function salvarDescricaoCustomizada(nome, descricao) {
  const chave = chaveDescricaoEmpresa(nome);
  if (!chave) return;
  const texto = String(descricao || "").trim();

  if (texto) {
    descricoesCustomizadas[chave] = texto;
  } else {
    delete descricoesCustomizadas[chave];
  }

  salvarDescricoesStorage(descricoesCustomizadas);
}

function carregarEmpresasStorage() {
  try {
    const bruto = localStorage.getItem(STORAGE_EMPRESAS);
    if (!bruto) {
      const iniciais = empresasPadrao.map(normalizarEmpresa);
      localStorage.setItem(STORAGE_EMPRESAS, JSON.stringify(iniciais));
      return iniciais;
    }
    const lista = JSON.parse(bruto);
    if (!Array.isArray(lista)) throw new Error("Formato inválido");
    if (
      lista.length === 0 &&
      Array.isArray(empresasPadrao) &&
      empresasPadrao.length > 0
    ) {
      const iniciais = empresasPadrao.map(normalizarEmpresa);
      localStorage.setItem(STORAGE_EMPRESAS, JSON.stringify(iniciais));
      return iniciais;
    }
    return lista.map(normalizarEmpresa);
  } catch (erro) {
    return empresasPadrao.map(normalizarEmpresa);
  }
}

function salvarEmpresasStorage(lista) {
  localStorage.setItem(STORAGE_EMPRESAS, JSON.stringify(lista));
}

/** Live Server / sem Supabase: localStorage antigo não inclui novidades do JSON demo. */
function unirNovidadesCatalogoDemoNaLista(listaLocal) {
  const base = Array.isArray(listaLocal)
    ? listaLocal.map((e) => ({ ...e }))
    : [];
  const visto = new Set(
    base.map((e) => normalizarTexto(e.nome)).filter(Boolean),
  );
  for (const item of empresasPadrao || []) {
    const k = normalizarTexto(item.nome);
    if (!k || visto.has(k)) continue;
    visto.add(k);
    base.push({ ...item });
  }
  return base;
}

let empresas = [];

function supabaseConfigurado() {
  return Boolean(supabaseClient);
}

function normalizarPalavrasChave(valor) {
  if (Array.isArray(valor)) return valor;
  if (!valor) return [];
  if (typeof valor === "string") {
    return valor
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function mapearEmpresaBanco(registro) {
  const {
    logotipo,
    tiposerv,
    palavras_chave,
    palavrasChave,
    proxima_cobranca,
    ativo_ate,
    instagram,
    site,
    ...rest
  } = registro;
  const ig = String(
    instagram ??
      registro.link_instagram ??
      registro.instagram_url ??
      "",
  ).trim();
  const sitio = String(
    site ?? registro.url_site ?? registro.link_site ?? "",
  ).trim();
  return normalizarEmpresa({
    ...rest,
    logo: registro.logo ?? logotipo ?? "",
    categoria: registro.categoria ?? tiposerv ?? "",
    palavrasChave: normalizarPalavrasChave(
      palavras_chave ?? palavrasChave,
    ),
    proximaCobranca: proxima_cobranca ?? undefined,
    ativoAte: ativo_ate ?? undefined,
    ...(ig ? { instagram: ig } : {}),
    ...(sitio ? { site: sitio } : {}),
  });
}

function mapearEmpresaParaBanco(empresa) {
  const desc = String(empresa.descricao || "").trim();
  const out = {
    nome: empresa.nome,
    logo: empresa.logo,
    tel: empresa.tel,
    categoria: empresa.categoria || null,
    endereco: empresa.endereco || null,
    instagram: empresa.instagram || null,
    site: empresa.site || null,
    plano: empresa.plano,
    patrocinado: Boolean(empresa.patrocinado),
    ativo: empresa.ativo !== false,
    ...(desc ? { descricao: desc } : {}),
  };
  return out;
}

function dadosPontoDeEncontro(extra = {}) {
  return normalizarEmpresa({
    ...extra,
    nome: "Ponto de Encontro",
    logo: "assets/ponto de encontro.jpeg",
    tel: "5516981313518",
    instagram:
      "https://www.instagram.com/pontodeencontro53?utm_source=qr&igsh=cWFiMGxoaTU2M3li",
    endereco:
      "Rod. Mun. Ayrton Senna 1311 Est. Mun. Dr. Fernando de Arruda Botelho 1311, Itirapina, 13530-000, SP, BR",
    categoria: "Alimentação",
    descricao:
      "Lanchonete com entrega e retirada: carvão, gelo, lanches, bebidas, porções, sorvetes, marmitex e pastel.",
    palavrasChave: [
      "ponto de encontro",
      "lanchonete",
      "lanches",
      "bebidas",
      "porcoes",
      "sorvetes",
      "marmitex",
      "pastel",
      "carvao",
      "gelo",
      "entrega",
      "retirada",
    ],
    plano: "vip",
    patrocinado: true,
  });
}

function aplicarAjustesEmpresas(lista, opts = {}) {
  const permitirCatalogoLocal =
    !supabaseConfigurado() || opts.catalogoLocal === true;
  const nomesForcarVip = new Set([
    "fl conecta",
    "julia corretora",
    "gordo lanches",
    "lolana lavanderia",
    "ec escavacoes",
    "iara ponfilio",
    "pao de queijo do beto",
    "dona lena",
    "rotisseria arte do sabor",
    "buffet em casa gourmet",
    "samarina marino",
    "samarina gomes marino",
    "ponto de encontro",
  ]);
  const base = (lista || []).map((empresa) => {
      const nome = normalizarTexto(empresa.nome);
      const logo = normalizarTexto(empresa.logo);
      const pontoEncontro =
        nome === "ponto de encontro" ||
        nome === "ponto de encontro.jpeg" ||
        nome === "ponto de encontro.jpg" ||
        logo === "assets/ponto de encontro.jpeg" ||
        logo === "assets/ponto de encontro.jpg";
      if (pontoEncontro) {
        return dadosPontoDeEncontro(empresa);
      }
      if (
        nome === "lolana lavanderia" &&
        !String(empresa.endereco || "").trim()
      ) {
        return {
          ...empresa,
          endereco: "Rua Cinco n°752 Vila Garbi (esquina com Av. 6)",
        };
      }
      if (nome === "fl conecta") {
        const siteOficial = "https://flconectadigital.com.br/";
        return {
          ...empresa,
          categoria: "Marketing",
          site: String(empresa.site || "").trim() || siteOficial,
        };
      }
      if (
        nome === "rotisseria arte do sabor" &&
        !String(empresa.endereco || "").trim()
      ) {
        return {
          ...empresa,
          endereco: "Rua 2 nº 409 - Centro, Itirapina - SP",
        };
      }
      if (
        nome === "gordo lanches" &&
        !String(empresa.funcionamento || "").trim()
      ) {
        return {
          ...empresa,
          funcionamento: "Quarta a domingo, das 18:30 às 22:40",
        };
      }
      if (nome === "pao de queijo do beto") {
        return {
          ...empresa,
          instagram: "https://www.instagram.com/paodequeijodobeto/",
        };
      }
      return empresa;
    })
    .map((empresa) =>
      nomesForcarVip.has(normalizarTexto(empresa.nome))
        ? normalizarEmpresa({
            ...empresa,
            plano: "vip",
            patrocinado: true,
          })
        : empresa,
    )
    .map((empresa) => {
      const nome = normalizarTexto(empresa.nome);
      const claudioMontador =
        nome === "claudio montador" ||
        nome === "claudio montador de moveis" ||
        (nome.includes("claudio") && nome.includes("montador"));
      if (claudioMontador) {
        return normalizarEmpresa({
          ...empresa,
          plano: "basico",
          patrocinado: false,
        });
      }
      return empresa;
    });

  const existeValdecir = base.some(
    (empresa) => normalizarTexto(empresa.nome) === "valdecir alves",
  );
  const existeLimpGel = base.some(
    (empresa) => normalizarTexto(empresa.nome) === "limp gel",
  );

  if (permitirCatalogoLocal && !existeValdecir) {
    base.unshift(
      normalizarEmpresa({
        nome: "Valdecir Alves",
        logo: "assets/valdecir.jpeg",
        tel: "5519999474489",
        categoria: "Uber",
        plano: "basico",
        palavrasChave: ["uber", "motorista", "particular", "corridas"],
      }),
    );
  }

  if (permitirCatalogoLocal && !existeLimpGel) {
    base.unshift(
      normalizarEmpresa({
        nome: "Limp Gel",
        logo: "assets/limpgel.jpeg",
        tel: "5519997216659",
        categoria: "Serviços",
        plano: "basico",
        palavrasChave: ["servicos", "limpeza", "limp gel"],
      }),
    );
  }

  const existeAlves = base.some(
    (empresa) =>
      normalizarTexto(empresa.nome) === "deposito de bebida alves",
  );
  const existeGordo = base.some(
    (empresa) => normalizarTexto(empresa.nome) === "gordo lanches",
  );

  if (permitirCatalogoLocal && !existeAlves) {
    base.push(
      normalizarEmpresa({
        nome: "Depósito de Bebida Alves",
        logo: "assets/deposito.jpeg",
        tel: "5519996662084",
        categoria: "Bebidas",
        palavrasChave: [
          "deposito",
          "bebidas",
          "cerveja",
          "agua",
          "refrigerante",
        ],
      }),
    );
  }

  if (permitirCatalogoLocal && !existeGordo) {
    base.push(
      normalizarEmpresa({
        nome: "Gordo Lanches",
        logo: "assets/gordo.jpeg",
        tel: "5519997913079",
        endereco:
          "Av. Perimetral, 721 - Jardim Nova Itirapina, Itirapina",
        instagram: "https://instagram.com/gordolanchesitirapina",
        categoria: "Alimentação",
        funcionamento: "Quarta a domingo, das 18:30 às 22:40",
        palavrasChave: ["lanches", "hamburguer", "lanche", "gordo"],
        plano: "vip",
        patrocinado: true,
      }),
    );
  }

  const extrasObrigatorios = [
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
      palavrasChave: [
        "natura",
        "avon",
        "beleza",
        "consultora",
        "cosmeticos",
        "perfumaria",
        "samarina",
        "marino",
        "gomes",
      ],
      plano: "vip",
      patrocinado: true,
    },
    {
      nome: "EC Escavações",
      logo: "assets/escavacoes.jpeg",
      tel: "5519998174773",
      categoria: "Construção",
      plano: "vip",
      patrocinado: true,
      palavrasChave: [
        "escavacoes",
        "piscinas",
        "alicerces",
        "terraplenagem",
      ],
    },
    {
      nome: "Gu Espetaria e Choperia",
      logo: "assets/espetaria.jpeg",
      tel: "5519996150744",
      categoria: "Alimentação",
      plano: "basico",
      palavrasChave: ["espetaria", "choperia", "petiscos", "eventos"],
    },
    {
      nome: "Iara Ponfilio",
      logo: "assets/iara-sexshop.png",
      tel: "5519998040555",
      site: "https://loja.menu/ipsexshop",
      categoria: "Sex Shop / Vendas Online",
      descricao: "Sex shop e vendas online com atendimento direto pelo WhatsApp.",
      plano: "vip",
      patrocinado: true,
      palavrasChave: [
        "iara",
        "ponfilio",
        "sex shop",
        "vendas online",
        "loja online",
        "produtos adultos",
      ],
    },
    {
      nome: "Rotisseria Arte do Sabor",
      site: "https://deliveryapp.neemo.com.br/pedir/14398/PfvWHwxooksbqcqEFH9g",
      plano: "vip",
      patrocinado: true,
    },
    {
      nome: "Ponto de Encontro",
      logo: "assets/ponto de encontro.jpeg",
      tel: "5516981313518",
      instagram:
        "https://www.instagram.com/pontodeencontro53?utm_source=qr&igsh=cWFiMGxoaTU2M3li",
      endereco:
        "Rod. Mun. Ayrton Senna 1311 Est. Mun. Dr. Fernando de Arruda Botelho 1311, Itirapina, 13530-000, SP, BR",
      categoria: "Alimentação",
      descricao:
        "Lanchonete com entrega e retirada: carvão, gelo, lanches, bebidas, porções, sorvetes, marmitex e pastel.",
      palavrasChave: [
        "ponto de encontro",
        "lanchonete",
        "lanches",
        "bebidas",
        "porcoes",
        "sorvetes",
        "marmitex",
        "pastel",
        "carvao",
        "gelo",
        "entrega",
        "retirada",
      ],
      plano: "vip",
      patrocinado: true,
    },
  ];

  extrasObrigatorios.forEach((extra) => {
    const chEx = chaveFusaoNegocio(extra);
    const i = base.findIndex(
      (empresa) => chaveFusaoNegocio(empresa) === chEx,
    );
    const ex = normalizarEmpresa(extra);
    if (i === -1) {
      if (permitirCatalogoLocal) {
        base.push(ex);
      }
    } else {
      const patch = {};
      const d = String(ex.descricao || "").trim();
      const L = String(ex.logo || "").trim();
      const ig = String(ex.instagram || "").trim();
      const st = String(ex.site || "").trim();
      if (d) patch.descricao = d;
      if (L) patch.logo = L;
      if (ig) patch.instagram = ig;
      if (st) patch.site = st;
      if (Object.keys(patch).length) {
        base[i] = normalizarEmpresa({ ...base[i], ...patch });
      }
    }
  });

  return removerEmpresasDuplicadasPorNome(
    fundirListaEmpresasMesmoNegocio(base),
  );
}

function removerEmpresasDuplicadasPorNome(lista) {
  const grupos = new Map();
  const semNome = [];
  for (const empresa of lista || []) {
    const k = normalizarTexto(empresa.nome);
    if (!k) {
      semNome.push(empresa);
      continue;
    }
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(empresa);
  }
  const saida = [...semNome];
  grupos.forEach((arr) => {
    if (arr.length === 1) {
      saida.push(arr[0]);
      return;
    }
    arr.sort((a, b) => {
      const atA = empresaAtivaNoPortal(a) ? 1 : 0;
      const atB = empresaAtivaNoPortal(b) ? 1 : 0;
      if (atA !== atB) return atB - atA;
      const vA = a.plano === "vip" ? 1 : 0;
      const vB = b.plano === "vip" ? 1 : 0;
      if (vA !== vB) return vB - vA;
      return (
        String(b.descricao || "").length - String(a.descricao || "").length
      );
    });
    saida.push(arr[0]);
  });
  return saida;
}

function obterDescricaoServico(empresa) {
  const nome = normalizarTexto(empresa.nome);
  const descricaoCustomizada = obterDescricaoCustomizada(empresa.nome);
  if (
    descricaoCustomizada &&
    !textoPareceArquivoImagem(descricaoCustomizada)
  ) {
    return descricaoCustomizada;
  }

  const descricao = String(empresa.descricao || "").trim();
  if (descricao && !textoPareceArquivoImagem(descricao)) {
    return descricao;
  }

  const descricoesPorNome = {
    "fl conecta":
      "Estratégias de marketing digital e social media para fortalecer sua marca.",
    "julia corretora":
      "Consultoria em seguros para proteger sua família, patrimônio e negócio.",
    "clinica bem viver":
      "A sua saúde em boas mãos com atendimento humanizado e dedicado.",
    "multilar variedades":
      "Produtos de limpeza, utilidades domésticas, material escolar, brinquedos e eletrônicos.",
    "rotisseria arte do sabor":
      "Refeições e marmitas com sabor caseiro para facilitar seu dia a dia.",
    "ponto de encontro":
      "Lanchonete com entrega e retirada: carvão, gelo, lanches, bebidas, porções, sorvetes, marmitex e pastel.",
    "gordo lanches":
      "Lanches artesanais caprichados para matar a fome com muito sabor.",
    "deposito de bebida alves":
      "Bebidas geladas para seu dia a dia, churrasco e confraternizações.",
    "lolana lavanderia":
      "Lavanderia prática e cuidadosa para roupas limpas e bem tratadas.",
    "margem zero grafica":
      "Impressos e materiais gráficos com qualidade para sua divulgação.",
    "criando sonhos":
      "Decoração e produção para transformar seu evento em momento especial.",
    apib: "Associação local com apoio à comunidade e ações de integração.",
    "vitale croche":
      "Peças em crochê feitas à mão com carinho, estilo e exclusividade.",
    "sempre bella":
      "Perfumaria e cosméticos para realçar sua beleza todos os dias.",
    "samarina marino":
      "Consultora de Beleza Natura e Avon — atendimento e pedidos com praticidade.",
    "samarina gomes marino":
      "Consultora de Beleza Natura e Avon — atendimento e pedidos com praticidade.",
    "cheiro de amor":
      "Fragrâncias e cosméticos para presentear e se cuidar com charme.",
    "sorvete americano":
      "O sabor da infância na sua festa, com alegria para todas as idades.",
    "limp gel":
      "Limpeza profissional de pisos e pedras para renovar seus ambientes.",
    "impulsiona veiculos":
      "Compra, venda e oportunidades em veículos com atendimento de confiança.",
    "valdecir alves":
      "Motorista particular com corridas seguras, pontuais e confortáveis.",
    "ec escavacoes":
      "Serviços de escavações, abertura de piscinas e execução de alicerces.",
    "gu espetaria e choperia":
      "Espetaria e choperia para encontros, festas e eventos em geral.",
    "buffet em casa gourmet":
      "Levamos o buffet completo até você! 🏠 Cardápios Gourmet | Garçons | Logística Completa\n🎉 Casamentos, Aniversários e Eventos Corporativos",
    "pao de queijo do beto":
      "Pão de queijo artesanal, quentinho e cheio de sabor — encomendas e retirada na região.",
    "dona lena":
      "Sabão artesanal multiuso para louça, roupas e limpeza geral — receita tradicional desde 1992, alto rendimento, econômico e durável.",
    "iara ponfilio":
      "Sex shop e vendas online com atendimento direto pelo WhatsApp.",
  };

  const descricaoNome = descricoesPorNome[nome];
  if (descricaoNome) return descricaoNome;

  if (empresa.categoria === "Uber") {
    return "Transporte particular com foco em pontualidade e segurança.";
  }

  if (empresa.categoria === "Alimentação") {
    return "Opções de alimentação para o dia a dia e eventos locais.";
  }

  if (empresa.categoria === "Eventos") {
    return "Soluções completas para eventos sociais e corporativos.";
  }

  if (empresa.categoria === "Serviços") {
    return "Atendimento de serviços gerais com suporte local em Itirapina.";
  }

  return "Atendimento local com qualidade e suporte para o que você precisa.";
}

function iniciarContadorVisitas() {
  const alvo = document.getElementById("contadorVisitas");
  if (!alvo) return;
  let total = Number(localStorage.getItem(STORAGE_VISITAS));
  if (!Number.isFinite(total) || total < 527) {
    total = 527;
  }
  total += 1;
  localStorage.setItem(STORAGE_VISITAS, String(total));
  alvo.textContent = `${total} visitas`;
}



function ordenarEmpresasComoConsultaBanco(lista) {
  return [...(lista || [])].sort((a, b) => {
    const pa = a.patrocinado ? 1 : 0;
    const pb = b.patrocinado ? 1 : 0;
    if (pb !== pa) return pb - pa;
    return String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR", {
      sensitivity: "base",
    });
  });
}

async function carregarEmpresasBanco() {
  const { data, error } = await supabaseClient
    .from(SUPABASE_TABLE)
    .select("*")
    .order("patrocinado", { ascending: false })
    .order("nome", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapearEmpresaBanco);
}

async function carregarEmpresasDoPortalComCatalogo() {
  const doBanco = await carregarEmpresasBanco();
  const cfg = window.PORTAL_CONFIG || {};
  if (cfg.applyDefaultCatalog === false) {
    return doBanco;
  }
  await carregarEmpresasPadraoJson();
  const ativosBanco = doBanco.filter((e) => empresaAtivaNoPortal(e));
  const inativosBanco = doBanco.filter((e) => !empresaAtivaNoPortal(e));
  const nomesComAtivoNoBanco = new Set(
    ativosBanco.map((e) => normalizarTexto(e.nome)).filter(Boolean),
  );
  const extras = [];
  for (const item of empresasPadrao || []) {
    const k = normalizarTexto(item.nome);
    if (!k || nomesComAtivoNoBanco.has(k)) continue;
    nomesComAtivoNoBanco.add(k);
    extras.push(normalizarEmpresa({ ...item }));
  }
  const nomesResgatadosPeloDemo = new Set(
    extras.map((e) => normalizarTexto(e.nome)).filter(Boolean),
  );
  const inativosSemFallbackDemo = inativosBanco.filter(
    (e) => !nomesResgatadosPeloDemo.has(normalizarTexto(e.nome)),
  );
  return ordenarEmpresasComoConsultaBanco([
    ...ativosBanco,
    ...extras,
    ...inativosSemFallbackDemo,
  ]);
}

function colunaAusenteSupabase(erro) {
  const msg = mensagemErroSupabase(erro);
  if (!/column|schema cache|does not exist|could not find/i.test(msg)) {
    return "";
  }
  const match =
    msg.match(/'([a-zA-Z0-9_]+)' column/i) ||
    msg.match(/column "([a-zA-Z0-9_]+)"/i) ||
    msg.match(/column ([a-zA-Z0-9_]+) of relation/i);
  return match ? match[1] : "";
}

async function atualizarOuInserirEmpresaBanco(payload, nomeTrim) {
  const { data: atualizados, error: erroUpdate } = await supabaseClient
    .from(SUPABASE_TABLE)
    .update(payload)
    .ilike("nome", nomeTrim)
    .select("nome");
  if (erroUpdate) throw erroUpdate;
  if (atualizados && atualizados.length) return "updated";

  const { error: erroInsert } = await supabaseClient
    .from(SUPABASE_TABLE)
    .insert(payload);
  if (erroInsert) throw erroInsert;
  return "created";
}

async function inserirEmpresaBanco(empresa) {
  const payload = mapearEmpresaParaBanco(empresa);
  const nomeTrim = String(empresa.nome || "").trim();
  const opcionaisCompatibilidade = new Set([
    "descricao",
    "instagram",
    "site",
  ]);

  for (let tentativa = 0; tentativa < 8; tentativa += 1) {
    try {
      return await atualizarOuInserirEmpresaBanco(payload, nomeTrim);
    } catch (erro) {
      const coluna = colunaAusenteSupabase(erro);
      if (coluna === "logo" && "logo" in payload) {
        payload.logotipo = payload.logo;
        delete payload.logo;
        continue;
      }
      if (coluna === "categoria" && "categoria" in payload) {
        payload.tiposerv = payload.categoria;
        delete payload.categoria;
        continue;
      }
      if (coluna && opcionaisCompatibilidade.has(coluna) && coluna in payload) {
        delete payload[coluna];
        continue;
      }
      throw erro;
    }
  }

  return atualizarOuInserirEmpresaBanco(payload, nomeTrim);
}

async function definirAtivoClienteNoBanco(nome, ativo) {
  const nomeTrim = String(nome || "").trim();
  if (!nomeTrim) {
    throw new Error("Informe o nome do cliente.");
  }
  if (supabaseConfigurado()) {
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLE)
      .update({ ativo })
      .ilike("nome", nomeTrim)
      .select("nome");
    if (error) throw error;
    if (!data || !data.length) {
      throw new Error(
        "Nenhum registro com esse nome exato. Confira maiúsculas, acentos e espaços.",
      );
    }
    return;
  }
  const chave = normalizarTexto(nomeTrim);
  const idx = empresas.findIndex(
    (e) => normalizarTexto(e.nome) === chave,
  );
  if (idx < 0) {
    throw new Error("Cliente não encontrado no armazenamento local.");
  }
  empresas[idx] = normalizarEmpresa({ ...empresas[idx], ativo });
  salvarEmpresasStorage(empresas);
}

async function excluirClienteDoBanco(nome) {
  const nomeTrim = String(nome || "").trim();
  if (!nomeTrim) {
    throw new Error("Informe o nome do cliente para excluir.");
  }
  if (supabaseConfigurado()) {
    const { data, error } = await supabaseClient
      .from(SUPABASE_TABLE)
      .delete()
      .ilike("nome", nomeTrim)
      .select("nome");
    if (error) throw error;
    if (!data || !data.length) {
      throw new Error("Nenhum registro encontrado com esse nome.");
    }
    return;
  }
  const chave = normalizarTexto(nomeTrim);
  const antes = empresas.length;
  empresas = empresas.filter((e) => normalizarTexto(e.nome) !== chave);
  if (empresas.length === antes) {
    throw new Error("Cliente não encontrado no armazenamento local.");
  }
  salvarEmpresasStorage(empresas);
}

function atualizarDatalistNomesAdmin() {
  const dl = document.getElementById("adminListaEmpresas");
  if (!dl) return;
  dl.innerHTML = "";
  for (const e of empresas || []) {
    const op = document.createElement("option");
    op.value = e.nome;
    dl.appendChild(op);
  }
  renderizarControleStatusAdmin();
}

function renderizarControleStatusAdmin() {
  const lista = document.getElementById("adminStatusLista");
  const busca = document.getElementById("adminStatusBusca");
  const resumo = document.getElementById("adminStatusResumo");
  if (!lista) return;
  const termo = normalizarTexto(busca ? busca.value : "");
  const todas = [...(empresas || [])];
  const totalAtivos = todas.filter(empresaAtivaNoPortal).length;
  const totalInativos = todas.length - totalAtivos;
  if (resumo) {
    resumo.textContent = `${totalAtivos} ativos • ${totalInativos} inativos`;
  }
  const ordenadas = todas
    .filter((empresa) => {
      if (!termo) return true;
      return (
        normalizarTexto(empresa.nome).includes(termo) ||
        normalizarTexto(empresa.categoria).includes(termo) ||
        normalizarTelefone(empresa.tel).includes(normalizarTelefone(termo))
      );
    })
    .sort((a, b) =>
    String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR", {
      sensitivity: "base",
    }),
  );
  if (!ordenadas.length) {
    lista.innerHTML =
      '<div class="admin-status-item"><div class="admin-status-nome"><strong>Nenhuma empresa encontrada</strong><span>Atualize a lista ou mude a busca.</span></div></div>';
    return;
  }
  lista.innerHTML = ordenadas
    .map((empresa) => {
      const ativa = empresaAtivaNoPortal(empresa);
      const nome = escaparHtml(empresa.nome || "");
      const categoria = escaparHtml(empresa.categoria || "Sem categoria");
      return `<div class="admin-status-item">
  <div class="admin-status-nome">
    <strong>${nome}<span class="admin-status-badge ${ativa ? "ativo" : "inativo"}">${ativa ? "Ativo" : "Inativo"}</span></strong>
    <span>${categoria}</span>
  </div>
  <div class="admin-status-acoes">
    <button type="button" class="admin-status-editar" data-admin-edit-nome="${nome}">Editar</button>
    <button type="button" class="admin-status-toggle ${ativa ? "desativar" : "ativar"}" data-admin-status-nome="${nome}" data-admin-status-ativo="${ativa ? "false" : "true"}">
      ${ativa ? "Pausar" : "Ativar"}
    </button>
  </div>
</div>`;
    })
    .join("");
}

function empresasComRenovacaoProxima(dias) {
  const janela = Number(dias) > 0 ? Number(dias) : 14;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = new Date(hoje);
  limite.setDate(limite.getDate() + janela);
  return (empresas || [])
    .filter((e) => {
      const d = normalizarDataIsoCobranca(e.proximaCobranca);
      if (!d) return false;
      const dt = new Date(`${d}T12:00:00`);
      return dt >= hoje && dt <= limite;
    })
    .sort((a, b) =>
      String(a.proximaCobranca).localeCompare(String(b.proximaCobranca)),
    );
}

function textoRenovacaoWhatsApp(nome, dataFmt) {
  return `Olá ${nome}! A assinatura do anúncio no Portal Itirapina e Broa está próxima do vencimento (${dataFmt}). Podemos renovar? Qualquer dúvida, falo por aqui.`;
}

function renderizarLembretesRenovacao() {
  const box = document.getElementById("adminLembretesLista");
  const vazio = document.getElementById("adminLembretesVazio");
  if (!box) return;
  const lista = empresasComRenovacaoProxima(14);
  box.innerHTML = "";
  if (vazio) {
    vazio.style.display = lista.length ? "none" : "block";
  }
  for (const e of lista) {
    const dIso = normalizarDataIsoCobranca(e.proximaCobranca);
    const dt = new Date(`${dIso}T12:00:00`);
    const dataFmt = dt.toLocaleDateString("pt-BR");
    const telWa = telefoneInternacionalBr(e.tel);
    const ok = telefoneValido(e.tel);
    const msg = mensagemWhatsAppRenovacao(e.nome, dataFmt);
    const href = ok
      ? `https://wa.me/${telWa}?text=${encodeURIComponent(msg)}`
      : "#";
    const linha = document.createElement("div");
    linha.className = "admin-lembrete-linha";
    const nomeS = escaparHtml(e.nome);
    linha.innerHTML = `
<span class="admin-lembrete-info"><strong>${nomeS}</strong> — vence em <strong>${dataFmt}</strong></span>
<a class="admin-btn-wa ${ok ? "" : "is-disabled"}" href="${href}" ${ok ? 'target="_blank" rel="noopener noreferrer"' : ""}>WhatsApp renovação</a>`;
    box.appendChild(linha);
  }
}

async function definirProximaCobrancaNoBanco(nome, dataIso) {
  const nomeTrim = String(nome || "").trim();
  const data = normalizarDataIsoCobranca(dataIso);
  if (!nomeTrim) {
    throw new Error("Informe o nome do cliente.");
  }
  if (!data) {
    throw new Error("Informe uma data válida.");
  }
  if (supabaseConfigurado()) {
    const { data: rows, error } = await supabaseClient
      .from(SUPABASE_TABLE)
      .update({ proxima_cobranca: data })
      .eq("nome", nomeTrim)
      .select("nome");
    if (error) throw error;
    if (!rows || !rows.length) {
      throw new Error(
        "Nenhum registro com esse nome exato. Confira maiúsculas e acentos.",
      );
    }
    return;
  }
  const chave = normalizarTexto(nomeTrim);
  const idx = empresas.findIndex(
    (item) => normalizarTexto(item.nome) === chave,
  );
  if (idx < 0) {
    throw new Error("Cliente não encontrado no armazenamento local.");
  }
  empresas[idx] = normalizarEmpresa({
    ...empresas[idx],
    proximaCobranca: data,
  });
  salvarEmpresasStorage(empresas);
}

function mensagemErroSupabase(erro) {
  if (!erro) return "Falha de conexão com o banco.";
  if (typeof erro === "string") return erro;
  if (erro.message) return erro.message;
  return "Falha de conexão com o banco.";
}

function exibirErroConexaoBanco(erro) {
  const msg = mensagemErroSupabase(erro);
  const estadoVazio = document.getElementById("estadoVazio");
  if (estadoVazio) {
    estadoVazio.textContent = `Sem conexão com Supabase: ${msg}`;
    estadoVazio.style.display = "block";
  }
}

async function montarListaSomenteDemoComAjustes() {
  await carregarEmpresasPadraoJson();
  const raw = empresasPadrao || [];
  if (!raw.length) return [];
  return aplicarAjustesEmpresas(
    ordenarEmpresasComoConsultaBanco(raw.map((item) => normalizarEmpresa({ ...item }))),
    { catalogoLocal: true },
  );
}

async function inicializarEmpresas() {
  if (supabaseConfigurado()) {
    const cfg = window.PORTAL_CONFIG || {};
    try {
      empresas = aplicarAjustesEmpresas(
        await carregarEmpresasDoPortalComCatalogo(),
      );
      if (
        cfg.applyDefaultCatalog !== false &&
        empresasAtivasNoPortal(empresas).length === 0
      ) {
        const fallback = await montarListaSomenteDemoComAjustes();
        if (empresasAtivasNoPortal(fallback).length > 0) {
          empresas = fallback;
        }
      }
      const estadoVazio = document.getElementById("estadoVazio");
      if (estadoVazio && empresasAtivasNoPortal(empresas).length > 0) {
        estadoVazio.textContent = "Nenhuma empresa encontrada.";
      }
      carregar(empresasAtivasNoPortal(empresas));
      criarEscada();
      atualizarDatalistNomesAdmin();
      return;
    } catch (erro) {
      console.error("Falha ao carregar empresas do Supabase:", erro);
      let recuperou = false;
      if (cfg.applyDefaultCatalog !== false) {
        const fallback = await montarListaSomenteDemoComAjustes();
        if (empresasAtivasNoPortal(fallback).length > 0) {
          empresas = fallback;
          recuperou = true;
        }
      }
      if (!recuperou) {
        empresas = [];
        exibirErroConexaoBanco(erro);
      } else {
        const estadoVazio = document.getElementById("estadoVazio");
        if (estadoVazio) {
          estadoVazio.textContent = "Nenhuma empresa encontrada.";
        }
        console.warn(
          "[portal] Supabase indisponível ou com erro; exibindo catálogo demo até o banco voltar.",
        );
      }
      carregar(empresasAtivasNoPortal(empresas));
      criarEscada();
      atualizarDatalistNomesAdmin();
      return;
    }
  }

  await carregarEmpresasPadraoJson();
  empresas = aplicarAjustesEmpresas(
    unirNovidadesCatalogoDemoNaLista(carregarEmpresasStorage()),
  );
  const cfgLocal = window.PORTAL_CONFIG || {};
  if (
    cfgLocal.applyDefaultCatalog !== false &&
    empresasAtivasNoPortal(empresas).length === 0
  ) {
    const fallbackLocal = await montarListaSomenteDemoComAjustes();
    if (empresasAtivasNoPortal(fallbackLocal).length > 0) {
      empresas = fallbackLocal;
    }
  }
  salvarEmpresasStorage(empresas);
  const estadoVazioL = document.getElementById("estadoVazio");
  if (estadoVazioL && empresasAtivasNoPortal(empresas).length > 0) {
    estadoVazioL.textContent = "Nenhuma empresa encontrada.";
  }
  carregar(empresasAtivasNoPortal(empresas));
  criarEscada();
  atualizarDatalistNomesAdmin();
}



const NOME_CANONICO_FUSAO = {
  __ec_escavacoes__: "EC Escavações",
  __multilar__: "MULTLar VARIEDADES",
  __fl_conecta__: "FL Conecta",
};

function logoArquivoConectaFl(empresa) {
  return String(empresa.logo || "")
    .trim()
    .toLowerCase()
    .includes("conecta.jpeg");
}

/** Agrupa EC/Emilio (mesmo telefone), variações MULTLar e card legado "Exemplo Local" + logo FL. */
function chaveFusaoNegocio(empresa) {
  const nome = normalizarTexto(empresa.nome);
  const tel = normalizarTelefone(empresa.tel);
  if (!nome && !tel) return "";
  if (nome === "fl conecta") return "__fl_conecta__";
  if (
    nome === "exemplo local" &&
    (logoArquivoConectaFl(empresa) || tel === "5511999999999")
  ) {
    return "__fl_conecta__";
  }
  if (tel === "5519998174773") return "__ec_escavacoes__";
  if (
    nome.includes("emilio campos") &&
    (nome.includes("escava") || nome.includes("escavacao"))
  ) {
    return "__ec_escavacoes__";
  }
  if (nome === "ec escavacoes" || nome.startsWith("ec escava")) {
    return "__ec_escavacoes__";
  }
  const compacto = nome.replace(/\s+/g, "");
  if (
    compacto.includes("multlar") ||
    nome.includes("multi lar") ||
    nome.includes("multilar")
  ) {
    return "__multilar__";
  }
  return nome;
}

function fundirParEmpresasFusao(a, b, chaveFusao) {
  const canon = NOME_CANONICO_FUSAO[chaveFusao];
  const temPausaExplicita =
    a.ativo === false ||
    a.ativo === 0 ||
    a.ativo === "0" ||
    String(a.ativo).toLowerCase() === "false" ||
    b.ativo === false ||
    b.ativo === 0 ||
    b.ativo === "0" ||
    String(b.ativo).toLowerCase() === "false";
  const ativo = temPausaExplicita
    ? false
    : empresaAtivaNoPortal(a) || empresaAtivaNoPortal(b);
  const telA = normalizarTelefone(a.tel);
  const telB = normalizarTelefone(b.tel);
  const tel =
    telA.length >= 12
      ? a.tel
      : telB.length >= 12
        ? b.tel
        : a.tel || b.tel;
  const plano =
    a.plano === "vip" || b.plano === "vip"
      ? "vip"
      : a.plano === "standard" || b.plano === "standard"
        ? "standard"
        : a.plano || b.plano;
  const logo =
    String(a.logo || "").trim() || String(b.logo || "").trim();
  return normalizarEmpresa({
    ...b,
    ...a,
    nome: canon || a.nome || b.nome,
    tel,
    logo,
    ativo,
    plano,
    endereco: String(a.endereco || "").trim() || b.endereco,
    instagram: String(a.instagram || "").trim() || b.instagram,
    site: String(a.site || "").trim() || b.site,
    descricao:
      String(a.descricao || "").trim() || String(b.descricao || "").trim(),
  });
}

function fundirListaEmpresasMesmoNegocio(lista) {
  const mapa = new Map();
  const semChave = [];
  for (const e of lista || []) {
    const k = chaveFusaoNegocio(e);
    if (!k) {
      semChave.push(e);
      continue;
    }
    const cur = mapa.get(k);
    if (!cur) mapa.set(k, e);
    else mapa.set(k, fundirParEmpresasFusao(cur, e, k));
  }
  return [...mapa.values(), ...semChave];
}



const LOGO_LOCAL_POR_NOME = {
  "fl conecta": "assets/conecta.jpeg",
  "julia corretora": "assets/julia.jpeg",
  "clinica bem viver": "assets/clinica.jpeg",
  "claudio montador": "assets/claudio.png",
  "claudio montador de moveis": "assets/claudio.png",
  "multilar variedades": "assets/multilar-logo.jpeg",
  "samarina marino": "assets/samarina.png",
  "samarina gomes marino": "assets/samarina.png",
  "rotisseria arte do sabor": "assets/rotisseria.png",
  "ponto de encontro": "assets/ponto de encontro.jpeg",
  "gordo lanches": "assets/gordo.jpeg",
  "deposito de bebida alves": "assets/deposito.jpeg",
  "lolana lavanderia": "assets/lolana.jpeg",
  "margem zero grafica": "assets/grafica.jpeg",
  "criando sonhos": "assets/criando-sonhos.jpeg",
  apib: "assets/apib.jpeg",
  "vitale croche": "assets/vitale.jpeg",
  "sempre bella": "assets/sempre-bela.jpeg",
  "cheiro de amor": "assets/cheiro-de-amor.jpeg",
  "sorvete americano": "assets/sorvete.jpeg",
  "limp gel": "assets/limpgel.jpeg",
  "impulsiona veiculos": "assets/impulsiona.jpeg",
  "valdecir alves": "assets/valdecir.jpeg",
  "ec escavacoes": "assets/escavacoes.jpeg",
  "emilio campos escavacoes": "assets/escavacoes.jpeg",
  "gu espetaria e choperia": "assets/espetaria.jpeg",
  "gu espetaria & choperia": "assets/espetaria.jpeg",
  "espetaria do gu": "assets/espetaria.jpeg",
  "espetaria & choperia do gu": "assets/espetaria.jpeg",
  "espetaria e choperia do gu": "assets/espetaria.jpeg",
  "buffet em casa gourmet": "assets/buffet.jpeg",
  "buffet em casa": "assets/buffet.jpeg",
  "pao de queijo do beto": "assets/beto.png",
  "dona lena": "assets/dona-lena.png",
  "emilio campos": "assets/escavacoes.jpeg",
  "iara ponfilio": "assets/iara-sexshop.png",
  "cantinho da fe": "assets/cantinho.jpeg",
};

function logoUrlEmpresa(empresa) {
  const logo = String(empresa.logo || "").trim();
  if (logo.startsWith("data:image/")) return logo;

  const chaveNome = normalizarTexto(empresa.nome);
  if (chaveNome && LOGO_LOCAL_POR_NOME[chaveNome]) {
    return urlLogoComVersao(LOGO_LOCAL_POR_NOME[chaveNome]);
  }

  const externo = urlHttpSegura(logo);
  if (externo) return externo;

  return logoSegura(logo);
}

function urlLogoComVersao(caminho) {
  const url = urlLogoPublico(caminho);
  if (!url || url.startsWith("data:")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=arte-real-2`;
}

function iniciaisEmpresa(nome) {
  const partes = String(nome || "Portal")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const iniciais = partes
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
  return iniciais || "P";
}

function logoFallbackSvg(nome) {
  const nomeSeguro = escaparHtml(String(nome || "Portal"));
  const iniciais = escaparHtml(iniciaisEmpresa(nome));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img" aria-label="${nomeSeguro}">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#123d3d"/>
    <stop offset="52%" stop-color="#0b2428"/>
    <stop offset="100%" stop-color="#041316"/>
  </linearGradient>
  <radialGradient id="r" cx="35%" cy="20%" r="70%">
    <stop offset="0%" stop-color="#2ce69f" stop-opacity=".36"/>
    <stop offset="100%" stop-color="#2ce69f" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="320" height="320" rx="58" fill="url(#g)"/>
<rect width="320" height="320" rx="58" fill="url(#r)"/>
<rect x="18" y="18" width="284" height="284" rx="48" fill="none" stroke="#ffd166" stroke-opacity=".42" stroke-width="4"/>
<text x="160" y="178" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="92" font-weight="800" fill="#ecf7f4">${iniciais}</text>
<text x="160" y="224" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#ffd166">Portal</text>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function aplicarLogoFallback(img) {
  if (!img) return;
  img.onerror = null;
  const nome = img.getAttribute("data-logo-nome") || "Portal";
  img.src = logoFallbackSvg(nome);
}

function arquivoParaDataUrl(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = () => reject(new Error("Falha ao ler arquivo"));
    leitor.readAsDataURL(arquivo);
  });
}

function nomeArquivoSeguroLogo(nome, arquivo) {
  const base =
    normalizarTexto(nome)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cliente";
  const tipo = String(arquivo && arquivo.type ? arquivo.type : "").toLowerCase();
  const nomeOriginal = String(arquivo && arquivo.name ? arquivo.name : "");
  const extOriginal = (nomeOriginal.match(/\.(jpe?g|png|webp|gif)$/i) || [])[1];
  const ext =
    (tipo.includes("png") && "png") ||
    (tipo.includes("webp") && "webp") ||
    (tipo.includes("gif") && "gif") ||
    (extOriginal ? extOriginal.toLowerCase().replace("jpeg", "jpg") : "jpg");
  return `clientes/${base}-${Date.now()}.${ext}`;
}

async function prepararLogoParaUpload(arquivo) {
  if (!arquivo || !String(arquivo.type || "").startsWith("image/")) {
    throw new Error("Arquivo de imagem inválido.");
  }
  if (!window.createImageBitmap) return arquivo;

  const bitmap = await createImageBitmap(arquivo);
  const limite = 720;
  const escala = Math.min(1, limite / Math.max(bitmap.width, bitmap.height));
  const largura = Math.max(1, Math.round(bitmap.width * escala));
  const altura = Math.max(1, Math.round(bitmap.height * escala));
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  if (bitmap.close) bitmap.close();

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(arquivo);
          return;
        }
        resolve(
          new File([blob], arquivo.name.replace(/\.[^.]+$/, ".webp"), {
            type: "image/webp",
          }),
        );
      },
      "image/webp",
      0.82,
    );
  });
}

async function enviarLogoAdmin(arquivo, nomeCliente) {
  if (!arquivo || !String(arquivo.type || "").startsWith("image/")) {
    throw new Error("Arquivo de imagem inválido.");
  }
  const arquivoUpload = await prepararLogoParaUpload(arquivo);

  if (supabaseConfigurado() && supabaseClient.storage) {
    const bucket = String(P.supabaseLogosBucket || "logos").trim() || "logos";
    const caminho = nomeArquivoSeguroLogo(nomeCliente, arquivoUpload);
    try {
      const { error } = await supabaseClient.storage
        .from(bucket)
        .upload(caminho, arquivoUpload, {
          cacheControl: "31536000",
          upsert: true,
          contentType: arquivoUpload.type || "image/webp",
        });
      if (error) throw error;
      const { data } = supabaseClient.storage.from(bucket).getPublicUrl(caminho);
      if (data && data.publicUrl) return data.publicUrl;
    } catch (erro) {
      console.warn(
        "[portal] Falha ao enviar logo para Supabase Storage. Usando base64.",
        erro,
      );
    }
  }

  return arquivoParaDataUrl(arquivoUpload);
}

function rotacionarLista(lista, indice) {
  if (!lista.length) return lista;
  const inicio = indice % lista.length;
  return [...lista.slice(inicio), ...lista.slice(0, inicio)];
}

function empresaVipNaGrade(empresa) {
  return empresa.plano === "vip";
}

/** VIPs alternam posição a cada nova abertura do portal; básicos ficam depois. */
function ordenarEmpresasParaGrade(lista) {
  const prioridade = {
    "fl conecta": 0,
    "dona lena": 1,
    "pao de queijo do beto": 2,
    "valdecir alves": 3,
    "limp gel": 4,
  };
  const baseOrdenada = [...lista]
    .sort((a, b) => {
      const nomeA = normalizarTexto(a.nome);
      const nomeB = normalizarTexto(b.nome);
      const ordemA =
        prioridade[nomeA] !== undefined ? prioridade[nomeA] : 999;
      const ordemB =
        prioridade[nomeB] !== undefined ? prioridade[nomeB] : 999;

      if (ordemA !== ordemB) return ordemA - ordemB;

      return (
        Number(Boolean(b.patrocinado)) - Number(Boolean(a.patrocinado))
      );
    })
    .sort((a, b) => (b.plano === "vip") - (a.plano === "vip"));

  const vips = baseOrdenada.filter(empresaVipNaGrade);
  const demais = baseOrdenada.filter(
    (empresa) => !empresaVipNaGrade(empresa),
  );
  const vipsRotacionados = rotacionarLista(vips, INDICE_ROTACAO_VIP);

  return [...vipsRotacionados, ...demais];
}

/* CARDS */
function carregar(lista) {
  const grid = document.getElementById("grid");
  const estadoVazio = document.getElementById("estadoVazio");
  if (!grid || !estadoVazio) return;
  grid.innerHTML = "";
  estadoVazio.style.display = lista.length ? "none" : "block";

  const ordenada = ordenarEmpresasParaGrade(lista);

  const htmlCards = ordenada
    .map((e, indice) => {
    const telefone = normalizarTelefone(e.tel);
    const telWa = telefoneInternacionalBr(e.tel);
    const temWhatsApp = telefoneValido(e.tel);
    const temLigacao = telefone.length >= 10;
    const nomeSeguro = escaparHtml(e.nome);
    const categoria = textoPareceArquivoImagem(e.categoria)
      ? ""
      : e.categoria || "";
    const categoriaSegura = escaparHtml(categoria);
    const funcionamentoSeguro = escaparHtml(e.funcionamento || "");
    const descricaoServico = escaparHtml(obterDescricaoServico(e));
    const logoSeguro = logoUrlEmpresa(e);
    const nomeLogoSeguro = escaparHtml(e.nome || "");
    const siteSeguro = urlHttpSegura(e.site);
    const instagramSeguro = urlHttpSegura(e.instagram);
    const hrefWhatsApp = temWhatsApp
      ? `https://wa.me/${telWa}?text=${encodeURIComponent(
          mensagemWhatsAppCliente(e.nome),
        )}`
      : "#";
    const hrefLigacao = temLigacao ? `tel:+${telefone}` : "#";
    const hrefMapa = e.endereco
      ? `https://maps.google.com/?q=${encodeURIComponent(e.endereco)}`
      : "#";
    return `
<div class="card ${e.patrocinado ? "patrocinado" : ""} ${e.plano === "vip" ? "vip" : ""} ${normalizarTexto(e.nome) === "fl conecta" ? "card--destaque-operador" : ""}">
<div class="card-logo-wrap"><img src="${logoSeguro}" alt="" loading="eager" decoding="async" width="148" height="148" data-logo-nome="${nomeLogoSeguro}" onerror="aplicarLogoFallback(this)"></div>
${categoriaSegura ? `<div class="categoria">${categoriaSegura}</div>` : ""}
<h3>${nomeSeguro}</h3>
${funcionamentoSeguro ? `<div class="card-funcionamento">${funcionamentoSeguro}</div>` : ""}
<div class="card-descricao">${descricaoServico}</div>

<a class="btn ligar ${temLigacao ? "" : "disabled"}" href="${hrefLigacao}" ${temLigacao ? "" : 'aria-disabled="true"'}>
<span class="btn-icon" aria-hidden="true">☎</span><span>${temLigacao ? "Ligar" : "Ligação indisponível"}</span>
</a>

<a class="btn btn-wa ${temWhatsApp ? "" : "disabled"}" href="${hrefWhatsApp}" ${temWhatsApp ? 'target="_blank" rel="noopener noreferrer"' : 'aria-disabled="true"'}>
${temWhatsApp ? "💬 WhatsApp" : "WhatsApp indisponível"}
</a>

${siteSeguro ? `<a class="btn site" href="${siteSeguro}" target="_blank" rel="noopener noreferrer">Ver Site</a>` : ""}
${instagramSeguro ? `<a class="btn instagram" href="${instagramSeguro}" target="_blank" rel="noopener noreferrer"><span class="btn-icon btn-icon-instagram" aria-hidden="true">◎</span><span>Instagram</span></a>` : ""}
${e.endereco ? `<a class="btn site" href="${hrefMapa}" target="_blank" rel="noopener noreferrer">📍 Localização</a>` : ""}

</div>`;
  })
    .join("");
  grid.innerHTML = htmlCards;
}



/* ESCADA — rolagem contínua nas laterais (lista duplicada + -50%) */
function criarEscada() {
  const left = document.getElementById("leftScroll");
  const right = document.getElementById("rightScroll");
  if (!left || !right) return;

  left.innerHTML = "";
  right.innerHTML = "";

  const base = ordenarEmpresasParaGrade(
    empresasPatrocinadasNoPortal(empresas),
  );
  const vitrine = [...base, ...base];

  const minis = vitrine
    .map((e) => {
    const nomeSeguro = escaparHtml(e.nome);
    const logoSeguro = logoUrlEmpresa(e);
    const nomeLogoSeguro = escaparHtml(e.nome || "");
    return `
<div class="mini-card">
<img src="${logoSeguro}" alt="" loading="lazy" decoding="async" data-logo-nome="${nomeLogoSeguro}" onerror="aplicarLogoFallback(this)">
<p class="mini-nome">${nomeSeguro}</p>
</div>`;
  })
    .join("");
  left.innerHTML = minis;
  right.innerHTML = minis;

  const n = vitrine.length || 1;
  const sec = Math.max(16, Math.min(48, 8 + n * 1.1));
  left.style.setProperty("--escada-scroll-sec", `${sec}s`);
  right.style.setProperty("--escada-scroll-sec", `${sec}s`);
}
