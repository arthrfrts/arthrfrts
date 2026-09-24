/**
 * GET /api/lastfm → { tocando, items }
 * Pages Function que consulta o Last.fm com a chave guardada no Cloudflare
 * (variável LASTFM_API_KEY), para a chave nunca chegar ao navegador.
 * A resposta do Last.fm fica em cache na borda por 30s, então muitas
 * visitas ao mesmo tempo não viram muitas chamadas à API.
 */
import { urlDaApi, transformar } from "../../lib/lastfm.mjs";

export async function onRequestGet({ env }) {
  if (!env.LASTFM_API_KEY) return json({ erro: "LASTFM_API_KEY não configurada" }, 500);

  try {
    const res = await fetch(urlDaApi(env.LASTFM_API_KEY), {
      headers: { "User-Agent": "arthr.me/1.0 (+https://arthr.me/)" },
      cf: { cacheTtl: 30, cacheEverything: true },
    });
    if (!res.ok) throw new Error(`o Last.fm respondeu ${res.status}`);
    return json(transformar(await res.json()), 200, "public, max-age=30");
  } catch (erro) {
    return json({ erro: erro.message }, 502);
  }
}

function json(dados, status, cache = "no-store") {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": cache },
  });
}
