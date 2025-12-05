-- Create table for discussion comments on articles
CREATE TABLE public.article_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  emoji TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.article_discussions ENABLE ROW LEVEL SECURITY;

-- Public can view all comments
CREATE POLICY "Anyone can view comments" 
ON public.article_discussions 
FOR SELECT 
USING (true);

-- Anyone can insert comments (public discussion)
CREATE POLICY "Anyone can insert comments" 
ON public.article_discussions 
FOR INSERT 
WITH CHECK (true);

-- Enable realtime for discussions
ALTER PUBLICATION supabase_realtime ADD TABLE public.article_discussions;