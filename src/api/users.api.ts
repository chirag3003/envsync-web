import { useQuery } from "@tanstack/react-query";
import { sdk } from "./base";
import { API_KEYS } from "@/constants";

const useAllUsers = () => {
  return useQuery({
    queryKey: [API_KEYS.ALL_USERS],
    queryFn: async () => {
      const usersData = await sdk.users.getUsers();

      return usersData.map((user) => ({
        ...user,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at),
      }));
    },
    refetchOnWindowFocus: false,
  });
};

export const users = {
  getAllUsers: useAllUsers,
};
