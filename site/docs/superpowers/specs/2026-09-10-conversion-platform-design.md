# Plataforma imobiliária de conversão — especificação

## Objetivo

Evoluir o site público de Gabriel Coraiola para uma plataforma mobile-first voltada a campanhas de tráfego pago. A experiência deve priorizar fotos, informações essenciais e contato imediato via WhatsApp, com manutenção dos imóveis em um painel próprio.

## Decisão de arquitetura

Usar Next.js App Router com TypeScript e Tailwind para a aplicação, Supabase Postgres para os registros, Supabase Auth para autenticação administrativa e Supabase Storage para imagens. A implantação de referência será na Vercel, preservando compatibilidade com outro ambiente Next.js que suporte renderização no servidor.

Essa combinação reduz integrações e operações: um único serviço concentra dados, identidade, arquivos e políticas de acesso. PocketBase exigiria operação de servidor; um CMS externo reduziria código administrativo, mas criaria a dependência que o produto pretende evitar.

## Experiência pública

### Rota `/imovel/[slug]`

- Abrir diretamente na galeria, sem hero institucional antes das fotos.
- Exibir a primeira foto com prioridade alta e dimensões reservadas.
- Disponibilizar as demais imagens em carrossel horizontal com scroll-snap, swipe e controles acessíveis.
- Mostrar logo abaixo: título, código, valor, bairro/cidade, quartos, banheiros, vagas, área, descrição e status comercial pertinente.
- Manter CTA de WhatsApp fixo no rodapé do celular e em posição lateral no desktop.
- Gerar mensagem: `Olá, vi o imóvel [título/código] e quero agendar uma visita.`
- Renderizar somente imóveis com status `active` nas rotas públicas; registros inativos, vendidos ou inexistentes retornam não encontrado.

## Painel administrativo

### Rotas

- `/admin/login`: login por e-mail e senha.
- `/admin/imoveis`: busca, filtros e alteração rápida de status.
- `/admin/imoveis/novo`: cadastro.
- `/admin/imoveis/[id]`: edição, upload, ordenação e exclusão de fotos.

### Fluxo de cadastro

1. Salvar dados textuais do imóvel.
2. Criar pasta de Storage com o ID do imóvel.
3. Enviar imagens diretamente ao Storage com validação de tipo e tamanho.
4. Criar os registros das fotos com posição explícita.
5. Permitir reordenação e persistir as posições em uma única operação.

Falhas de upload devem manter o formulário e as imagens já concluídas, identificar arquivos com erro e permitir nova tentativa. Um imóvel só fica público quando seu status for `active` e houver pelo menos uma foto válida.

## Modelo de dados

### `properties`

- `id uuid primary key`
- `code text unique not null`
- `slug text unique not null`
- `title text not null`
- `description text not null`
- `price numeric(14,2) not null`
- `city text not null`
- `neighborhood text not null`
- `address text`
- `bedrooms smallint not null default 0`
- `bathrooms smallint not null default 0`
- `parking_spaces smallint not null default 0`
- `area_m2 numeric(10,2) not null`
- `status property_status not null default 'inactive'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

`property_status` terá os valores `active`, `inactive` e `sold`.

### `property_images`

- `id uuid primary key`
- `property_id uuid not null references properties(id) on delete cascade`
- `storage_path text unique not null`
- `alt_text text not null`
- `position integer not null`
- `width integer`
- `height integer`
- `created_at timestamptz not null default now()`

Adicionar índice único em `(property_id, position)` e índice para consulta pública em `properties(status, slug)`.

## Segurança

- Habilitar RLS em ambas as tabelas.
- Permitir leitura anônima apenas de imóveis `active` e de suas fotos.
- Permitir inserção, atualização e exclusão somente a usuários autenticados presentes em uma tabela `admin_users`.
- Manter a chave `service_role` exclusivamente no servidor.
- Restringir uploads a imagens JPEG, PNG ou WebP, com limite inicial de 15 MB por arquivo.
- Usar bucket público apenas para os arquivos publicados; operações de escrita continuam protegidas por políticas de Storage.

## Performance e acessibilidade

- Usar `next/image`, `sizes` responsivo, qualidade controlada e transformação do Supabase quando disponível.
- Carregar a primeira foto com `priority`/`fetchPriority="high"`; aplicar lazy loading às demais.
- Evitar biblioteca pesada de carrossel: usar CSS scroll-snap e JavaScript apenas para controles e indicador.
- Renderizar dados no servidor e limitar JavaScript cliente à galeria, CTA e formulários administrativos.
- Garantir navegação por teclado, texto alternativo, foco visível, alvos de toque de pelo menos 44 px e respeito a movimento reduzido.

## Validação

- Testes unitários para mensagem do WhatsApp, formatação monetária e validação do formulário.
- Testes de integração para políticas públicas/administrativas, criação de imóvel e ordenação de fotos.
- Teste de interface mobile para swipe, CTA fixo, estados de carregamento e erro.
- Auditoria de build, TypeScript, acessibilidade básica e Core Web Vitals antes da implantação.

## Fora do escopo inicial

- Integração com CRM.
- Portal multiusuário ou múltiplas imobiliárias.
- Chat interno, pagamentos, propostas e assinatura eletrônica.
- Automação de campanhas e analytics além dos eventos essenciais de visualização e clique no WhatsApp.
