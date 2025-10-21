import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";

interface Poll {
  id: string;
  question: string;
  options: string[];
  active: boolean;
}

const PollsManager = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Erro ao carregar enquetes");
      return;
    }

    setPolls((data || []) as Poll[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Adicione pelo menos 2 opções");
      return;
    }

    const { error } = await supabase
      .from('polls')
      .insert([{
        question,
        options: validOptions,
        active,
      }]);

    if (error) {
      toast.error("Erro ao criar enquete");
      return;
    }

    toast.success("Enquete criada com sucesso!");
    setQuestion("");
    setOptions(["", ""]);
    setActive(true);
    loadPolls();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta enquete?")) return;

    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erro ao excluir enquete");
      return;
    }

    toast.success("Enquete excluída com sucesso!");
    loadPolls();
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Enquete</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Pergunta</Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Qual é a sua opinião sobre..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Opções</Label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Opção ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addOption} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Opção
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
              <Label htmlFor="active">Ativar imediatamente</Label>
            </div>

            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Criar Enquete
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {polls.map((poll) => (
          <Card key={poll.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{poll.question}</h3>
                  <ul className="mt-2 space-y-1">
                    {poll.options.map((option, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {option}
                      </li>
                    ))}
                  </ul>
                  <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${poll.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {poll.active ? "Ativa" : "Inativa"}
                  </span>
                </div>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(poll.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PollsManager;
