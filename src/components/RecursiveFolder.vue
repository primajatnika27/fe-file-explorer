<script setup lang="ts">
import { defineProps } from "vue";
import ExplorerItem from "./ExplorerItem.vue";

interface Folder {
  id: string;
  name: string;
  subFolders: Folder[];
  parentId: string | null;
}

defineProps<{
  folder: Folder;
  selectedItem: string | null;
  expandedFolders: string[];
  level?: number;
}>();

const emit = defineEmits<{
  (e: "itemClick", id: string): void;
  (e: "toggleFolder", id: string): void;
  (e: "rename", folder: Folder): void;
  (e: "delete", folder: Folder): void;
}>();
</script>

<template>
  <div class="d-flex align-center">
    <explorer-item
      :name="folder.name"
      :is-folder="true"
      :is-selected="selectedItem === folder.id"
      :has-children="folder.subFolders?.length > 0"
      :is-expanded="expandedFolders.includes(folder.id)"
      :show-chevron="true"
      class="flex-grow-1"
      @click="emit('itemClick', folder.id)"
      @toggle="emit('toggleFolder', folder.id)"
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
        <v-list-item @click="emit('rename', folder)">
          <template #prepend>
            <v-icon>mdi-pencil</v-icon>
          </template>
          <v-list-item-title>Rename</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('delete', folder)">
          <template #prepend>
            <v-icon color="error">mdi-delete</v-icon>
          </template>
          <v-list-item-title class="text-error">Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>

  <!-- Recursively render subfolders -->
  <div v-if="expandedFolders.includes(folder.id)" :class="['ml-8']">
    <template v-for="subFolder in folder.subFolders" :key="subFolder.id">
      <recursive-folder
        :folder="subFolder"
        :selected-item="selectedItem"
        :expanded-folders="expandedFolders"
        :level="(level || 0) + 1"
        @item-click="emit('itemClick', $event)"
        @toggle-folder="emit('toggleFolder', $event)"
        @rename="emit('rename', $event)"
        @delete="emit('delete', $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.folder-menu-btn {
  opacity: 0;
  margin-right: 4px;
}

.d-flex:hover .folder-menu-btn {
  opacity: 1;
}

.folder-menu-btn {
  transition: opacity 0.2s ease-in-out;
}
</style>
