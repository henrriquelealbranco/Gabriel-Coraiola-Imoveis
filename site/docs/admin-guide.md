# Guia do painel de imóveis

## Primeiro acesso

Crie um usuário no Supabase Authentication e adicione o UUID dele à tabela `admin_users`. Depois, acesse `/admin/login` com o e-mail e a senha cadastrados.

## Cadastrar e publicar

1. Abra **Imóveis cadastrados** e escolha **Novo imóvel**.
2. Preencha código, endereço da página, título, valor, localização, características e descrição.
3. Comece com o status **Inativo** e salve.
4. Na edição, envie arquivos JPEG, PNG ou WebP de até 15 MB.
5. Use **Mover para cima** e **Mover para baixo** para definir a ordem. A primeira foto será carregada com prioridade na página pública.
6. Depois de adicionar pelo menos uma foto, altere o status para **Ativo**.

**Ativo** aparece no site; **Inativo** permanece somente no painel; **Vendido** deixa de aparecer publicamente sem apagar o cadastro.

Se uma imagem falhar, as demais concluídas são preservadas. Corrija o formato ou tamanho indicado e envie apenas o arquivo que falhou novamente.

O telefone do botão de contato é definido por `NEXT_PUBLIC_WHATSAPP_PHONE`, com código do país e DDD, somente números.
