import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
      
      try {
        return await apiRequest("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Try to refresh token if access token is expired
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const refreshResponse = await apiRequest("/api/auth/refresh", {
              method: "POST",
              body: JSON.stringify({ refreshToken }),
            });
            localStorage.setItem("accessToken", refreshResponse.accessToken);
            
            // Retry with new token
            return await apiRequest("/api/auth/me", {
              headers: {
                Authorization: `Bearer ${refreshResponse.accessToken}`,
              },
            });
          } catch (refreshError) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            return null;
          }
        }
        return null;
      }
    },
    retry: false,
  });

  const logout = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await apiRequest("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.log("Logout request failed, clearing local storage anyway");
      }
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}
