import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const CategoriesManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  };

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Digite o nome da categoria");
      return;
    }

    try {
      const slug = createSlug(newCategory);
      const maxOrder = Math.max(...categories.map(c => c.display_order), 0);

      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategory,
          slug,
          display_order: maxOrder + 1
        });

      if (error) throw error;
      
      toast.success("Categoria adicionada com sucesso");
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error("Erro ao adicionar categoria");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Categoria ${!currentStatus ? 'ativada' : 'desativada'}`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error("Erro ao atualizar categoria");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Categoria excluída");
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Erro ao excluir categoria");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Categorias</CardTitle>
        <CardDescription>Adicione, edite ou remova categorias do portal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input
            placeholder="Nova categoria..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
          />
          <Button onClick={addCategory}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={category.is_active}
                  onCheckedChange={() => toggleActive(category.id, category.is_active)}
                />
                <div>
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-muted-foreground">/{category.slug}</div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCategory(category.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesManager;
