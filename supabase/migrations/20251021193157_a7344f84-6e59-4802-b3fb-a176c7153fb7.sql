-- Tabela de analytics
CREATE TABLE IF NOT EXISTS article_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  views integer DEFAULT 0,
  unique_views integer DEFAULT 0,
  avg_read_time integer DEFAULT 0,
  traffic_source text,
  created_at timestamp with time zone DEFAULT now(),
  date date DEFAULT CURRENT_DATE
);

ALTER TABLE article_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver analytics"
ON article_analytics FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Todos podem registrar views"
ON article_analytics FOR INSERT
WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analytics_article ON article_analytics(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON article_analytics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_traffic ON article_analytics(traffic_source);

-- Tabela de notificações push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  categories text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar subscriptions"
ON push_subscriptions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Usuários podem criar subscription"
ON push_subscriptions FOR INSERT
WITH CHECK (true);

-- Tabela de histórico de notificações
CREATE TABLE IF NOT EXISTS notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  article_id uuid REFERENCES articles(id),
  category text,
  sent_at timestamp with time zone DEFAULT now(),
  total_sent integer DEFAULT 0,
  total_clicked integer DEFAULT 0
);

ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar notificações"
ON notification_history FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Função para registrar view
CREATE OR REPLACE FUNCTION register_article_view(
  p_article_id uuid,
  p_traffic_source text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO article_analytics (article_id, views, traffic_source, date)
  VALUES (p_article_id, 1, p_traffic_source, CURRENT_DATE)
  ON CONFLICT (article_id, date, traffic_source) 
  DO UPDATE SET 
    views = article_analytics.views + 1;
END;
$$;