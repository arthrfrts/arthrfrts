/**
 * Busca cada fonte e grava em _data/feeds/<nome>.json.
 * - Se uma fonte falhar, o JSON anterior é mantido (o widget não some).
 * - Se nada mudou, o arquivo não é reescrito (evita commits vazios).
 * Uso: `npm run buscar` ou `npm run buscar -- irrelefante` para uma fonte só.
 */
import { readFile, writeFile } from "node:fs/promises";
import irrelefante from "./sources/irrelefante.mjs";
import bluesky from "./sources/bluesky.mjs";
import letterboxd from "./sources/letterboxd.mjs";
import lastfm from "./sources/lastfm.mjs";
import grain from "./sources/grain.mjs";

const FONTES = { irrelefante, bluesky, letterboxd, lastfm, grain };
const PASTA = new URL("../_data/feeds/", import.meta.url);
const noActions = Boolean(process.env.GITHUB_ACTIONS);

const pedidas = process.argv.slice(2);
const alvo = Object.entries(FONTES).filter(([nome]) => !pedidas.length || pedidas.includes(nome));
let falhas = 0;

for (const [nome, fonte] of alvo) {
  const arquivo = new URL(`${nome}.json`, PASTA);
  try {
    const items = await fonte();
    if (!Array.isArray(items) || items.length === 0) throw new Error("a fonte não retornou itens");

    const anterior = await readFile(arquivo, "utf8").then(JSON.parse).catch(() => null);
    if (JSON.stringify(anterior?.items) === JSON.stringify(items)) {
      console.log(`= ${nome}: sem mudanças`);
      continue;
    }

    const dados = { atualizadoEm: new Date().toISOString(), items };
    await writeFile(arquivo, JSON.stringify(dados, null, 2) + "\n");
    console.log(`✓ ${nome}: ${items.length} itens`);
  } catch (erro) {
    falhas++;
    const msg = `${nome}: ${erro.message} (dados anteriores mantidos)`;
    console.error(noActions ? `::warning::${msg}` : `✗ ${msg}`);
  }
}

// Só falha o job se todas as fontes falharem.
if (alvo.length && falhas === alvo.length) process.exitCode = 1;
