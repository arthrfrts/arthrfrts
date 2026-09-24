import { buscar } from "../lib.mjs";

const ATOR = "arthr.me";
const API = "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed";
const ROTULOS_SENSIVEIS = new Set(["porn", "sexual", "nudity", "graphic-media", "gore"]);

export default async function bluesky({ limite = 5 } = {}) {
  const url = `${API}?actor=${ATOR}&filter=posts_no_replies&limit=30`;
  return transformar(await buscar(url), limite);
}

/** Separado da busca para dar para testar com um JSON salvo. */
export function transformar(resposta, limite = 5) {
  return resposta.feed
    .filter((item) => !item.reason) // sem reposts
    .slice(0, limite)
    .map(({ post }) => {
      const sensivel = post.labels?.some((l) => ROTULOS_SENSIVEIS.has(l.val));
      return {
        url: urlDoPost(post.author.handle, post.uri),
        data: post.record.createdAt,
        texto: segmentar(post.record.text, post.record.facets),
        ...(sensivel ? { sensivel: true } : midia(post.embed)),
      };
    });
}

const urlDoPost = (handle, uri) => `https://bsky.app/profile/${handle}/post/${uri.split("/").pop()}`;

/**
 * Transforma texto + facets em segmentos [{ texto, href? }].
 * Os índices dos facets são em BYTES de UTF-8, não em caracteres:
 * um emoji antes de um link desalinha tudo se você usar String#slice.
 */
export function segmentar(texto, facets = []) {
  const bytes = Buffer.from(texto, "utf8");
  const trecho = (a, b) => bytes.subarray(a, b).toString("utf8");
  const segmentos = [];
  let cursor = 0;

  for (const { index, features } of [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart)) {
    const { byteStart, byteEnd } = index;
    if (byteStart < cursor || byteEnd > bytes.length) continue; // facet sobreposto ou inválido

    if (byteStart > cursor) segmentos.push({ texto: trecho(cursor, byteStart) });
    segmentos.push({ texto: trecho(byteStart, byteEnd), href: hrefDoFacet(features?.[0]) });
    cursor = byteEnd;
  }

  if (cursor < bytes.length) segmentos.push({ texto: trecho(cursor) });
  return segmentos;
}

function hrefDoFacet(f) {
  switch (f?.$type) {
    case "app.bsky.richtext.facet#link":
      return f.uri;
    case "app.bsky.richtext.facet#mention":
      return `https://bsky.app/profile/${f.did}`;
    case "app.bsky.richtext.facet#tag":
      return `https://bsky.app/hashtag/${encodeURIComponent(f.tag)}`;
    default:
      return undefined;
  }
}

function midia(embed) {
  switch (embed?.$type) {
    case "app.bsky.embed.images#view":
      return {
        imagens: embed.images.map((i) => ({
          src: i.thumb,
          alt: i.alt,
          largura: i.aspectRatio?.width,
          altura: i.aspectRatio?.height,
        })),
      };
    case "app.bsky.embed.video#view":
      return { video: { poster: embed.thumbnail, alt: embed.alt ?? "" } };
    case "app.bsky.embed.external#view":
      return { cartao: { url: embed.external.uri, titulo: embed.external.title || embed.external.uri } };
    case "app.bsky.embed.record#view":
      return citacao(embed.record);
    case "app.bsky.embed.recordWithMedia#view":
      return { ...midia(embed.media), ...citacao(embed.record.record) };
    default:
      return {};
  }
}

function citacao(registro) {
  // Posts apagados, bloqueados ou que não são posts (listas, feeds) ficam de fora.
  if (registro?.$type !== "app.bsky.embed.record#viewRecord") return {};
  return {
    citacao: {
      autor: registro.author.displayName || registro.author.handle,
      handle: registro.author.handle,
      url: urlDoPost(registro.author.handle, registro.uri),
      texto: registro.value?.text ?? "",
    },
  };
}
