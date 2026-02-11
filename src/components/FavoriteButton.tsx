import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Enums"]["service_type"];

interface FavoriteButtonProps {
  serviceId: string;
  serviceType: ServiceType;
  isFavorite: boolean;
  onToggle: (serviceId: string, serviceType: ServiceType) => Promise<boolean>;
  className?: string;
}

export const FavoriteButton = ({
  serviceId,
  serviceType,
  isFavorite,
  onToggle,
  className,
}: FavoriteButtonProps) => {
  const { user } = useAuth();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in to save favorites");
      return;
    }
    const added = await onToggle(serviceId, serviceType);
    toast.success(added ? "Added to favorites" : "Removed from favorites");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
        className
      )}
      onClick={handleClick}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-colors",
          isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
        )}
      />
    </Button>
  );
};
