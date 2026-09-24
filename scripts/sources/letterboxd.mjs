import { XMLParser } from "fast-xml-parser";
import { buscar, textoPuro, resumir } from "../lib.mjs";

const FEED = "https://letterboxd.com/arthrfrts/rss/";

const parser = new XMLParser({
  parseTagValue: false, // senão "1917" vira número e "Yes" continua string: melhor tratar tudo como texto
  isArray: (nome) => nome === "item",
});

export default async function letterboxd({ limite = 5 } = {}) {
  return transformar(await buscar(FEED, { tipo: "xml" }), limite);
}

export function transformar(xml, limite = 5) {
  const itens = parser.parse(xml).rss?.channel?.item ?? [];

  return itens
    .filter((i) => i["letterboxd:filmTitle"]) // o feed também traz listas; só queremos diário/resenhas
    .slice(0, limite)
    .map((i) => {
      const descricao = String(i.description ?? "");
      const nota = Number(i["letterboxd:memberRating"]);

      return {
        titulo: String(i["letterboxd:filmTitle"]),
        ano: i["letterboxd:filmYear"] ? String(i["letterboxd:filmYear"]) : null,
        url: String(i.link),
        publicado: new Date(i.pubDate).toISOString(),
        assistido: i["letterboxd:watchedDate"] ?? null,
        nota: Number.isFinite(nota) && nota > 0 ? nota : null,
        curtiu: i["letterboxd:memberLike"] === "Yes",
        revisto: i["letterboxd:rewatch"] === "Yes",
        poster: descricao.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? null,
        resenha: extrairResenha(descricao),
      };
    });
}

/**
 * A descrição é: <p><img poster></p> + texto da resenha, ou só
 * "Watched on …" quando não tem resenha. Avisos de spoiler são mantidos
 * como uma flag em vez de texto.
 */
function extrairResenha(html) {
  const semPoster = html.replace(/<p>\s*<img[^>]*>\s*<\/p>/i, "");
  const spoiler = /may contain spoilers/i.test(semPoster);
  const texto = textoPuro(semPoster.replace(/<p>\s*<em>[^<]*spoilers[^<]*<\/em>\s*<\/p>/i, ""));

  if (!texto || /^(re)?watched on /i.test(texto)) return null;
  return { texto: resumir(texto), spoiler };
}
