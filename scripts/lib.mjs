/** fetch com timeout, User-Agent identificável e erro legível. */
export async function buscar(url, { tipo = "json", headers = {} } = {}) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15_000),
    headers: {
      "User-Agent": "arthr.me/1.0 (+https://arthr.me/)",
      Accept: tipo === "json" ? "application/json" : "application/rss+xml, application/xml, text/xml",
      ...headers,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} em ${url}`);
  return tipo === "json" ? res.json() : res.text();
}

/** Decodifica entidades HTML comuns e numéricas. */
export function decodificarEntidades(texto) {
  const nomeadas = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return texto
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => nomeadas[n.toLowerCase()] ?? m);
}

/** HTML → texto puro, com parágrafos separados por linha em branco. */
export function textoPuro(html) {
  return decodificarEntidades(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
  ).trim();
}

/** Corta no limite de palavras mais próximo, com reticências. */
export function resumir(texto, limite = 220) {
  if (texto.length <= limite) return texto;
  const corte = texto.slice(0, limite);
  return corte.slice(0, corte.lastIndexOf(" ")).replace(/[\s,.;:!?–—-]+$/, "") + "…";
}
