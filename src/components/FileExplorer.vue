<script setup lang="ts">
import { ref, computed } from "vue";
import { onMounted } from "vue";
import ExplorerItem from "./ExplorerItem.vue";
import ExplorerToolbar from "./ExplorerToolbar.vue";
import { useExplorer } from "../composables/useExplorer";
import { explorerService } from "../services/api";

const {
  loading,
  error,
  rootFolders,
  currentFolder,
  currentPath,
  fetchFolders,
  handleFolderClick,
  handleItemClick,
  findFolderById,
  selectedFolder,
  selectedItem,
} = useExplorer();

// New Folder Dialog
const dialog = ref(false);
const newFolderName = ref("");
const isCreating = ref(false);
const dialogError = ref("");

// Delete Folder Dialog
const deleteDialog = ref(false);
const isDeleting = ref(false);
const folderToDelete = ref<{
  id: string;
  name: string;
  parentId: string | null;
} | null>(null);

// Rename Folder Dialog
const renameDialog = ref(false);
const isRenaming = ref(false);
const folderToRename = ref<{ id: string; name: string } | null>(null);
const newName = ref("");
const renameError = ref("");

// File Upload
const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const uploadError = ref("");

// Rename File Dialog
const renameFileDialog = ref(false);
const isRenamingFile = ref(false);
const fileToRename = ref<{
  id: string;
  name: string;
  extension: string;
} | null>(null);
const newFileName = ref("");
const renameFileError = ref("");

// Delete File Dialog
const deleteFileDialog = ref(false);
const isDeletingFile = ref(false);
const fileToDelete = ref<{
  id: string;
  name: string;
  extension: string;
} | null>(null);

// File Preview
const previewDialog = ref(false);
const isLoadingPreview = ref(false);
const previewError = ref("");
const previewUrl = ref("");
const previewFile = ref<{ name: string; extension: string } | null>(null);

const leftPanelWidth = ref(450);
const isResizing = ref(false);

const searchQuery = ref("");

const expandedFolders = ref<string[]>([]);

const filteredContent = computed(() => {
  if (!currentFolder.value || !searchQuery.value)
    return {
      subFolders: currentFolder.value?.subFolders || [],
      files: currentFolder.value?.files || [],
    };

  const query = searchQuery.value.toLowerCase();

  return {
    subFolders: currentFolder.value.subFolders.filter((folder) =>
      folder.name.toLowerCase().includes(query)
    ),
    files: currentFolder.value.files.filter(
      (file) =>
        file.name.toLowerCase().includes(query) ||
        file.extension.toLowerCase().includes(query)
    ),
  };
});

function handleSearch(query: string) {
  searchQuery.value = query;
}

function startResize() {
  isResizing.value = true;
  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
}

function handleResize(event: MouseEvent) {
  if (!isResizing.value) return;

  // Limit the minimum and maximum width
  const newWidth = Math.max(200, Math.min(800, event.clientX));
  leftPanelWidth.value = newWidth;
}

function stopResize() {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
}

async function createSubfolder() {
  if (!newFolderName.value || !currentFolder.value?.id) return;

  isCreating.value = true;
  dialogError.value = "";

  try {
    await explorerService.createFolder(
      newFolderName.value,
      currentFolder.value.id
    );
    dialog.value = false;
    newFolderName.value = "";
    await fetchFolders();
    await findFolderById(currentFolder.value.id);
  } catch (err) {
    dialogError.value =
      err instanceof Error ? err.message : "Failed to create folder";
  } finally {
    isCreating.value = false;
  }
}

async function deleteFolder() {
  if (!folderToDelete.value) return;

  isDeleting.value = true;
  try {
    await explorerService.deleteFolder(folderToDelete.value.id);
    deleteDialog.value = false;
    folderToDelete.value = null;

    if (currentFolder.value?.parentId !== null) {
      findFolderById(currentFolder.value?.id || "");
      fetchFolders();
    } else {
      window.location.reload();
    }
  } catch (err) {
    console.error("Failed to delete folder:", err);
  } finally {
    isDeleting.value = false;
  }
}

function confirmDelete(folder: {
  id: string;
  name: string;
  parentId: string | null;
}) {
  console.log("folder", folder);
  folderToDelete.value = folder;
  deleteDialog.value = true;
}

