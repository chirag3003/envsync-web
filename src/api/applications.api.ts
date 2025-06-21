import { useMutation, useQuery } from "@tanstack/react-query";
import { MutationOptions, sdk } from "./base";
import {
  ApiKeyResponse,
  RegenerateApiKeyResponse,
  UpdateApiKeyRequest,
} from "@envsync-cloud/envsync-ts-sdk";
import { API_KEYS, App } from "../constants";
import { useInvalidateQueries } from "@/hooks/useApi";

const useApplications = ({ refetchInterval = 5 * 60 * 1000 } = {}) => {
  return useQuery({
    queryKey: [API_KEYS.ALL_APPLICATIONS],
    queryFn: async () => {
      const appsData = await sdk.applications.getApps();

      /**
       * 
      const res = await Promise.all(
        appsData.map(async (app) => {
          let vars = 0,
            secs = 0;

          console.log(app.env_types);

          for (const envType of app.env_types) {
            const envs = await sdk.environmentVariables.getEnvs({
              app_id: app.id,
              env_type_id: envType.id,
            });

            for (const env of envs) {
              if (env.key.toLowerCase().includes("_key")) secs++;
              else vars++;
            }
          }

          return {
            id: app.id,
            org_id: app.org_id,
            name: app.name,
            description: app.description || "",
            created_at: new Date(app.created_at),
            updated_at: new Date(app.updated_at),
            metadata: app.metadata || {},
            status: "active",
            env_count: vars,
            secret_count: secs,
          };
        })
      );
       */

      return appsData.map(
        (app): App => ({
          id: app.id,
          org_id: app.org_id,
          name: app.name,
          description: app.description || "",
          created_at: new Date(app.created_at),
          updated_at: new Date(app.updated_at),
          metadata: app.metadata || {},
          status: "active",
          env_count: app.envCount ?? 0,
          secret_count: 0,
        })
      );
    },
    refetchInterval, // Refetch every 5 minutes
    retry: 3,
    initialData: [],
  });
};

export const applications = {
  allApplications: useApplications,
};
