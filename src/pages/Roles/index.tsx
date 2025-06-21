import { api } from "@/api";
import {
  AlertTriangle,
  ChevronsLeftRightEllipsis,
  Code,
  Crown,
  DollarSign,
  Eye,
  LockKeyhole,
  Pencil,
  Plus,
  Shield,
  ShieldAlert,
  Shuffle,
  User2,
  Webhook,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cloneElement, useMemo, useState } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  cn,
  formatLastUsed,
  generateColorShades,
  getRandomHexCode,
  isLightColor,
} from "@/lib/utils";
import { CreateRoleRequest } from "@envsync-cloud/envsync-ts-sdk";
import { Function } from "@/utils/env";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Role } from "@/api/roles.api";
import { useRolesTable } from "@/hooks/useRoles";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { DialogClose } from "@radix-ui/react-dialog";

const accessLevelIcon: Record<
  "none" | "viewer" | "editor" | "admin",
  React.ReactNode
> = {
  none: <X className="inline mr-2" size={16} />,
  viewer: <Eye className="inline mr-2" size={16} />,
  editor: <Pencil className="inline mr-2" size={16} />,
  admin: <LockKeyhole className="inline mr-2" size={16} />,
};

const featuresIcons: Record<string, React.ReactNode> = {
  api: <ChevronsLeftRightEllipsis className="inline mr-1" size={12} />,
  webhook: <Webhook className="inline mr-1" size={12} />,
  billing: <DollarSign className="inline mr-1" size={12} />,
};

const getRoleIcon = (role: Role) => {
  if (role.accessLevel === "admin" && role.features.length === 3) return Crown;
  if (role.features.includes("billing")) return DollarSign;
  if (role.accessLevel === "admin") return Shield;
  if (role.accessLevel === "editor") return Code;
  if (role.accessLevel === "viewer") return Eye;
  return User2;
};

const getLogo = (role: Role) => {
  const Icon = getRoleIcon(role);
  const isLight = isLightColor(role.color);
  const { light, dark } = generateColorShades(role.color, 60);

  return (
    <div
      style={{
        backgroundColor: role.color,
        color: isLight ? dark : light,
        // borderColor: isLight ? dark : light,
        // borderWidth: 1,
      }}
      className="size-8 rounded-md shadow bg-gray-700 flex items-center justify-center"
    >
      {<Icon className="size-4 text-inherit" />}
    </div>
  );
};

