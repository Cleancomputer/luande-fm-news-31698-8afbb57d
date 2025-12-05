import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, Upload, Download, Loader2, X, Image as ImageIcon, Sparkles } from "lucide-react";

const Designer = () => {
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, insira um prompt para gerar a imagem");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image-designer', {
        body: { 
          prompt: prompt.trim(),
          referenceImage: uploadedImage 
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("Imagem gerada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar imagem. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download iniciado!");
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
  };

  const clearGeneratedImage = () => {
    setGeneratedImage(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
          <Wand2 className="h-8 w-8 text-primary" />
          Designer IA
        </h2>
        <p className="text-muted-foreground mt-1">
          Crie imagens incríveis usando inteligência artificial
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Criar Imagem
            </CardTitle>
            <CardDescription>
              Descreva a imagem que deseja criar ou faça upload de uma referência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Descreva a imagem que deseja criar... Ex: Uma paisagem tropical ao pôr do sol com palmeiras"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Imagem de Referência (opcional)</Label>
              {!uploadedImage ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? "Solte a imagem aqui..."
                      : "Arraste uma imagem ou clique para selecionar"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF, WEBP ou PDF
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Imagem de referência"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearUploadedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando imagem...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Gerar Imagem
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Resultado
            </CardTitle>
            <CardDescription>
              A imagem gerada aparecerá aqui
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Criando sua imagem...</p>
                <p className="text-xs text-muted-foreground mt-1">Isso pode levar alguns segundos</p>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Imagem gerada"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearGeneratedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Imagem
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
                <ImageIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  Nenhuma imagem gerada ainda
                </p>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Insira um prompt e clique em "Gerar Imagem"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-600/5">
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas para melhores resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Seja específico na descrição (cores, estilo, ambiente)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Mencione o estilo desejado (realista, ilustração, minimalista)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Use imagens de referência para guiar o resultado
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Inclua detalhes sobre iluminação e composição
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Designer;
