import { api } from "@/api";
import { API_KEYS } from "@/constants";
import { useQuery } from "@tanstack/react-query";

export const useRolesTable = () => {
  const roles = api.roles.getAllRoles();
  const users = api.users.getAllUsers();

  return useQuery({
    queryKey: [API_KEYS.ALL_ROLES, "table"],
    queryFn: async () => {
      const rolesData = roles.data;
      const usersData = users.data;

      return rolesData.map((role) => ({
        ...role,
        users: usersData.filter((user) => user.role_id === role.id),
      }));
    },
    retry: 3,
    initialData: [],
    refetchInterval: 1 * 60 * 1000,
    enabled: !!roles.data && !!users.data,
  });
};
