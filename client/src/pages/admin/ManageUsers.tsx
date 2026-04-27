import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { userService } from "@/lib/services/user-service";
import { useAuth } from "@/hooks/use-auth";

import CreateUserForm from "./components/CreateUserForm";
import UpdateUserForm from "./components/UpdateUserForm";

const roleLabel: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

const ManageUsers = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"create" | "update" | "delete">(
    "create"
  );
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [selected, setSelected] = useState<IAdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAllUsers();
      if (res.success && res.data?.users) {
        setUsers(res.data.users);
      }
    } catch {
      toast.error("Failed to fetch users.");
    }
  };

  const onToggleActive = async (user: IAdminUser) => {
    if (user._id === currentUser?._id) {
      toast.error("You cannot deactivate your own account.");
      return;
    }
    setTogglingId(user._id);
    try {
      await userService.updateUser(user._id, { isActive: !user.isActive });
      toast.success(
        user.isActive
          ? "User deactivated. All sessions cleared."
          : "User activated successfully."
      );
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user status.");
    } finally {
      setTogglingId(null);
    }
  };

  const onDelete = async (user: IAdminUser) => {
    if (user._id === currentUser?._id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`))
      return;

    setIsSubmitting(true);
    try {
      await userService.deleteUser(user._id);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabBtnClass = (tab: string) =>
    `px-4! py-2! text-sm cursor-pointer ${
      activeTab === tab
        ? "bg-primary text-primary-foreground"
        : "bg-background text-foreground"
    }`;

  return (
    <div className="min-h-screen container mx-auto pb-10! max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6!">Manage Users</h1>

      <div className="mb-6">
        <div className="inline-flex rounded-md border overflow-hidden">
          <button
            className={tabBtnClass("create")}
            onClick={() => setActiveTab("create")}
          >
            Create
          </button>
          <button
            className={`${tabBtnClass("update")} border-l`}
            onClick={() => setActiveTab("update")}
          >
            Update
          </button>
          <button
            className={`${tabBtnClass("delete")} border-l`}
            onClick={() => setActiveTab("delete")}
          >
            Delete
          </button>
        </div>
      </div>

      {activeTab === "create" && <CreateUserForm onCreated={fetchUsers} />}

      {activeTab === "update" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-3 mt-4! md:mt-6!">
              <p className="text-sm text-muted-foreground">
                {users.length} user(s)
              </p>
              <div className="max-h-[400px] mt-3! overflow-auto border rounded-md divide-y">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className={`p-2! cursor-pointer hover:text-gray-900 hover:bg-accent ${
                      selected?._id === u._id ? "bg-accent text-gray-900" : ""
                    }`}
                    onClick={() => setSelected(u)}
                  >
                    <div className="font-medium capitalize">{u.name}</div>
                    <p className="text-xs text-muted-foreground">
                      {roleLabel[u.role]} ·{" "}
                      <span
                        className={
                          u.isActive ? "text-green-400" : "text-red-400"
                        }
                      >
                        {u.isActive ? "Active" : "Deactivated"}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold mb-4! text-white">
              Edit User
            </h2>
            {selected ? (
              <UpdateUserForm
                selected={selected}
                onUpdated={fetchUsers}
                onCleared={() => setSelected(null)}
              />
            ) : (
              <div className="text-muted-foreground">
                Select a user to edit
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "delete" && (
        <div className="max-w-3xl mt-4! md:mt-6! space-y-4">
          <p className="text-sm text-muted-foreground">
            {users.length} user(s)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3!">
            {users.map((u) => (
              <div
                key={u._id}
                className="border rounded-md p-3! flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium capitalize truncate">{u.name}</div>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email}
                  </p>
                  <p className="text-xs mt-0.5">
                    <span className="text-muted-foreground">
                      {roleLabel[u.role]} ·{" "}
                    </span>
                    <span
                      className={u.isActive ? "text-green-400" : "text-red-400"}
                    >
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleActive(u)}
                    disabled={
                      togglingId === u._id || u._id === currentUser?._id
                    }
                    className="cursor-pointer p-2! text-xs"
                  >
                    {togglingId === u._id
                      ? "..."
                      : u.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(u)}
                    disabled={isSubmitting || u._id === currentUser?._id}
                    className="cursor-pointer p-2! text-xs"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
