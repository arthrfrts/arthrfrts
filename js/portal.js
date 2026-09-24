/**
 * portal.js: melhorias progressivas. Sem JS, a página funciona inteira:
 * todos os widgets abertos, na ordem do HTML, e o céu da tarde.
 *
 * 1. Céu e relógio no horário de Porto Alegre
 * 2. Widgets: recolher e reordenar (↑/↓), em qualquer tela
 * 3. Modo mesa: em telas largas com mouse, as janelas se arrastam pela aba.
 *    A ordem do DOM acompanha a posição (de cima para baixo, da esquerda
 *    para a direita), então o foco e a leitura seguem o que se vê.
 * 4. Last.fm ao vivo, via Pages Function
 */

const FUSO = "America/Sao_Paulo";
const CHAVE = "arthr.me:portal";

/* ------------------------------------------------------------------------
   1. Céu e relógio
   ------------------------------------------------------------------------ */

const SAUDACOES = {
  madrugada: "Boa madrugada de Porto Alegre.",
  manha: "Bom dia de Porto Alegre.",
  tarde: "Boa tarde de Porto Alegre.",
  entardecer: "Pôr do sol no Guaíba.",
  noite: "Boa noite de Porto Alegre.",
};

const formatoHora = new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hourCycle: "h23", timeZone: FUSO });
const formatoRelogio = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: FUSO });

function periodoAtual() {
  const h = Number(formatoHora.format(new Date()));
  if (h < 6) return "madrugada";
  if (h < 12) return "manha";
  if (h < 17) return "tarde";
  if (h < 20) return "entardecer";
  return "noite";
}

function atualizarCeu() {
  const periodo = periodoAtual();
  document.documentElement.dataset.periodo = periodo;
  const saudacao = document.querySelector("[data-saudacao]");
  if (saudacao) saudacao.textContent = SAUDACOES[periodo];
}

const relogio = document.querySelector("[data-relogio]");
function atualizarRelogio() {
  if (!relogio) return;
  const agora = new Date();
  relogio.textContent = formatoRelogio.format(agora);
  relogio.dateTime = agora.toISOString();
}

atualizarCeu();
atualizarRelogio();
document.querySelector("[data-bandeja]")?.removeAttribute("hidden");
setInterval(atualizarCeu, 10 * 60 * 1000);
setInterval(atualizarRelogio, 15 * 1000);

/* ------------------------------------------------------------------------
   Estado salvo no navegador
   ------------------------------------------------------------------------ */

let estado = lerEstado();

function lerEstado() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? {};
  } catch {
    return {};
  }
}

function salvarEstado() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* Sem storage (modo privado etc.): a escolha só dura esta visita. */
  }
}

/* ------------------------------------------------------------------------
   2. Widgets: recolher e reordenar
   ------------------------------------------------------------------------ */

const painel = document.querySelector("[data-painel]");
const anuncio = document.querySelector("[data-anuncio]");
const botaoRestaurar = document.querySelector("[data-restaurar]");

const widgets = () => [...painel.querySelectorAll(":scope > [data-widget]")];
const nomeDe = (w) => w.querySelector(".widget__titulo").textContent.trim();

function anunciar(texto) {
  anuncio.textContent = "";
  requestAnimationFrame(() => (anuncio.textContent = texto));
}

function definirAberto(widget, aberto) {
  widget.querySelector(".widget__alternar").setAttribute("aria-expanded", String(aberto));
  widget.querySelector(".widget__corpo").hidden = !aberto;
  widget.classList.toggle("widget--fechado", !aberto);
}

function atualizarLimites() {
  const lista = widgets();
  painel.toggleAttribute("data-unico", lista.length < 2);
  lista.forEach((w, i) => {
    w.querySelector('[data-direcao="-1"]').setAttribute("aria-disabled", String(i === 0));
    w.querySelector('[data-direcao="1"]').setAttribute("aria-disabled", String(i === lista.length - 1));
  });
}

