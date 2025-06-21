import { useMutation, useQuery } from "@tanstack/react-query";
import { MutationOptions, sdk } from "./base";
import {
  ApiKeyResponse,
  CreateRoleRequest,
  RegenerateApiKeyResponse,
  RoleResponse,
  UpdateApiKeyRequest,
  UpdateRoleRequest,
} from "@envsync-cloud/envsync-ts-sdk";
import { API_KEYS } from "../constants";
import { useInvalidateQueries } from "@/hooks/useApi";
import { features } from "process";

const getAccessLevel = (
  payload: Pick<RoleResponse, "is_admin" | "can_edit" | "can_view">
) => {
  if (payload.is_admin) return "admin";
  if (payload.can_edit) return "editor";
  if (payload.can_view) return "viewer";
  return "none";
};

const extractFeatures = (
  payload: Pick<
    RoleResponse,
    "have_api_access" | "have_billing_options" | "have_webhook_access"
  >
) => {
  const features: string[] = [];
  if (payload.have_api_access) features.push("api");
  if (payload.have_billing_options) features.push("billing");
  if (payload.have_webhook_access) features.push("webhook");

  return features;
};

export interface Role {
  id: string;
  name: string;
  color?: string;
  accessLevel: "admin" | "editor" | "viewer" | "none";
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const useAllRoles = () => {
  return useQuery({
    queryKey: ["roles/all"],
    queryFn: async () => {
      const roles = await sdk.roles.getAllRoles();

      return roles
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .map((role) => ({
          id: role.id,
          name: role.name,
          color: role.color || "#05c180",
          accessLevel: getAccessLevel(role),
          features: extractFeatures(role),
          createdAt: new Date(role.created_at),
          updatedAt: new Date(role.updated_at),
        })) satisfies Role[];
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 3,
  });
};

const useCreateRole = () => {
  const { invalidateRoles } = useInvalidateQueries();

  return useMutation({
    mutationFn: async (payload: CreateRoleRequest) => {
      const role = await sdk.roles.createRole(payload);
      return role;
    },
    onSettled: () => {
      invalidateRoles();
    },
  });
};

const useUpdateRole = () => {
  const { invalidateRoles } = useInvalidateQueries();

  return useMutation({
    mutationFn: async (payload: UpdateRoleRequest) => {
      const role = await sdk.roles.updateRole(payload.role_id, payload);
      return role;
    },
    onSettled: () => {
      invalidateRoles();
    },
  });
};

const useDeleteRole = () => {
  const { invalidateRoles } = useInvalidateQueries();

  return useMutation({
    mutationFn: async (id: string) => {
      const data = await sdk.roles.deleteRole(id);
      return data;
    },
    onSettled: () => {
      invalidateRoles();
    },
  });
};

export const roles = {
  getAllRoles: useAllRoles,
  createRole: useCreateRole,
  updateRole: useUpdateRole,
  deleteRole: useDeleteRole,
};
