import { useState } from "react";
import { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } from "@/store/api/userApi";
import { useAppSelector } from "@/store/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, UserCheck } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "destructive",
  ADMIN: "default",
  EDITOR: "secondary",
  CUSTOMER: "outline",
};

const Users = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "super_admin";

  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGetUsersQuery({ page, role: roleFilter || undefined, search: search || undefined });
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const users = data?.data || [];

  const handleRoleChange = async (userId: string, role: string) => {
    await updateUser({ id: userId, role: role as any });
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    await updateUser({ id: userId, isActive: !isActive });
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm("Delete this user? This cannot be undone.")) {
      await deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-xs"
            />
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === "ALL" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      {isSuperAdmin && user.id !== currentUser?.id ? (
                        <Select value={user.role} onValueChange={(v) => handleRoleChange(user.id, v)}>
                          <SelectTrigger className="w-32 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="EDITOR">Editor</SelectItem>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={ROLE_COLORS[user.role] as any || "outline"}>{user.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="outline" className="h-7 w-7"
                            onClick={() => handleToggleActive(user.id, user.isActive)}
                            title={user.isActive ? "Deactivate" : "Activate"}>
                            <UserCheck size={14} />
                          </Button>
                          {user.id !== currentUser?.id && (
                            <Button size="icon" variant="outline" className="h-7 w-7 text-destructive"
                              onClick={() => handleDelete(user.id)} title="Delete">
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
