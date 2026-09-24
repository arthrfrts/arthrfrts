import { buscar, resolverPds } from "../lib.mjs";

// O feed.json direto (irrelefante.com.br/feed.json) passou a devolver 403
// pro runner do Actions. Os posts também ficam gravados no PDS do Irrelefante
// como registros AT Protocol, então buscamos direto de lá.
const DID = "did:plc:5anqf5uonyp67nsex6h55l6p";
const COLECAO = "site.standard.document";
const SITE = "https://irrelefante.com.br";

export default async function irrelefante({ limite = 5 } = {}) {
  const pds = await resolverPds(DID);
  const url = `${pds}/xrpc/com.atproto.repo.listRecords?repo=${DID}&collection=${COLECAO}&limit=${limite}&reverse=true`;
  return transformar(await buscar(url));
}

export function transformar(resposta) {
  return (resposta.records ?? []).map(({ uri, value }) => {
    const rkey = uri.split("/").pop();
    return {
      titulo: value.title ?? "(sem título)",
      permalink: `${SITE}/${rkey}`,
      link: null,
      externo: false,
      data: value.publishedAt ?? value.createdAt ?? null,
      resumo: value.description ?? null,
    };
  });
}
