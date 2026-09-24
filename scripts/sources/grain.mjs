import { listarRegistros, resolverPds } from "../lib.mjs";

const DID = "did:plc:aeaouj6eedwqmk4z3pies55n";
const COLECAO = "social.grain.photo";

export default async function grain({ limite = 9 } = {}) {
  const pds = await resolverPds(DID);
  const registros = await listarRegistros(pds, DID, COLECAO);
  return transformar(registros, pds, limite);
}

export function transformar(registros, pds, limite = 9) {
  const vistas = new Set();

  return registros
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
    .filter((f) => f.imagem)
    .sort((a, b) => new Date(b.data ?? 0) - new Date(a.data ?? 0))
    // A mesma foto pode estar em mais de uma galeria (um registro por
    // aparição), gerando várias entradas com a mesma imagem: fica só a
    // mais recente de cada uma.
    .filter((f) => !vistas.has(f.imagem) && vistas.add(f.imagem))
    .slice(0, limite);
}
