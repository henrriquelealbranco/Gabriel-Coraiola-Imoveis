import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><div><p className="eyebrow">Imóvel não encontrado</p><h1>Esta opção não está mais disponível.</h1><p>Veja os imóveis que estão disponíveis no momento.</p><Link className="button" href="/#imoveis">Voltar aos imóveis</Link></div></main>;
}