async function renameFolder() {
  if (!folderToRename.value || !newName.value) return;

  isRenaming.value = true;
  renameError.value = "";

  try {
    await explorerService.renameFolder(folderToRename.value.id, newName.value);
    renameDialog.value = false;
    folderToRename.value = null;
    newName.value = "";
    findFolderById(currentFolder.value?.id || "");
    fetchFolders();
  } catch (err) {
    renameError.value =
      err instanceof Error ? err.message : "Failed to rename folder";
  } finally {
    isRenaming.value = false;
  }
}

function startRename(folder: { id: string; name: string }) {
  folderToRename.value = folder;
  newName.value = folder.name;
  renameDialog.value = true;
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length || !currentFolder.value?.id) return;

  const file = input.files[0];
  isUploading.value = true;
  uploadError.value = "";

  try {
    await explorerService.uploadFile(currentFolder.value.id, file);
    findFolderById(currentFolder.value.id);
  } catch (err) {
    uploadError.value =
      err instanceof Error ? err.message : "Failed to upload file";
  } finally {
    isUploading.value = false;
    if (fileInput.value) {
      fileInput.value.value = ""; // Reset input
    }
  }
}

async function deleteFile() {
  if (!fileToDelete.value) return;

  isDeletingFile.value = true;
  try {
    await explorerService.deleteFile(fileToDelete.value.id);
    deleteFileDialog.value = false;
    fileToDelete.value = null;
    findFolderById(currentFolder.value?.id || "");
  } catch (err) {
    console.error("Failed to delete file:", err);
  } finally {
    isDeletingFile.value = false;
  }
}

function confirmDeleteFile(file: {
  id: string;
  name: string;
  extension: string;
}) {
  fileToDelete.value = file;
  deleteFileDialog.value = true;
}

async function renameFile() {
  if (!fileToRename.value || !newFileName.value) return;

  isRenamingFile.value = true;
  renameFileError.value = "";

  try {
    await explorerService.renameFile(fileToRename.value.id, newFileName.value);
    renameFileDialog.value = false;
    fileToRename.value = null;
    newFileName.value = "";
    findFolderById(currentFolder.value?.id || "");
  } catch (err) {
    renameFileError.value =
      err instanceof Error ? err.message : "Failed to rename file";
  } finally {
    isRenamingFile.value = false;
  }
}

function startRenameFile(file: {
  id: string;
  name: string;
  extension: string;
}) {
  fileToRename.value = file;
  newFileName.value = file.name;
  renameFileDialog.value = true;
}

async function previewFileContent(file: {
  id: string;
  name: string;
  extension: string;
}) {
  previewFile.value = file;
  previewDialog.value = true;
  isLoadingPreview.value = true;
  previewError.value = "";

  try {
    const response = await explorerService.getFileUrl(file.id);
    previewUrl.value = response.data.url;
  } catch (err) {
    previewError.value =
      err instanceof Error ? err.message : "Failed to load file preview";
  } finally {
    isLoadingPreview.value = false;
  }
}

