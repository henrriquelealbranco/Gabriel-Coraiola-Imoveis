# Gabriel Coraiola Imóveis

Plataforma imobiliária mobile-first para campanhas de tráfego pago. A página pública começa pela galeria, apresenta os detalhes essenciais e mantém o contato por WhatsApp disponível. O painel interno permite cadastrar imóveis, gerenciar fotos e controlar a publicação.

## Stack

- Next.js/Vinext, React, TypeScript e Tailwind CSS
- Supabase PostgreSQL, Authentication e Storage
- Zod e Vitest

## Configuração

Copie `.env.example` para `.env.local` e preencha:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — somente no servidor
- `NEXT_PUBLIC_WHATSAPP_PHONE`

Execute a migração `supabase/migrations/202609100001_properties.sql` no projeto Supabase. Crie um usuário no Authentication e insira seu UUID em `admin_users`.

## Desenvolvimento

```bash
npm install
npm run dev
```

Verificações:

```bash
npm test
npm run lint
npm run build
```

Sem credenciais do Supabase, as páginas públicas usam os três imóveis de demonstração já incluídos. O painel exige a configuração completa do Supabase.

Consulte [docs/admin-guide.md](docs/admin-guide.md) para a rotina de cadastro e publicação.
