import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SubmitNews = () => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !contact || !description) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrls: string[] = [];

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `submissions/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

          mediaUrls.push(publicUrl);
        }
      }

      // Insert submission
      const { error } = await supabase
        .from('user_submissions')
        .insert({
          name,
          contact,
          description,
          media_urls: mediaUrls
        });

      if (error) throw error;

      toast.success("Conteúdo enviado com sucesso! Iremos verificar e entraremos em contato.");
      
      // Reset form
      setName("");
      setContact("");
      setDescription("");
      setFiles([]);
    } catch (error) {
      console.error('Error submitting content:', error);
      toast.error("Erro ao enviar conteúdo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Envie sua Notícia</CardTitle>
              <CardDescription className="text-base">
                Tem uma notícia em primeira mão? Compartilhe conosco! Verificaremos e gratificaremos 
                conteúdos verdadeiros e exclusivos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome *</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Contato (Email ou Telefone) *</label>
                  <Input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Email ou telefone para contato"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Descrição da Notícia *</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva a notícia em detalhes..."
                    rows={8}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Imagens ou Vídeos</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      multiple
                      className="flex-1"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {files.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {files.length} arquivo(s) selecionado(s)
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  <Send className="h-5 w-5 mr-2" />
                  {isSubmitting ? "Enviando..." : "Enviar Notícia"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitNews;
