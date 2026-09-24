import { buscar } from "../lib.mjs";
import { urlDaApi, transformar } from "../../lib/lastfm.mjs";

export default async function lastfm({ limite = 8 } = {}) {
  const chave = process.env.LASTFM_API_KEY;
  if (!chave) throw new Error("defina a variável LASTFM_API_KEY");

  // Só os scrobbles vão para o JSON estático: o "tocando agora" envelhece
  // rápido demais para uma página que atualiza 2x por dia, e fica com a
  // Pages Function em /api/lastfm.
  return transformar(await buscar(urlDaApi(chave)), limite).items;
}
