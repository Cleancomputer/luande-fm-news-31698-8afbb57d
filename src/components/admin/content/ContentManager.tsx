import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseClient } from '@/lib/supabase-client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { RichTextEditor } from './RichTextEditor';

const ContentManager = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();

    const categoriesChannel = supabaseClient
      .channel('categories-content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, loadCategories)
      .subscribe();

    return () => { supabaseClient.removeChannel(categoriesChannel); };
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('name')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      setCategories(data?.map(cat => cat.name) || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  return <Card><div>Content Manager - Categories: {categories.join(', ')}</div></Card>;
};

export default ContentManager;
