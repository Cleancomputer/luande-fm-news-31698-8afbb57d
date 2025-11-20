-- Criar tabela de eventos
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  event_type TEXT NOT NULL, -- show, palestra, festa, comunitario, outro
  image_url TEXT,
  organizer TEXT,
  contact_info TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem ver eventos publicados"
ON public.events
FOR SELECT
USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem inserir eventos"
ON public.events
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem atualizar eventos"
ON public.events
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins podem deletar eventos"
ON public.events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();