function toggleFolder(folderId: string) {
  const index = expandedFolders.value.indexOf(folderId);
  if (index === -1) {
    expandedFolders.value.push(folderId);
  } else {
    expandedFolders.value.splice(index, 1);
  }
}

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
      @search="handleSearch"
    />

    <!-- Main Content -->
    <div class="explorer-content">
      <!-- Error State -->
      <v-alert v-if="error" type="error" variant="tonal" closable class="ma-4">
        {{ error }}
      </v-alert>

      <template v-else>
        <!-- Left Panel -->
        <v-sheet
          :width="leftPanelWidth"
          class="flex-shrink-0 overflow-y-auto position-relative"
        >
          <v-list density="compact">
            <template v-for="folder in rootFolders" :key="folder.id">
              <div>
                <explorer-item
                  :name="folder.name"
                  :is-folder="true"
                  :is-selected="selectedFolder === folder.id"
                  :has-children="folder.subFolders.length > 0"
                  :is-expanded="expandedFolders.includes(folder.id)"
                  :show-chevron="true"
                  @click="handleFolderClick(folder.id)"
                  @toggle="toggleFolder(folder.id)"
                />
                <v-menu location="end">
                  <template #activator="{ props }">
                    <v-btn
                      icon="mdi-dots-vertical"
                      variant="text"
                      size="small"
                      v-bind="props"
                      class="folder-menu-btn"
                      @click.stop
                    />
                  </template>
                  <v-list>
                    <v-list-item @click="startRename(folder)">
                      <template #prepend>
                        <v-icon>mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title>Rename</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="confirmDelete(folder)">
                      <template #prepend>
                        <v-icon color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title class="text-error"
                        >Delete</v-list-item-title
                      >
                    </v-list-item>
                  </v-list>
                </v-menu>
                <!-- Nested folders -->
                <div v-if="expandedFolders.includes(folder.id)" class="ml-8">
                  <template
                    v-for="subFolder in folder.subFolders"
                    :key="subFolder.id"
                  >
                    <explorer-item
                      :name="subFolder.name"
                      :is-folder="true"
                      :is-selected="selectedItem === subFolder.id"
                      :has-children="subFolder.subFolders?.length > 0"
                      :is-expanded="expandedFolders.includes(subFolder.id)"
                      :show-chevron="true"
                      @click="handleItemClick(subFolder.id)"
                      @toggle="toggleFolder(subFolder.id)"
                    />
                    <!-- Second level -->
                    <div
                      v-if="expandedFolders.includes(subFolder.id)"
                      class="ml-8"
                    >
                      <template
                        v-for="subSubFolder in subFolder.subFolders"
                        :key="subSubFolder.id"
                      >
                        <explorer-item
                          :name="subSubFolder.name"
                          :is-folder="true"
                          :is-selected="selectedItem === subSubFolder.id"
                          :has-children="subSubFolder.subFolders?.length > 0"
                          :is-expanded="
                            expandedFolders.includes(subSubFolder.id)
                          "
                          :show-chevron="true"
                          @click="handleItemClick(subSubFolder.id)"
                          @toggle="toggleFolder(subSubFolder.id)"
                        />
                      </template>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </v-list>
          <div class="resize-handle" @mousedown="startResize" />
        </v-sheet>

        <!-- Divider -->
        <v-divider vertical />

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
              <!-- Action Buttons -->
              <v-list-item>
                <div class="d-flex gap-2">
                  <v-btn
                    prepend-icon="mdi-folder-plus"
                    variant="text"
                    class="mb-2"
                    @click="dialog = true"
                  >
                    New Folder
                  </v-btn>
                  <v-btn
                    prepend-icon="mdi-upload"
                    variant="text"
                    :loading="isUploading"
                    class="mb-2"
                    @click="fileInput?.click()"
                  >
                    Upload File
                  </v-btn>
                  <input
                    ref="fileInput"
                    type="file"
                    class="d-none"
                    @change="handleFileUpload"
                  />
                </div>
              </v-list-item>

              <!-- Upload Error -->
              <v-alert
                v-if="uploadError"
                type="error"
                variant="tonal"
                closable
                class="mx-4 mb-2"
                @click:close="uploadError = ''"
              >
                {{ uploadError }}
              </v-alert>

              <!-- Show content if exists -->
              <template
                v-if="
                  filteredContent.subFolders.length > 0 ||
                  filteredContent.files.length > 0
                "
              >
                <!-- Sub Folders -->
                <template
                  v-for="subFolder in filteredContent.subFolders"
                  :key="subFolder.id"
                >
                  <v-list-item>
                    <explorer-item
                      :name="subFolder.name"
                      :is-folder="true"
                      :is-selected="selectedItem === subFolder.id"
                      :show-chevron="false"
                      @click="handleItemClick(subFolder.id)"
                    />
                    <template #append>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-dots-vertical"
                            variant="text"
                            size="small"
                            v-bind="props"
                            @click.stop
                          />
                        </template>
                        <v-list>
                          <v-list-item @click="startRename(subFolder)">
                            <template #prepend>
                              <v-icon>mdi-pencil</v-icon>
                            </template>
                            <v-list-item-title>Rename</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="confirmDelete(subFolder)">
                            <template #prepend>
                              <v-icon color="error">
                                mdi-delete
                              </v-icon>
                            </template>
                            <v-list-item-title class="text-error">
                              Delete
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                  </v-list-item>
                </template>

                <!-- Files -->
                <template v-for="file in filteredContent.files" :key="file.id">
                  <v-list-item>
                    <explorer-item
                      :name="`${file.name}.${file.extension}`"
                      :size="file.size"
                      :is-selected="selectedItem === file.id"
                      :show-chevron="false"
                      @click="previewFileContent(file)"
                    />
                    <template #append>
                      <v-menu>
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-dots-vertical"
                            variant="text"
                            size="small"
                            v-bind="props"
                            @click.stop
                          />
                        </template>
                        <v-list>
                          <v-list-item @click="previewFileContent(file)">
                            <template #prepend>
                              <v-icon>mdi-eye</v-icon>
                            </template>
                            <v-list-item-title>Preview</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="startRenameFile(file)">
                            <template #prepend>
                              <v-icon>mdi-pencil</v-icon>
                            </template>
                            <v-list-item-title>Rename</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="confirmDeleteFile(file)">
                            <template #prepend>
                              <v-icon color="error">
                                mdi-delete
                              </v-icon>
                            </template>
                            <v-list-item-title class="text-error">
                              Delete
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                  </v-list-item>
                </template>
              </template>
              <!-- Empty state -->
              <div
                v-else
                class="d-flex flex-column align-center justify-center fill-height pa-8"
              >
                <v-icon
                  icon="mdi-folder-open-outline"
                  size="64"
                  color="grey-lighten-1"
                  class="mb-4"
                />
                <span class="text-grey-darken-1 text-body-1">
                  This folder is empty
                </span>
                <span class="text-grey text-body-2 mt-1">
                  Add files or folders to see them here
                </span>
              </div>
            </template>

            <div
              v-else
              class="d-flex flex-column align-center justify-center fill-height pa-8"
            >
              <v-icon
                icon="mdi-folder"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />
              <span class="text-grey-darken-1 text-body-1">
                Select a folder to view its contents
              </span>
            </div>
          </v-list>
        </v-sheet>
      </template>
    </div>

    <!-- New Subfolder Dialog -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>Create New Subfolder</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newFolderName"
            label="Folder Name"
            :error-messages="dialogError"
            @keyup.enter="createSubfolder"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="isCreating"
            :disabled="!newFolderName"
            @click="createSubfolder"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Delete Folder
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ folderToDelete?.name }}"? This
          action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            :loading="isDeleting"
            @click="deleteFolder"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Rename Folder Dialog -->
    <v-dialog v-model="renameDialog" max-width="400">
      <v-card>
        <v-card-title>Rename Folder</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newName"
            label="New Name"
            :error-messages="renameError"
            @keyup.enter="renameFolder"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="renameDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="isRenaming"
            :disabled="!newName"
            @click="renameFolder"
          >
            Rename
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Rename File Dialog -->
    <v-dialog v-model="renameFileDialog" max-width="400">
      <v-card>
        <v-card-title>Rename File</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newFileName"
            :label="'New Name (.' + (fileToRename?.extension || '') + ')'"
            :error-messages="renameFileError"
            @keyup.enter="renameFile"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="renameFileDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="isRenamingFile"
            :disabled="!newFileName"
            @click="renameFile"
          >
            Rename
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete File Dialog -->
    <v-dialog v-model="deleteFileDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Delete File
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ fileToDelete?.name }}.{{
            fileToDelete?.extension
          }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="deleteFileDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="tonal"
            :loading="isDeletingFile"
            @click="deleteFile"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- File Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="90vw" height="120vh">
      <v-card class="preview-dialog">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ previewFile?.name }}.{{ previewFile?.extension }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="previewDialog = false"
          />
        </v-card-title>
        <v-card-text class="preview-content">
          <div
            v-if="isLoadingPreview"
            class="d-flex justify-center align-center pa-4"
          >
            <v-progress-circular indeterminate />
          </div>
          <div
            v-else-if="previewError"
            class="d-flex justify-center align-center pa-4"
          >
            <v-alert type="error" variant="tonal">
              {{ previewError }}
            </v-alert>
          </div>
          <div v-else class="preview-iframe-container">
            <iframe :src="previewUrl" frameborder="0" class="preview-iframe" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.file-explorer {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.explorer-content {
  margin-top: 48px;
  /* Height of the toolbar */
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

.folder-menu-btn {
  opacity: 0;
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.explorer-item:hover .folder-menu-btn {
  opacity: 1;
}

.v-list {
  height: 100%;
}

.preview-dialog {
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.preview-content {
  flex-grow: 1;
  overflow: hidden;
  padding: 0;
}

.preview-iframe-container {
  height: 100%;
  width: 100%;
}

.preview-iframe {
  height: 100%;
  width: 100%;
}

.position-relative {
  position: relative;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  background-color: transparent;
  transition: background-color 0.2s;
}

.resize-handle:hover,
.resize-handle:active {
  background-color: rgb(var(--v-theme-primary));
}
</style>
