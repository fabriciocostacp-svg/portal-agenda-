function descricaoTempo(codigo) {
  const mapa = {
    0: "Céu limpo",
    1: "Predominantemente limpo",
    2: "Parcial nublado",
    3: "Nublado",
    45: "Nevoeiro",
    48: "Nevoeiro",
    51: "Garoa",
    53: "Garoa",
    55: "Garoa forte",
    61: "Chuva fraca",
    63: "Chuva",
    65: "Chuva forte",
    71: "Granizo",
    80: "Pancadas",
    81: "Pancadas",
    82: "Tempestade",
    95: "Tempestade",
  };
  return mapa[codigo] || "Variável";
}

function emojiTempo(codigo) {
  if (codigo === 0) return "☀️";
  if (codigo >= 1 && codigo <= 3) return "⛅";
  if (codigo === 45 || codigo === 48) return "🌫️";
  if ((codigo >= 51 && codigo <= 55) || (codigo >= 61 && codigo <= 65))
    return "🌧️";
  if (codigo >= 80 && codigo <= 82) return "🌦️";
  if (codigo >= 95) return "⛈️";
  return "🌡️";
}

let climaRelogioTimer = null;

function textoDataHoraClima() {
  const agora = new Date();
  const data = agora.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const hora = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${data} • ${hora}`;
}

function iniciarRelogioClima() {
  const alvo = document.getElementById("climaRelogio");
  if (!alvo) return;
  alvo.textContent = textoDataHoraClima();
  if (climaRelogioTimer) clearInterval(climaRelogioTimer);
  climaRelogioTimer = setInterval(() => {
    const atual = document.getElementById("climaRelogio");
    if (atual) atual.textContent = textoDataHoraClima();
  }, 30000);
}

async function carregarClima() {
  const climaAtual = document.getElementById("climaAtual");
  const climaAtualizado = document.getElementById("climaAtualizado");
  const climaLista = document.getElementById("climaLista");

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(P.climateLatitude ?? -22.2528)}&longitude=${encodeURIComponent(P.climateLongitude ?? -47.8169)}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=4`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error("Falha ao carregar clima");
    const dados = await resposta.json();

    const atual = dados.current;
    climaAtual.innerHTML = `<span class="clima-now-icon" aria-hidden="true">${emojiTempo(atual.weather_code)}</span><span class="clima-now-main"><span class="clima-now-temp">${Math.round(atual.temperature_2m)}°C</span><span class="clima-now-desc">${descricaoTempo(atual.weather_code)}</span><span class="clima-now-meta" id="climaRelogio"></span></span>`;
    iniciarRelogioClima();
    climaAtualizado.textContent = `Vento ${Math.round(atual.wind_speed_10m)} km/h • previsão para Itirapina`;

    climaLista.innerHTML = "";
    for (let i = 1; i <= 3; i += 1) {
      const data = new Date(dados.daily.time[i] + "T12:00:00");
      const dia = data
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", "");
      const max = Math.round(dados.daily.temperature_2m_max[i]);
      const min = Math.round(dados.daily.temperature_2m_min[i]);
      const cod = dados.daily.weather_code[i];

      climaLista.innerHTML += `
<div class="clima-dia fade-in">
  ${dia}
  <strong><span aria-hidden="true">${emojiTempo(cod)}</span> ${max}° / ${min}°</strong>
  <div>${descricaoTempo(cod)}</div>
</div>`;
    }
  } catch (erro) {
    climaAtual.textContent =
      "Não foi possível carregar a previsão agora.";
    climaAtualizado.textContent = "";
    climaLista.innerHTML = "";
  }
}