function lembrarOrdem() {
  estado.ordem = widgets().map((w) => w.id);
  salvarEstado();
  atualizarLimites();
}

function mover(widget, direcao, botao) {
  if (botao.getAttribute("aria-disabled") === "true") {
    anunciar(`${nomeDe(widget)} já está na ${direcao < 0 ? "primeira" : "última"} posição.`);
    return;
  }

  const lista = widgets();
  const destino = lista.indexOf(widget) + direcao;
  const referencia = direcao < 0 ? lista[destino] : lista[destino].nextElementSibling;

  painel.insertBefore(widget, referencia);
  botao.focus(); // mover o nó no DOM pode tirar o foco em alguns navegadores
  lembrarOrdem();
  anunciar(`${nomeDe(widget)} movido para a posição ${destino + 1} de ${lista.length}.`);
}

function criarBotaoMover(widget, direcao) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "widget__mover";
  botao.dataset.direcao = String(direcao);
  botao.setAttribute("aria-label", `Mover ${nomeDe(widget)} para ${direcao < 0 ? "cima" : "baixo"}`);

  const seta = document.createElement("span");
  seta.setAttribute("aria-hidden", "true");
  seta.textContent = direcao < 0 ? "↑" : "↓";
  botao.append(seta);

  botao.addEventListener("click", () => mover(widget, direcao, botao));
  return botao;
}

function prepararWidget(widget) {
  const titulo = widget.querySelector(".widget__titulo");
  const corpo = widget.querySelector(".widget__corpo");

  // Padrão de disclosure: <h2><button aria-expanded> em vez de <summary>,
  // para o título continuar sendo um cabeçalho de verdade.
  const alternar = document.createElement("button");
  alternar.type = "button";
  alternar.className = "widget__alternar";
  alternar.setAttribute("aria-controls", corpo.id);
  alternar.textContent = titulo.textContent.trim();
  titulo.replaceChildren(alternar);

  alternar.addEventListener("click", () => {
    const aberto = alternar.getAttribute("aria-expanded") === "true";
    definirAberto(widget, !aberto);
    estado.fechados = widgets()
      .filter((w) => w.classList.contains("widget--fechado"))
      .map((w) => w.id);
    salvarEstado();
  });

  const controles = document.createElement("div");
  controles.className = "widget__controles";
  controles.append(criarBotaoMover(widget, -1), criarBotaoMover(widget, 1));
  widget.querySelector(".widget__barra").append(controles);

  definirAberto(widget, !estado.fechados?.includes(widget.id));
  prepararArraste(widget);
}

/* ------------------------------------------------------------------------
   3. Modo mesa
   ------------------------------------------------------------------------ */

const telaDeMesa = matchMedia("(min-width: 64rem) and (pointer: fine)");
const PASSO = 10; // px por seta; com Shift, 5×
const MESMA_LINHA = 48; // janelas com topo a menos disso contam como mesma linha
let mesaAtiva = false;

const observador = new ResizeObserver(() => mesaAtiva && ajustarAltura());

function recuoDoPainel() {
  const estilo = getComputedStyle(painel);
  return { inicio: parseFloat(estilo.paddingInlineStart), fim: parseFloat(estilo.paddingInlineEnd) };
}

/** Posições das janelas no layout em grade, relativas ao painel. */
function posicoesDaGrade() {
  const base = painel.getBoundingClientRect();
  return Object.fromEntries(
    widgets().map((w) => {
      const r = w.getBoundingClientRect();
      return [w.id, { x: r.left - base.left, y: r.top - base.top, largura: r.width }];
    }),
  );
}

function posicionar(w, x, y) {
  const recuo = recuoDoPainel();
  const maxX = painel.clientWidth - recuo.fim - w.offsetWidth;
  const nx = Math.round(Math.min(Math.max(x, recuo.inicio), Math.max(maxX, recuo.inicio)));
  const ny = Math.round(Math.max(y, 0));
  w.style.left = `${nx}px`;
  w.style.top = `${ny}px`;
}

