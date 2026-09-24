import { buscar } from "../lib.mjs";

const DID = "did:plc:aeaouj6eedwqmk4z3pies55n";
const COLECAO = "social.grain.photo";

export default async function grain({ limite = 9 } = {}) {
  const pds = await resolverPds(DID);
  const url = `${pds}/xrpc/com.atproto.repo.listRecords?repo=${DID}&collection=${COLECAO}&limit=${limite}&reverse=true`;
  return transformar(await buscar(url), pds);
}

/** Onde o repositório do DID mora: é de lá que vem cada blob (foto). */
async function resolverPds(did) {
  const doc = await buscar(`https://plc.directory/${did}`);
  const pds = doc.service?.find((s) => s.id === "#atproto_pds")?.serviceEndpoint;
  if (!pds) throw new Error(`PDS não encontrado para ${did}`);
  return pds;
}

export function transformar(resposta, pds) {
  return (resposta.records ?? [])
    .map(({ value }) => {
      const blob = value.photo ?? value.image;
      const cid = blob?.ref?.$link ?? blob?.ref ?? null;
      return {
        data: value.createdAt ?? null,
        alt: value.alt ?? "",
        imagem: cid && `${pds}/xrpc/com.atproto.sync.getBlob?did=${DID}&cid=${cid}`,
        largura: value.aspectRatio?.width ?? null,
        altura: value.aspectRatio?.height ?? null,
      };
    })
    .filter((f) => f.imagem);
}
