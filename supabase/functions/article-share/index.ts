import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const DEFAULT_SITE_URL = 'https://luandefm.net'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const getAllowedOrigin = (origin: string | null) => {
  if (!origin) return DEFAULT_SITE_URL

  try {
    const parsed = new URL(origin)
    const allowedHosts = [
      'luandefm.net',
      'www.luandefm.net',
      'luande-fm-news-31698.lovable.app',
    ]

    if (allowedHosts.includes(parsed.hostname) || parsed.hostname.endsWith('.lovable.app')) {
      return parsed.origin
    }
  } catch {
    // ignore invalid origin
  }

  return DEFAULT_SITE_URL
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const slug = url.searchParams.get('slug')
    const origin = getAllowedOrigin(url.searchParams.get('origin'))

    if (!slug) {
      return Response.redirect(origin, 302)
    }

    const articleUrl = `${origin}/artigo/${encodeURIComponent(slug)}`

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    const { data: article, error } = await supabaseAdmin
      .from('articles')
      .select('title, subtitle, image_url, slug')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()

    if (error || !article) {
      return Response.redirect(articleUrl, 302)
    }

    const title = article.title || 'Portal Luandê Notícias'
    const description = article.subtitle || article.title || 'Leia esta matéria no Portal Luandê Notícias.'
    const imageUrl = article.image_url || `${origin}/favicon.png`

    const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Portal Luandê Notícias" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:url" content="${escapeHtml(articleUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="${escapeHtml(articleUrl)}" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(articleUrl)}" />
  </head>
  <body>
    <script>
      window.location.replace(${JSON.stringify(articleUrl)})
    </script>
    <p>Redirecionando para a matéria...</p>
    <p><a href="${escapeHtml(articleUrl)}">Clique aqui se não for redirecionado.</a></p>
  </body>
</html>`

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('article-share error:', error)
    return new Response('Erro ao gerar preview', {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }
})