export const Roles = () => {
  const roles = useRolesTable();
  const updateRole = api.roles.updateRole();
  const deleteRole = api.roles.deleteRole();

  return (
    <div className="flex flex-col items-start sm:items-center justify-between gap-4">
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-3xl font-bold text-white">Roles</h1>
          <p className="text-slate-400 mt-2">
            Manage roles and assign permissions to control what users can access
            across the platform.
          </p>
        </div>
        <RoleEditForm />
      </div>
      <Card className="bg-gray-800 w-full mt-2 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <ShieldAlert className="size-8 mr-3 bg-electric_indigo-400 border border-electric_indigo-600 p-2 stroke-[3] text-white rounded-md" />
            Roles ({roles.data?.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {[
                    "Name",
                    "Access Level",
                    "Features",
                    "Assigned",
                    "Created",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left py-3 px-4 text-gray-400 font-medium"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.data?.map((role) => (
                  <tr
                    key={role.id}
                    className="border-b border-gray-700 hover:bg-gray-750"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium flex gap-2 items-center text-white">
                          {getLogo(role)}
                          {role.name || "Untitled"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-400">
                        {accessLevelIcon[role.accessLevel]}
                        {role.accessLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center flex-wrap gap-1">
                        {role.features.length > 0 ? (
                          role.features.map((feature) => (
                            <span
                              key={feature}
                              className={`text-xs flex-nowrap flex items-center px-2 py-1 rounded ${
                                feature === "billing"
                                  ? "bg-green-900 text-green-300"
                                  : feature === "webhook"
                                  ? "bg-electric_indigo-300 text-electric_indigo-900"
                                  : feature === "api"
                                  ? "bg-yellow-900 text-yellow-300"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {featuresIcons[feature] || null}
                              {feature.toUpperCase()}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">
                            No features assigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {role.users.length > 0 ? (
                        <AvatarGroup
                          items={role.users.map((user) => ({
                            name: user.full_name,
                            avatar: user.profile_picture_url,
                          }))}
                          show={3}
                          className="max-w-[200px]"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">
                          No users assigned
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-400">
                        {formatLastUsed(new Date(role.createdAt))}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <RoleEditForm prefills={role} edit>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white border-gray-600 hover:bg-gray-700"
                            // onClick={() => roles.handleEditRole(role.id)}
                          >
                            <Pencil className="size-3" />
                          </Button>
                        </RoleEditForm>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-400 border-red-600 hover:bg-red-900/20 hover:text-red-300"
                            >
                              <X className="size-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-800 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-white flex items-center gap-2">
                                <AlertTriangle
                                  className="text-red-400"
                                  size={20}
                                />{" "}
                                Delete Role
                              </DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Are you sure you want to delete the role{" "}
                                <span className="font-semibold">
                                  {role.name || "Untitled"}
                                </span>
                                ? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            {role.users.length > 0 && (
                              <p className="text-red-400 bg-gray-900 p-2 border border-red-400/40 rounded-md text-sm">
                                Note: This role cannot be deleted as it has{" "}
                                {role.users.length} user(s) assigned to it.
                              </p>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button
                                  variant="outline"
                                  className="text-white border-gray-600 hover:bg-gray-700"
                                >
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() => deleteRole.mutate(role.id)}
                                disabled={
                                  deleteRole.isPending || role.users.length > 0
                                }
                              >
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {roles.data?.length === 0 && (
            <div className="text-center py-12">
              <ShieldAlert className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Roles</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Create your first API key to start using EnvSync services. API
                keys allow you to authenticate and access our APIs
                programmatically.
              </p>
              <Button className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create New Role
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const RoleEditForm = ({
  prefills,
  edit = false,
  children,
}: {
  prefills?: Partial<Role>;
  edit?: boolean;
  children?: JSX.Element;
} = {}) => {
  const [name, setRoleName] = useState(prefills?.name || "");
  const [accessLevel, setAccessLevel] = useState<string>(
    prefills?.accessLevel || "none"
  );
  const [color, setColor] = useState(prefills?.color || getRandomHexCode);
  const [features, setFeatures] = useState<string[]>(prefills?.features || []);
  const [open, setOpen] = useState(false);

  const unsavedChanges = useMemo(() => {
    if (!edit) return false;
    return (
      name !== prefills?.name ||
      accessLevel !== prefills?.accessLevel ||
      color !== prefills?.color ||
      features.join(",") !== prefills?.features?.join(",")
    );
  }, [
    edit,
    name,
    accessLevel,
    color,
    features,
    prefills?.name,
    prefills?.accessLevel,
    prefills?.color,
    prefills?.features,
  ]);

  const roles = api.roles.getAllRoles();
  const createRoleMutation = api.roles.createRole();
  const updateRoleMutation = api.roles.updateRole();

  const generatePayload = () => {
    const payload: CreateRoleRequest = {
      name,
      color,
      can_edit: false,
      can_view: false,
      is_admin: false,
      have_api_access: features.includes("api"),
      have_webhook_access: features.includes("webhook"),
      have_billing_options: features.includes("billing"),
    };

    if (accessLevel === "admin") {
      payload.is_admin = true;
      payload.can_edit = true;
      payload.can_view = true;
    } else if (accessLevel === "editor") {
      payload.can_edit = true;
      payload.can_view = true;
    } else if (accessLevel === "viewer") {
      payload.can_view = true;
    }

    return payload;
  };

  const handleResetForm = () => {
    setRoleName("");
    setAccessLevel("none");
    setColor(getRandomHexCode());
    setFeatures([]);
  };

  const handleCreateRole = () => {
    const payload = generatePayload();

    createRoleMutation.mutate(payload, {
      onSuccess: () => {
        handleResetForm();
        roles.refetch();
        setOpen(false);
      },
    });
  };

  const handleUpdateRole = () => {
    if (!prefills?.name) return;

    const payload = generatePayload();

    updateRoleMutation.mutate(
      { role_id: prefills.id || "", ...payload },
      {
        onSuccess: () => {
          handleResetForm();
          roles.refetch();
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          cloneElement(children, { disabled: createRoleMutation.isPending })
        ) : (
          <Button
            className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
            disabled={createRoleMutation.isPending}
          >
            <Plus className="size-4 mr-2" />
            Create Role
          </Button>
        )}
      </DialogTrigger>
      <DialogContent hideCloseButton className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            {edit ? "Edit Role" : "Create New Role"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Roles define sets of permissions that can be assigned to users.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white" htmlFor="role-name">
              Name *
            </Label>
            <Input
              placeholder="Enter role name"
              id="role-name"
              value={name}
              onChange={(e) => setRoleName(e.target.value)}
              className="bg-gray-900"
            />
          </div>
          <div className="space-2 flex gap-2">
            <div className="space-y-2 w-full">
              <Label className="text-white" htmlFor="access-level">
                Access Level *
              </Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-white">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem
                    value="none"
                    className="text-white hover:bg-gray-700"
                  >
                    <X className="inline mr-2" size={16} />
                    None
                  </SelectItem>
                  <SelectItem
                    value="viewer"
                    className="text-white hover:bg-gray-700"
                  >
                    <Eye className="inline mr-2" size={16} />
                    View
                  </SelectItem>
                  <SelectItem
                    value="editor"
                    className="text-white hover:bg-gray-700"
                  >
                    <Pencil className="inline mr-2" size={16} />
                    Edit
                  </SelectItem>
                  <SelectItem
                    value="admin"
                    className="text-white hover:bg-gray-700"
                  >
                    <LockKeyhole className="inline mr-2" size={16} />
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-full">
              <Label className="text-white" htmlFor="access-level">
                Color
              </Label>
              <ColorSelector color={color} setColor={setColor} />
            </div>
          </div>
          <div className="space-y-2 w-full">
            <Label className="text-white" htmlFor="description">
              Features
            </Label>
            <MultiSelect
              items={[
                {
                  label: (
                    <h1 className="flex items-center gap-1">
                      <ChevronsLeftRightEllipsis size={16} /> API
                    </h1>
                  ),
                  value: "api",
                },
                {
                  label: (
                    <h1 className="flex items-center gap-1">
                      <Webhook size={16} /> Webhook
                    </h1>
                  ),
                  value: "webhook",
                },
                {
                  label: (
                    <h1 className="flex items-center gap-1">
                      <DollarSign size={16} /> Billing
                    </h1>
                  ),
                  value: "billing",
                },
              ]}
              value={features}
              onChange={setFeatures}
              placeholder="Select features"
              className="bg-slate-900 min-h-10 size-full rounded-md border border-slate-700 hover:bg-slate-900 text-white font-mono flex items-center justify-start p-2"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Close
            </Button>
          </DialogClose>
          {edit ? (
            <Button
              onClick={handleCreateRole}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              disabled={!unsavedChanges || updateRoleMutation.isPending}
            >
              Update
            </Button>
          ) : (
            <Button
              onClick={handleCreateRole}
              className="bg-electric_indigo-500 hover:bg-electric_indigo-600 text-white"
              disabled={!name || createRoleMutation.isPending}
            >
              Create
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ColorSelector = ({
  color,
  setColor,
}: {
  color: string;
  setColor: Function<string>;
}) => {
  return (
    <div className="bg-slate-900 h-10 size-full rounded-md border border-slate-700 text-white font-mono flex items-center justify-start p-2">
      <Label
        className="w-5 cursor-pointer aspect-square rounded-full"
        style={{ backgroundColor: color }}
        htmlFor="color-picker"
      >
        <Input
          id="color-picker"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="size-0 invisible rounded-full text-white cursor-pointer"
        />
      </Label>
      <input
        type="text"
        value={color.toUpperCase()}
        onChange={(e) => setColor(e.target.value.toUpperCase())}
        className="bg-transparent flex-1 h-full border-none text-white font-mono ml-2 w-full ring-0! outline-none! border-none! 
                        select-all focus-within:ring-0 focus-within:outline-none focus-within:border-none"
        placeholder="#6366f1"
      />
      <button
        onClick={() => {
          const color = getRandomHexCode();
          setColor(color);
        }}
      >
        <Shuffle size={16} />
      </button>
    </div>
  );
};

export default Roles;
