import { buscar } from "../lib.mjs";

const FEED = "https://irrelefante.com.br/feed.json";
const HOST = new URL(FEED).host;

export default async function irrelefante({ limite = 5 } = {}) {
  const feed = await buscar(FEED);

  return feed.items.slice(0, limite).map((item) => {
    // No padrão linkblog, `url` pode apontar para o link comentado.
    // O `id` costuma ser o permalink do post; confira no seu feed.
    const link = item.external_url ?? item.url;
    const permalink = item.id?.startsWith("http") ? item.id : item.url;

    return {
      titulo: item.title ?? "(sem título)",
      permalink,
      link,
      externo: new URL(link).host !== HOST,
      data: item.date_published ?? null,
      resumo: item.summary ?? null,
    };
  });
}
