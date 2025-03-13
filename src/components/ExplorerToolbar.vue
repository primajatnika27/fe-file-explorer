<script setup lang="ts">
import { ref } from 'vue';
import { explorerService } from '../services/api';

defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const dialog = ref(false);
const newFolderName = ref('');
const isCreating = ref(false);
const error = ref('');

async function createFolder() {
  if (!newFolderName.value) return;

  isCreating.value = true;
  error.value = '';

  try {
    await explorerService.createFolder(newFolderName.value);
    dialog.value = false;
    newFolderName.value = '';
    emit('refresh');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create folder';
  } finally {
    isCreating.value = false;
  }
}
</script>

<template>
  <div class="explorer-toolbar">
    <v-toolbar density="compact" color="surface-variant" elevation="1">
      <v-btn prepend-icon="mdi-folder-plus" variant="text" @click="dialog = true">
        New folder
      </v-btn>
      <v-btn prepend-icon="mdi-refresh" variant="text" @click="emit('refresh')" :loading="loading">
        Refresh
      </v-btn>
      <v-spacer></v-spacer>
      <v-text-field
        density="compact"
        hide-details
        placeholder="Search files"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        class="mx-2"
        style="max-width: 300px"
      ></v-text-field>
    </v-toolbar>

    <!-- New Folder Dialog -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>Create New Folder</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newFolderName"
            label="Folder Name"
            :error-messages="error"
            @keyup.enter="createFolder"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="isCreating"
            :disabled="!newFolderName"
            @click="createFolder"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.explorer-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style>
