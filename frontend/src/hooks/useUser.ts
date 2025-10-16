import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/usersApi";
import type { User } from "../types/user";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await getUsers();
      return res.data;
    },
  });
}

export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await getUserById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onMutate: () => toast.loading("Creating user..."),
    onSuccess: (response) => {
      toast.dismiss();
      const newUser = response.data;
      toast.success("User created!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.setQueryData(["user", newUser.id], newUser);
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to create user.");
      console.error(err);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onMutate: () => toast.loading("Updating user..."),
    onSuccess: (response, { id }) => {
      toast.dismiss();
      const updatedUser = response.data;
      toast.success("User updated!");
      queryClient.setQueryData(["user", id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to update user.");
      console.error(err);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onMutate: () => toast.loading("Deleting user..."),
    onSuccess: (_, { id }) => {
      toast.dismiss();
      toast.success("User deleted.");
      queryClient.removeQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error("Failed to delete user.");
      console.error(err);
    },
  });
}
