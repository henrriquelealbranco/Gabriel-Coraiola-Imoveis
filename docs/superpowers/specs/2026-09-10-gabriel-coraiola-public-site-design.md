# Gabriel Coraiola Imóveis — site público

## Objetivo

Recriar com fidelidade a parte pública do site publicado de Gabriel Coraiola, preservando sua linguagem, hierarquia visual e fluxo de contato. A área administrativa fica fora desta primeira etapa.

## Escopo

- Página inicial com cabeçalho, apresentação, catálogo, filtros, seção sobre e contato.
- Três imóveis de demonstração equivalentes aos exibidos no site de referência.
- Páginas públicas de detalhes para cada imóvel.
- Filtros de tipo, valor máximo e quantidade de quartos executados no navegador.
- Links de WhatsApp usando temporariamente o número provisório já publicado.
- Layout responsivo e acessível em celular e desktop.

## Direção visual

Reprodução fiel do site atual: composição editorial imobiliária, cores sóbrias, tipografia elegante, cartões amplos e fotografia como elemento principal. Não haverá modernização ou mudança de marca nesta etapa.

## Arquitetura

O site será uma aplicação pública sem banco de dados. Os imóveis ficam em um módulo local tipado, reutilizado pela página inicial e pelas páginas de detalhes. Os filtros atuam sobre esses dados no cliente. Essa estrutura mantém a primeira etapa simples e permite conectar uma área administrativa persistente no futuro sem redesenhar a interface.

## Estados e erros

- Filtros sem correspondência mostram uma mensagem clara e permitem redefinir a busca.
- Uma rota de imóvel inexistente apresenta estado de não encontrado.
- Imagens terão dimensões reservadas, texto alternativo e fallback visual coerente.

## Validação

O projeto deve compilar sem erros, servir todas as rotas públicas, manter links e filtros funcionais e não apresentar rolagem horizontal indevida nos tamanhos usuais de celular e desktop.