function ajustarAltura() {
  const fundo = Math.max(0, ...widgets().map((w) => w.offsetTop + w.offsetHeight));
  painel.style.minBlockSize = `${fundo + 24}px`;
}

function salvarMesa() {
  estado.mesa = Object.fromEntries(widgets().map((w) => [w.id, { x: w.offsetLeft, y: w.offsetTop }]));
  salvarEstado();
}

/** Pilha de janelas: a última é a da frente (e a única com a aba amarela). */
function aplicarPilha() {
  const ids = widgets().map((w) => w.id);
  const pilha = (estado.pilha ?? []).filter((id) => ids.includes(id));
  for (const id of ids) if (!pilha.includes(id)) pilha.unshift(id);
  estado.pilha = pilha;

  pilha.forEach((id, i) => {
    const w = document.getElementById(id);
    w.style.zIndex = String(i + 1);
    w.classList.toggle("widget--ativa", i === pilha.length - 1);
  });
}

function trazerParaFrente(w) {
  if (!mesaAtiva || estado.pilha?.at(-1) === w.id) return;
  estado.pilha = [...(estado.pilha ?? []).filter((id) => id !== w.id), w.id];
  aplicarPilha();
  salvarEstado();
}

/** Reordena o DOM pela posição na tela. Devolve true se a ordem mudou. */
function reordenarPelaPosicao() {
  const antes = widgets();
  const depois = [...antes].sort((a, b) =>
    Math.abs(a.offsetTop - b.offsetTop) < MESMA_LINHA ? a.offsetLeft - b.offsetLeft : a.offsetTop - b.offsetTop,
  );
  if (depois.every((w, i) => w === antes[i])) return false;

  const focado = document.activeElement;
  for (const w of depois) painel.append(w);
  if (focado instanceof HTMLElement && painel.contains(focado)) focado.focus({ preventScroll: true });
  lembrarOrdem();
  return true;
}

function depoisDeMover(w, { anunciarPosicao }) {
  salvarMesa();
  const mudou = reordenarPelaPosicao();
  ajustarAltura();
  if (anunciarPosicao) {
    const posicao = widgets().indexOf(w) + 1;
    anunciar(
      mudou
        ? `${nomeDe(w)} agora é a janela ${posicao} de ${widgets().length} na ordem de leitura.`
        : `${nomeDe(w)} movida.`,
    );
  }
}

/* Arrastar pela aba (mouse) e mover com as setas (teclado) */
function prepararArraste(w) {
  const aba = w.querySelector(".widget__barra");

  aba.addEventListener("pointerdown", (e) => {
    if (!mesaAtiva || e.button !== 0 || e.target.closest(".widget__mover")) return;
    trazerParaFrente(w);

    const inicio = { px: e.clientX, py: e.clientY, x: w.offsetLeft, y: w.offsetTop };
    let arrastando = false;

    const aoMover = (ev) => {
      const dx = ev.clientX - inicio.px;
      const dy = ev.clientY - inicio.py;
      if (!arrastando) {
        if (Math.hypot(dx, dy) < 4) return; // ainda é um clique
        arrastando = true;
        w.classList.add("widget--arrastando");
      }
      posicionar(w, inicio.x + dx, inicio.y + dy);
    };

    const aoSoltar = () => {
      removeEventListener("pointermove", aoMover);
      removeEventListener("pointerup", aoSoltar);
      removeEventListener("pointercancel", aoSoltar);
      if (!arrastando) return;

      w.classList.remove("widget--arrastando");
      // Engole o clique que o navegador dispara no fim do arraste,
      // senão soltar a janela também recolheria ela.
      const engolir = (c) => {
        c.preventDefault();
        c.stopImmediatePropagation();
      };
      aba.addEventListener("click", engolir, { capture: true, once: true });
      setTimeout(() => aba.removeEventListener("click", engolir, { capture: true }), 0);

      depoisDeMover(w, { anunciarPosicao: false });
    };

    // Escuta na janela do navegador (e não na aba) para o arraste não
    // escapar quando o ponteiro se move mais rápido que a janela.
    // Sem pointer capture: com ele, um clique simples não chegaria ao botão.
    addEventListener("pointermove", aoMover);
    addEventListener("pointerup", aoSoltar);
    addEventListener("pointercancel", aoSoltar);
  });

  const alternar = w.querySelector(".widget__alternar");
  let pausa;
  alternar.addEventListener("keydown", (e) => {
    if (!mesaAtiva) return;
    const setas = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const direcao = setas[e.key];
    if (!direcao || e.altKey || e.ctrlKey || e.metaKey) return;

    e.preventDefault();
    const passo = e.shiftKey ? PASSO * 5 : PASSO;
    posicionar(w, w.offsetLeft + direcao[0] * passo, w.offsetTop + direcao[1] * passo);
    ajustarAltura();

    clearTimeout(pausa);
    pausa = setTimeout(() => depoisDeMover(w, { anunciarPosicao: true }), 500);
  });

  w.addEventListener("focusin", () => trazerParaFrente(w));
}

