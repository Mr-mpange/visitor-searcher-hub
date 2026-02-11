import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Enums"]["service_type"];

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("favorites")
      .select("service_id")
      .eq("user_id", user.id);
    if (data) {
      setFavorites(new Set(data.map((f) => f.service_id)));
    }
    setLoading(false);
  };

  const toggleFavorite = useCallback(
    async (serviceId: string, serviceType: ServiceType) => {
      if (!user) return false;

      const isFav = favorites.has(serviceId);
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("service_id", serviceId);
        if (!error) {
          setFavorites((prev) => {
            const next = new Set(prev);
            next.delete(serviceId);
            return next;
          });
        }
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          service_type: serviceType,
          service_id: serviceId,
        });
        if (!error) {
          setFavorites((prev) => new Set(prev).add(serviceId));
        }
      }
      return !isFav;
    },
    [user, favorites]
  );

  const isFavorite = useCallback(
    (serviceId: string) => favorites.has(serviceId),
    [favorites]
  );

  return { favorites, loading, toggleFavorite, isFavorite };
}
