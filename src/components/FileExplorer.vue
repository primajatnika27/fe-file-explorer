<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Folder, ExplorerResponse } from '../types/explorer';
import ExplorerItem from './ExplorerItem.vue';
import ExplorerToolbar from './ExplorerToolbar.vue';

const folders = ref<Folder[]>([]);
const loading = ref(false);
const selectedFolder = ref<string | null>(null);
const selectedItem = ref<string | null>(null);

const rootFolders = computed(() => folders.value.filter(folder => folder.parentId === null));

// Recursive function to find folder by id
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

// Get folder path from current folder to root
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

const fetchFolders = async () => {
  loading.value = true;
  try {
    const response: ExplorerResponse = {
      status: 200,
      success: true,
      message: "Folders retrieved successfully",
      data: [
        {
          name: "Documents",
          id: "4f5d3ae8-bd66-4d72-9ba7-174106dea0aa",
          parentId: null,
          subFolders: [
            {
              name: "Work",
              id: "5f5d3ae8-bd66-4d72-9ba7-174106dea0bb",
              parentId: "4f5d3ae8-bd66-4d72-9ba7-174106dea0aa",
              subFolders: [
                {
                  name: "Project 1",
                  id: "6f5d3ae8-bd66-4d72-9ba7-174106dea0cd",
                  parentId: "5f5d3ae8-bd66-4d72-9ba7-174106dea0bb",
                  subFolders: [],
                  files: []
                }
              ],
              files: []
            }
          ],
          files: [
            {
              id: "a054f7cf-07d6-4e72-a8de-f79b6df31e80",
              name: "Template 2022",
              extension: "xlsx",
              parentId: "4f5d3ae8-bd66-4d72-9ba7-174106dea0aa",
              storageKey: "4e498695-88bb-4710-a98a-cc95ef9fd617.xlsx",
              mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              size: 32734
            }
          ]
        },
        {
          name: "Pictures",
          id: "6f5d3ae8-bd66-4d72-9ba7-174106dea0cc",
          parentId: null,
          subFolders: [],
          files: []
        }
      ]
    };
    folders.value = response.data;
  } catch (error) {
    console.error('Error fetching folders:', error);
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
    // If it's a folder, navigate into it
    selectedFolder.value = id;
  }
  selectedItem.value = id;
};

onMounted(() => {
  fetchFolders();
});
</script>

<template>
  <div class="file-explorer">
    <!-- Fixed Toolbar -->
    <explorer-toolbar
      :loading="loading"
      @refresh="fetchFolders"
    />

    <!-- Main Content -->
    <div class="explorer-content">
      <!-- Left Panel -->
      <v-sheet width="250" class="flex-shrink-0 overflow-y-auto">
        <v-list density="compact">
          <template v-for="folder in rootFolders" :key="folder.id">
            <explorer-item
              :name="folder.name"
              :is-folder="true"
              :is-selected="selectedFolder === folder.id"
              @click="handleFolderClick(folder.id)"
            />
          </template>
        </v-list>
      </v-sheet>

      <!-- Divider -->
      <v-divider vertical></v-divider>

      <!-- Right Panel -->
      <v-sheet class="flex-grow-1 overflow-y-auto">
        <v-list density="compact">
          <!-- Breadcrumb Navigation -->
          <v-list-subheader class="d-flex align-center px-4">
            <template v-for="(folder, index) in currentPath" :key="folder.id">
              <span
                class="cursor-pointer text-primary"
                @click="handleFolderClick(folder.id)"
              >
                {{ folder.name }}
              </span>
              <v-icon
                v-if="index < currentPath.length - 1"
                size="small"
                class="mx-1"
              >
                mdi-chevron-right
              </v-icon>
            </template>
          </v-list-subheader>

          <template v-if="currentFolder">
            <!-- Show content if exists -->
            <template v-if="currentFolder.subFolders.length > 0 || currentFolder.files.length > 0">
              <!-- Sub Folders -->
              <template v-for="subFolder in currentFolder.subFolders" :key="subFolder.id">
                <explorer-item
                  :name="subFolder.name"
                  :is-folder="true"
                  :is-selected="selectedItem === subFolder.id"
                  @click="handleItemClick(subFolder.id)"
                />
              </template>

              <!-- Files -->
              <template v-for="file in currentFolder.files" :key="file.id">
                <explorer-item
                  :name="`${file.name}.${file.extension}`"
                  :size="file.size"
                  :is-selected="selectedItem === file.id"
                  @click="handleItemClick(file.id)"
                />
              </template>
            </template>
            <!-- Empty state -->
            <div v-else class="d-flex flex-column align-center justify-center fill-height pa-8">
              <v-icon
                icon="mdi-folder-open-outline"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />
              <span class="text-grey-darken-1 text-body-1">This folder is empty</span>
              <span class="text-grey text-body-2 mt-1">Add files or folders to see them here</span>
            </div>
          </template>

          <div v-else class="d-flex flex-column align-center justify-center fill-height pa-8">
            <v-icon
              icon="mdi-folder"
              size="64"
              color="grey-lighten-1"
              class="mb-4"
            />
            <span class="text-grey-darken-1 text-body-1">Select a folder to view its contents</span>
          </div>
        </v-list>
      </v-sheet>
    </div>
  </div>
</template>

<style scoped>
.file-explorer {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.explorer-content {
  margin-top: 48px; /* Height of the toolbar */
  height: calc(100vh - 48px);
  display: flex;
  overflow: hidden;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  text-decoration: underline;
}

.v-list {
  height: 100%;
}
</style>
