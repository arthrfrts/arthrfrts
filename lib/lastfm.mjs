/**
 * Transformação dos scrobbles do Last.fm, compartilhada entre o script de
 * build (scripts/sources/lastfm.mjs) e a Pages Function (functions/api/lastfm.js).
 */

export const USUARIO = "arthrfrts";

// A imagem de "sem capa" do Last.fm (uma estrela cinza) tem sempre este hash
const SEM_CAPA = "2a96cbd8b46e442fc41c2b86b821562f";

export function urlDaApi(chave, { usuario = USUARIO, limite = 10 } = {}) {
  const params = new URLSearchParams({
    method: "user.getrecenttracks",
    user: usuario,
    api_key: chave,
    format: "json",
    limit: String(limite),
  });
  return `https://ws.audioscrobbler.com/2.0/?${params}`;
}

function capa(imagens = []) {
  const url = imagens.find((i) => i.size === "large")?.["#text"] || imagens.at(-1)?.["#text"];
  return url && !url.includes(SEM_CAPA) ? url : null;
}

function faixa(t) {
  return {
    musica: t.name,
    artista: t.artist?.["#text"] ?? t.artist?.name ?? "",
    album: t.album?.["#text"] || null,
    url: t.url,
    capa: capa(t.image),
    data: t.date ? new Date(Number(t.date.uts) * 1000).toISOString() : null,
  };
}

/** → { tocando: faixa | null, items: faixa[] } */
export function transformar(json, limite = 8) {
  if (json.error) throw new Error(`Last.fm: ${json.message}`);

  // Com um só resultado, a API devolve um objeto em vez de uma lista
  const faixas = [].concat(json.recenttracks?.track ?? []);
  const tocando = faixas.find((t) => t["@attr"]?.nowplaying === "true");

  return {
    tocando: tocando ? faixa(tocando) : null,
    items: faixas.filter((t) => t !== tocando).slice(0, limite).map(faixa),
  };
}
