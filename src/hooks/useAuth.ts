import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/api/AuthAPI";
import { useAuthStore } from "@/contexts/auth-store";

export const useAuth = () => {
  const { user, clearUser } = useAuthStore();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 15, // Define el tiempo en el que se considera que los datos están desactualizados, en este caso 10 minutos
    gcTime: 1000 * 60 * 60 * 24, // Define el tiempo de vida de la cache, lo que quiere decir que si no se ha hecho un refetch en 24 horas, se limpiará la cache
  });

  return { data: user ?? data, isError, isLoading, clearUser };
};
