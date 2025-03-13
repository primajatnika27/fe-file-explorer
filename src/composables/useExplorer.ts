import { ref, computed } from "vue";
import type { Folder, RootNavigation } from "../types/explorer";
import { explorerService } from "../services/api";

export function useExplorer() {
  const folders = ref<Folder[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedFolder = ref<string | null>(null);
  const selectedItem = ref<string | null>(null);
  const currentFolderData = ref<Folder | null>(null);

  const findFolderById = async (id: string): Promise<Folder | null> => {
    try {
      const response = await explorerService.getFolderDetail(id);
      if (response.success && response.data) {
        console.log(response.data);
        currentFolderData.value = response.data;

        // Return the folder data which includes subFolders and files
        return {
          id: response.data.id,
          name: response.data.name,
          parentId: response.data.parentId,
          subFolders: response.data.subFolders || [],
          files: response.data.files || [],
          rootNavigation: response.data.rootNavigation || [],
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching folder:", error);
      return null;
    }
  };

  const fetchCurrentFolder = async () => {
    console.log("selectedFolder", selectedFolder.value);

    if (!selectedFolder.value) {
      currentFolderData.value = null;
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      const folder = await findFolderById(selectedFolder.value);
      console.log("folder", folder);

      currentFolderData.value = folder;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch folder";
      currentFolderData.value = null;
    } finally {
      loading.value = false;
    }
  };

  const currentFolder = computed(() => currentFolderData.value);

  const rootFolders = computed(() => folders.value);

  const currentPath = computed(() => {
    const path: (RootNavigation | Folder)[] = [];
    if (currentFolderData.value?.rootNavigation) {
      path.push(...currentFolderData.value.rootNavigation);
    }
    return path;
  });

  const fetchFolders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await explorerService.getFolders();
      if (response.success) {
        folders.value = response.data;
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch folders";
      folders.value = [];
    } finally {
      loading.value = false;
    }
  };

  const handleFolderClick = async (id: string) => {
    selectedFolder.value = id;
    selectedItem.value = id;
    await fetchCurrentFolder();
  };

  const handleItemClick = async (id: string) => {
    selectedItem.value = id;
    await handleFolderClick(id);
  };

  return {
    loading,
    error,
    rootFolders,
    currentFolder,
    currentPath,
    findFolderById,
    fetchFolders,
    handleFolderClick,
    handleItemClick,
    selectedFolder,
    selectedItem,
  };
}