function criarDicas() {
  for (const w of widgets()) {
    const dica = document.createElement("span");
    dica.id = `${w.id}-dica`;
    dica.className = "visualmente-oculto";
    dica.dataset.dicaMesa = "";
    dica.textContent = "Use as setas para mover a janela na mesa. Com Shift, ela anda mais rápido.";
    w.append(dica);
    w.querySelector(".widget__alternar").setAttribute("aria-describedby", dica.id);
  }
}

function removerDicas() {
  painel.querySelectorAll("[data-dica-mesa]").forEach((d) => d.remove());
  painel.querySelectorAll(".widget__alternar").forEach((b) => b.removeAttribute("aria-describedby"));
}

function ativarMesa() {
  if (mesaAtiva) return;
  const grade = posicoesDaGrade(); // medido ANTES de tirar as janelas da grade

  painel.classList.add("painel--mesa");
  for (const w of widgets()) {
    w.style.inlineSize = `${grade[w.id].largura}px`;
    const { x, y } = estado.mesa?.[w.id] ?? grade[w.id];
    posicionar(w, x, y);
    observador.observe(w);
  }

  mesaAtiva = true;
  aplicarPilha();
  ajustarAltura();
  criarDicas();
}

function desativarMesa() {
  if (!mesaAtiva) return;
  mesaAtiva = false;
  observador.disconnect();
  removerDicas();
  painel.classList.remove("painel--mesa");
  painel.style.removeProperty("min-block-size");
  for (const w of widgets()) {
    for (const p of ["left", "top", "inline-size", "z-index"]) w.style.removeProperty(p);
    w.classList.remove("widget--ativa", "widget--arrastando");
  }
}

// Com a janela do navegador redimensionada, as janelas não podem sair do painel
addEventListener("resize", () => {
  if (!mesaAtiva) return;
  for (const w of widgets()) posicionar(w, w.offsetLeft, w.offsetTop);
  ajustarAltura();
});

/* ------------------------------------------------------------------------
   4. Last.fm ao vivo: "tocando agora" e scrobbles frescos via /api/lastfm
   ------------------------------------------------------------------------ */

const tempoRelativo = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
const formatoDia = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: FUSO });

/** "há 5 minutos", "há 3 horas"; depois de um dia, a data ("22 de set.") */
function quando(iso) {
  const minutos = Math.round((new Date(iso) - Date.now()) / 60_000);
  if (minutos > -1) return "agora";
  if (minutos > -60) return tempoRelativo.format(minutos, "minute");
  if (minutos > -24 * 60) return tempoRelativo.format(Math.round(minutos / 60), "hour");
  return formatoDia.format(new Date(iso));
}

function atualizarTemposRelativos() {
  document.querySelectorAll("time[data-relativo]").forEach((t) => {
    t.textContent = quando(t.dateTime);
  });
}

