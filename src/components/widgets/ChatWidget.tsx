import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const chatSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  message: z.string().trim().min(1, "Mensagem é obrigatória").max(1000, "Mensagem muito longa")
});

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validar dados
      const validated = chatSchema.parse({ name, email, message });

      setSending(true);

      const { error } = await supabase
        .from('chat_messages')
        .insert([{
          name: validated.name,
          email: validated.email,
          message: validated.message
        }]);

      if (error) throw error;

      toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
      
      // Limpar formulário
      setName("");
      setEmail("");
      setMessage("");
      setIsOpen(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      } else {
        console.error('Erro ao enviar mensagem:', error);
        toast.error("Erro ao enviar mensagem. Tente novamente.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Chat Button with Label */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Animated Label */}
        {!isOpen && (
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            <p className="text-sm font-semibold whitespace-nowrap animate-pulse">
              Fale conosco
            </p>
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-primary"></div>
          </div>
        )}
        
        {/* Chat Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-xl hover:scale-110 transition-transform duration-300"
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 md:w-96 shadow-2xl z-50 animate-scale-in">
          <CardHeader className="gradient-primary text-primary-foreground">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Fale Conosco
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  disabled={sending}
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  disabled={sending}
                />
              </div>
              <div>
                <textarea
                  placeholder="Sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  maxLength={1000}
                  disabled={sending}
                  className="w-full min-h-[120px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {message.length}/1000 caracteres
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={sending}
              >
                {sending ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;
