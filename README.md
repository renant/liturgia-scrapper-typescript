# Liturgia News - Newsletter Católica Diária

[Liturgianews - Site](https://www.liturgianews.site)

[Liturgianews - Github](https://github.com/renant/liturgianewssite)

## 📝 Sobre o Projeto

O Liturgia News é um serviço automatizado que envia diariamente por e-mail as leituras da liturgia católica e informações sobre o santo do dia. O projeto utiliza web scraping para coletar dados de fontes confiáveis e enviar newsletters formatadas de maneira elegante e legível.

## ✨ Funcionalidades

- 📧 Envio diário de e-mails com as leituras litúrgicas, uma vez por data

- 📰 Publicação antecipada das páginas da liturgia (hoje até hoje + N dias)

- 👥 Informações sobre o santo do dia

- 🎨 Template responsivo e bem formatado

- 🔄 Automação através de tarefas agendadas em `America/Sao_Paulo`

## Publicação antecipada e envio

O processo tem dois trabalhos, os dois no fuso `America/Sao_Paulo`:

- **05:30** publica a liturgia de hoje até hoje + `DAYS_AHEAD` (padrão 30).
- **06:00** envia o e-mail somente da liturgia de hoje.

Datas, slugs (`14-outubro-2026`) e o assunto do e-mail usam o calendário de São Paulo, não o fuso do servidor.

### Páginas (`public.newsletter`)

O scraper lê o calendário de [liturgia.cancaonova.com](https://liturgia.cancaonova.com/pb). Cada dia vem do link `sDia` / `sMes` / `sAno`. Se o mês ainda não tem links, esse dia é ignorado e o restante continua. A página só é gravada se a data exibida e o slug canônico baterem com o dia pedido.

Há uma pausa entre pedidos à Canção Nova (`SCRAPE_DELAY_MS`, padrão 1500).

A reflexão (Paulus) e as notícias do Vaticano só existem para o dia de hoje. Elas não são copiadas para datas futuras. Se uma dessas fontes falhar, o valor já salvo não é apagado.

Regras de `"pagina-gerada"`:

- Data nova: insere com `"pagina-gerada" = false`, para o n8n gerar a página.
- Data já existente entre hoje e hoje+3: busca de novo. Se o conteúdo mudou, atualiza a linha e volta `"pagina-gerada"` para `false`, para a página ser regenerada. Se não mudou, a linha não é escrita e a flag fica como está.
- Data já existente depois de hoje+3: não busca de novo. Quando esse dia entrar na janela de 3 dias, correções passam a ser lidas.

O fluxo n8n que gera páginas não precisa mudar: continua lendo `newsletter` onde `"pagina-gerada" = false`, em qualquer data. Linhas futuras com a flag falsa são intencionais. O scraper nunca marca a flag como `true`.

### E-mail (`public.newsletter_send`)

O envio não usa a linha da página como trava. Antes de chamar a Resend, o job toma a data de hoje em `newsletter_send` (`claim_newsletter_send`). Se a data já foi enviada, está em andamento, ou falhou depois de existir um broadcast, não envia de novo. Se não houver leituras para hoje, não envia e não toma a trava. Erro da Resend marca a linha como `failed` e sobe a exceção; o processo em produção continua de pé para o cron do dia seguinte.

Um `failed` sem `broadcast_id` pode ser tentado de novo se o envio rodar outra vez na mesma data (por exemplo `RUN_NOW=true`). Datas futuras nunca entram nessa tabela.

### Migrações

Pare o container antigo, rode os SQL abaixo no editor do Supabase, nesta ordem, e só então suba esta versão. O scraper anterior grava a linha do dia sem `liturgy_date`; se ele rodar no meio da migração, o backfill não vê essa linha nova.

1. `migrations/001_drop_unused_newsletter_columns.sql` — remove `liturgia-telegram`, `liturgia-reddit` e `twitter-send` (não são usadas).
2. `migrations/002_add_newsletter_liturgy_date.sql` — cria e preenche `liturgy_date`.
3. `migrations/003_unique_newsletter_slug_and_liturgy_date.sql` — índice único em `slug` e `liturgy_date`. Se houver duplicata, o script para e não apaga nada. Os `SELECT` e `DELETE` de deduplicação estão comentados no topo do arquivo (mantém a linha com página já gerada, senão o maior `id`). Rode o dedupe e execute o arquivo de novo.
4. `migrations/004_newsletter_send.sql` — tabela e função de claim do e-mail.

RLS continua desligado nas duas tabelas. Ligar RLS sem policies quebraria o n8n e este scraper, que usam a anon key. Isso fica para um passo futuro, junto com a troca para a service role.

### Variáveis

Ver `.env.sample`. Além das já existentes (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `IS_PRODUCTION`, `RUN_NOW`, `ADD_DONATE`, `EMAIL_DEV_TEST`):

- `DAYS_AHEAD` — dias após hoje para publicar. Padrão `30`. Use `0` para publicar só hoje.
- `SCRAPE_DELAY_MS` — pausa entre pedidos à Canção Nova. Padrão `1500`.

`IS_PRODUCTION=true` agenda os crons. `RUN_NOW=true` também roda publicação e envio uma vez na subida. Fora de produção, os dois rodam na hora; o claim impede um segundo e-mail na mesma data.

## 🚀 Tecnologias Utilizadas

- TypeScript

- Node.js

- Puppeteer (web scraping)

- React (templates de e-mail)

- Docker

- Resend (serviço de e-mail)

## 🤝 Créditos

- Leituras diárias: Canção Nova

- Informações dos santos: Católico App

## 🔒 Aviso Legal

Este projeto não tem afiliação oficial com a Igreja Católica ou qualquer uma das fontes de dados utilizadas. É um projeto independente criado para facilitar o acesso às informações litúrgicas diárias.