function criarFaixa(f) {
  const li = document.createElement("li");
  li.className = "faixa h-entry";

  if (f.capa) {
    const img = Object.assign(document.createElement("img"), {
      className: "faixa__capa", src: f.capa, alt: "", width: 44, height: 44, loading: "lazy", decoding: "async",
    });
    li.append(img);
  } else {
    const vazia = Object.assign(document.createElement("span"), { className: "faixa__capa faixa__capa--vazia", textContent: "♪" });
    vazia.setAttribute("aria-hidden", "true");
    li.append(vazia);
  }

  const info = Object.assign(document.createElement("div"), { className: "faixa__info u-listen-of h-cite" });
  info.append(
    Object.assign(document.createElement("a"), { className: "faixa__musica u-url p-name", href: f.url, textContent: f.musica }),
    Object.assign(document.createElement("span"), { className: "faixa__artista p-author", textContent: f.artista }),
  );

  const tempo = Object.assign(document.createElement("time"), { className: "faixa__quando dt-published", dateTime: f.data });
  tempo.dataset.relativo = "";
  tempo.textContent = quando(f.data);

  li.append(info, tempo);
  return li;
}

function mostrarTocando(widget, t) {
  const caixa = widget.querySelector("[data-tocando]");
  caixa.hidden = !t;
  if (!t) return;

  const capa = caixa.querySelector("[data-capa]");
  capa.hidden = !t.capa;
  if (t.capa) capa.src = t.capa;

  const link = caixa.querySelector("[data-link]");
  link.href = t.url;
  link.textContent = t.musica;
  caixa.querySelector("[data-artista]").textContent = t.artista;
}

async function atualizarLastfm(widget) {
  try {
    const res = await fetch(widget.dataset.aoVivo, { headers: { Accept: "application/json" } });
    if (!res.ok) return; // sem a Function (ex.: jekyll serve), fica a lista estática
    const dados = await res.json();

    mostrarTocando(widget, dados.tocando);
    if (dados.items?.length) {
      const lista = widget.querySelector("[data-faixas]");
      lista.replaceChildren(...dados.items.map(criarFaixa));
      lista.hidden = false;
      widget.querySelector("[data-faixas-vazio]")?.remove();
    }
  } catch {
    /* Rede fora: a lista do último build continua valendo. */
  }
}

const widgetLastfm = document.querySelector("[data-ao-vivo]");
if (widgetLastfm) {
  atualizarTemposRelativos();
  atualizarLastfm(widgetLastfm);

  // A cada minuto, só com a aba visível (ninguém precisa de scrobble em aba escondida)
  setInterval(() => {
    atualizarTemposRelativos();
    if (document.visibilityState === "visible") atualizarLastfm(widgetLastfm);
  }, 60_000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") atualizarLastfm(widgetLastfm);
  });
}

/* ------------------------------------------------------------------------
   Inicialização
   ------------------------------------------------------------------------ */

if (painel) {
  const ordemOriginal = widgets().map((w) => w.id);

  // Aplica a ordem salva. Widgets novos (fora da lista) ficam no topo.
  for (const id of estado.ordem ?? []) {
    const w = document.getElementById(id);
    if (w?.parentElement === painel) painel.append(w);
  }

  widgets().forEach(prepararWidget);
  atualizarLimites();

  // Espera as fontes para medir a grade com as alturas certas
  document.fonts.ready.then(() => {
    if (telaDeMesa.matches) ativarMesa();
    telaDeMesa.addEventListener("change", (e) => (e.matches ? ativarMesa() : desativarMesa()));
  });

  botaoRestaurar.hidden = false;
  botaoRestaurar.addEventListener("click", () => {
    const naMesa = mesaAtiva;
    desativarMesa();
    for (const id of ordemOriginal) painel.append(document.getElementById(id));
    estado = {};
    salvarEstado();
    widgets().forEach((w) => definirAberto(w, true));
    atualizarLimites();
    if (naMesa) ativarMesa();
    anunciar("Layout original restaurado.");
  });
}
