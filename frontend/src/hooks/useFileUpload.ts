import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  uploadProviderFile,
  getProviderFiles,
  deleteProviderFile,
} from "../services/providerFileUploadApi";

export function useUploadProviderFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, file, category }: { 
      providerId: string; 
      file: File; 
      category: string;
    }) => uploadProviderFile(providerId, file, category),
    onMutate: () => toast.loading("Uploading file..."),
    onSuccess: (response, { providerId }) => {
      toast.dismiss();
      toast.success("File uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["providerFiles", providerId] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error(err.response?.data?.error || "Failed to upload file");
    },
  });
}

export function useProviderFiles(providerId: string) {
  return useQuery({
    queryKey: ["providerFiles", providerId],
    queryFn: async () => {
      const res = await getProviderFiles(providerId);
      return res.data;
    },
    enabled: !!providerId,
  });
}

export function useDeleteProviderFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, fileId }: { providerId: string; fileId: string }) =>
      deleteProviderFile(providerId, fileId),
    onMutate: () => toast.loading("Deleting file..."),
    onSuccess: (_, { providerId }) => {
      toast.dismiss();
      toast.success("File deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["providerFiles", providerId] });
    },
    onError: (err: any) => {
      toast.dismiss();
      toast.error(err.response?.data?.error || "Failed to delete file");
    },
  });
}