import { ref, computed } from "vue";
import type { Folder } from "../types/explorer";
import { explorerService } from "../services/api";

export function useExplorer() {
  const folders = ref<Folder[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedFolder = ref<string | null>(null);
  const selectedItem = ref<string | null>(null);

  // Computed properties
  const rootFolders = computed(() =>
    folders.value.filter((folder) => folder.parentId === null)
  );

  const findFolderById = (id: string, folderList: Folder[]): Folder | null => {
    for (const folder of folderList) {
      if (folder.id === id) return folder;
      if (folder.subFolders.length > 0) {
        const found = findFolderById(id, folder.subFolders);
        if (found) return found;
      }
    }
    return null;
  };

  const currentFolder = computed(() => {
    if (!selectedFolder.value) return null;
    return findFolderById(selectedFolder.value, folders.value);
  });

  const getFolderPath = (folderId: string | null): Folder[] => {
    const path: Folder[] = [];
    let currentId = folderId;

    while (currentId) {
      const folder = findFolderById(currentId, folders.value);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }

    return path;
  };

  const currentPath = computed(() => {
    if (!selectedFolder.value) return [];
    return getFolderPath(selectedFolder.value);
  });

  // Actions
  const fetchFolders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await explorerService.getFolders();
      folders.value = response.data;
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : "An error occurred while fetching folders";
      console.error("Error fetching folders:", err);
    } finally {
      loading.value = false;
    }
  };

  const handleFolderClick = (id: string) => {
    const folder = findFolderById(id, folders.value);
    if (folder) {
      selectedFolder.value = id;
      selectedItem.value = id;
    }
  };

  const handleItemClick = (id: string) => {
    const folder = findFolderById(id, folders.value);
    if (folder) {
      selectedFolder.value = id;
    }
    selectedItem.value = id;
  };

  return {
    // State
    folders,
    loading,
    error,
    selectedFolder,
    selectedItem,

    // Computed
    rootFolders,
    currentFolder,
    currentPath,

    // Methods
    fetchFolders,
    handleFolderClick,
    handleItemClick,
  };
}
