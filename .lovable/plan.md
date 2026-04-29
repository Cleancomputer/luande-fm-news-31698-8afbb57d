## Objetivo

Gerar um único arquivo `.sql` contendo o **esquema completo** do seu banco de dados atual (Lovable Cloud), pronto para ser executado em qualquer projeto Supabase novo (ou usado como backup). O arquivo **não conterá dados** — apenas a estrutura.

O arquivo será salvo em `/mnt/documents/schema_backup.sql` para download.

## O que será incluído no arquivo

1. **Extensões necessárias**
   - `unaccent` (usada pela função `generate_slug`)
   - `pgcrypto` (para `gen_random_uuid()`)

2. **Tipos ENUM**
   - `app_role` com valores: `admin`, `user`, `editor`

3. **Tabelas** (16 no total) com todas as colunas, defaults e nullability:
   - `articles`, `article_analytics`, `article_discussions`, `article_versions`
   - `categories`, `chat_messages`, `events`
   - `instagram_config`, `media_library`, `notification_history`
   - `polls`, `poll_votes`, `push_subscriptions`
   - `user_roles`, `user_submissions`

4. **Constraints**
   - Primary keys
   - Unique constraints (ex: `articles.slug`, `categories.name`, `push_subscriptions.endpoint`, `user_roles(user_id, role)`)
   - Foreign keys (incluindo referências para `auth.users`)
   - Check constraint do `user_submissions.status`

5. **Índices secundários**
   - `idx_analytics_article`, `idx_analytics_date`, `idx_analytics_traffic`
   - `idx_articles_featured`, `idx_articles_scheduled`, `idx_articles_slug`, `idx_articles_status`, `idx_articles_tags` (GIN)

6. **Funções (security definer)**
   - `has_role(uuid, app_role)`
   - `generate_slug(text)`
   - `set_article_slug()` (trigger)
   - `register_article_view(uuid, text)`
   - `update_updated_at_column()` (trigger)

7. **Triggers** correspondentes (set_article_slug em `articles`, update_updated_at em tabelas com `updated_at`).

8. **Row-Level Security**
   - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` em todas as tabelas
   - Todas as políticas atuais (SELECT/INSERT/UPDATE/DELETE/ALL) recriadas exatamente como existem hoje

9. **Comentários no arquivo** explicando cada seção, para facilitar a leitura.

## O que NÃO será incluído

- Dados das tabelas (artigos, categorias, etc.) — apenas estrutura
- Configurações de Auth (provedores, templates de email)
- Buckets de Storage (`media`) — esses precisam ser criados manualmente no painel
- Edge Functions — vivem no código do projeto, não no banco
- Secrets

## Como você poderá usar o arquivo

1. Baixar o arquivo `schema_backup.sql` quando estiver pronto
2. Em um novo projeto Supabase: abrir o **SQL Editor** → colar o conteúdo → executar
3. O schema completo será recriado, idêntico ao atual

## Observação importante

Este plano **não altera nada** no seu projeto atual. Apenas lê o schema e gera um arquivo de backup em `/mnt/documents/`. Seu site, banco e código continuam exatamente como estão.

Após sua aprovação, gero o arquivo e disponibilizo para download.