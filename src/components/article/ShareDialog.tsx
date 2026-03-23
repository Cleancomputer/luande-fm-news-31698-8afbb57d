import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  Send,
} from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
  slug?: string;
}

export const ShareDialog = ({ open, onOpenChange, title, url, slug }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);

  const siteOrigin = "https://www.luandefm.net";

  const resolvedSlug = (() => {
    if (slug) {
      return slug;
    }

    try {
      return new URL(url).searchParams.get("slug") ?? undefined;
    } catch {
      return undefined;
    }
  })();

  const normalizedWhatsappUrl = resolvedSlug
    ? `${siteOrigin}/artigo/${encodeURIComponent(resolvedSlug)}`
    : url;

  const iosWhatsappPreviewUrl = (() => {
    const backendUrl = import.meta.env.VITE_SUPABASE_URL;

    if (!backendUrl || !resolvedSlug) {
      return normalizedWhatsappUrl;
    }

    return `${backendUrl}/functions/v1/article-share?slug=${encodeURIComponent(resolvedSlug)}&origin=${encodeURIComponent(siteOrigin)}`;
  })();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: Send,
      color: "hover:bg-green-500/10 hover:text-green-600",
      action: () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

        const whatsappMessage = isIOS
          ? iosWhatsappPreviewUrl
          : `${title} - ${normalizedWhatsappUrl}`;
        const whatsappUrl = isIOS
          ? `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`
          : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

        if (isIOS) {
          window.location.href = whatsappUrl;
          return;
        }

        window.open(whatsappUrl, "_blank");
      },
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "hover:bg-blue-500/10 hover:text-blue-600",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
          "width=600,height=400"
        );
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "hover:bg-sky-500/10 hover:text-sky-600",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank",
          "width=600,height=400"
        );
      },
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "hover:bg-blue-700/10 hover:text-blue-700",
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank",
          "width=600,height=400"
        );
      },
    },
    {
      name: "Telegram",
      icon: Send,
      color: "hover:bg-sky-400/10 hover:text-sky-500",
      action: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          "_blank"
        );
      },
    },
    {
      name: "Email",
      icon: Mail,
      color: "hover:bg-gray-500/10 hover:text-gray-600",
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Matéria</DialogTitle>
          <DialogDescription>
            Escolha como deseja compartilhar esta notícia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copiar Link */}
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={url}
              className="flex-1"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              size="icon"
              variant={copied ? "default" : "outline"}
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Opções de Compartilhamento */}
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.name}
                  variant="outline"
                  className={`flex flex-col h-auto py-4 gap-2 transition-colors ${option.color}`}
                  onClick={() => {
                    option.action();
                    onOpenChange(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{option.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
