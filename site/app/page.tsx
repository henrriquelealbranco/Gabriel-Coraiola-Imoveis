export const dynamic = "force-dynamic";

import { ArrowDown, ArrowUpRight, MessageCircle } from "lucide-react";
import { PropertyCatalog } from "@/app/components/property-catalog";
import { BrandMark } from "@/app/components/brand";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { whatsappUrl } from "@/app/data/properties";
import { listActiveProperties } from "@/lib/properties/repository";

export default async function Home() {
  const properties = await listActiveProperties();
  return (
    <main>
      <SiteHeader whatsapp={whatsappUrl()} />

      <section className="hero" id="inicio">
        <BrandMark className="hero-watermark" />
        <div className="hero-copy page-shell">
          <p className="eyebrow">Curitiba e região</p>
          <h1>Um imóvel não é só um endereço. <em>É o começo da sua próxima história.</em></h1>
          <p className="hero-intro">Atendimento próximo e uma seleção cuidadosa de imóveis entre R$ 500 mil e R$ 1 milhão.</p>
          <div className="hero-actions"><a className="button button-light" href="#imoveis">Encontrar meu imóvel <ArrowDown /></a><a className="text-link light-link" href={whatsappUrl()} target="_blank" rel="noreferrer">Falar com Gabriel <ArrowUpRight /></a></div>
        </div>
        <div className="trust-strip"><span>Atendimento personalizado</span><span>Imóveis selecionados</span><span>Negociação transparente</span></div>
      </section>

      <section className="listing-section page-shell" id="imoveis">
        <div className="section-heading">
          <div><p className="eyebrow">Imóveis em destaque</p><h2>Escolha o lugar que combina com o seu momento</h2></div>
          <p>Use os filtros para encontrar opções dentro do seu perfil e converse diretamente comigo para agendar uma visita.</p>
        </div>
        <PropertyCatalog properties={properties} />
      </section>

      <section className="about-section" id="sobre">
        <div className="about-grid page-shell">
          <div className="about-copy">
            <p className="eyebrow">Quem vai te acompanhar</p><h2>Gabriel Coraiola</h2>
            <p>Decisões imobiliárias pedem clareza, atenção aos detalhes e alguém que realmente escute o que você procura.</p>
            <p>Do primeiro contato à entrega das chaves, você recebe orientação próxima, informações objetivas e apoio em cada etapa da negociação.</p>
            <a className="text-link" href={whatsappUrl()} target="_blank" rel="noreferrer">Converse diretamente com Gabriel <ArrowUpRight /></a>
          </div>
          <div className="portrait-card" aria-label="Atendimento imobiliário personalizado"><BrandMark className="portrait-mark" /><div><small>Atuação</small><strong>Curitiba e região</strong></div></div>
        </div>
      </section>

      <section className="contact-section" id="contato">
        <BrandMark className="section-watermark" />
        <div className="page-shell contact-inner">
          <div><p className="eyebrow">Seu próximo passo</p><h2>Quer receber imóveis que combinam com você?</h2><p>Conte o que procura e receba uma seleção personalizada.</p></div>
          <a className="button button-light" href={whatsappUrl()} target="_blank" rel="noreferrer">Chamar no WhatsApp <MessageCircle /></a>
        </div>
      </section>

      <SiteFooter />
      <a className="floating-whatsapp" href={whatsappUrl()} target="_blank" rel="noreferrer" aria-label="Falar com Gabriel pelo WhatsApp"><MessageCircle /></a>
    </main>
  );
}
