<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  name: string;
  isFolder?: boolean;
  modified?: string;
  size?: number;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const formatSize = (bytes: number): string => {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const icon = computed(() => props.isFolder ? 'mdi-folder' : 'mdi-file-document-outline');
const iconColor = computed(() => props.isFolder ? 'amber' : 'grey');
</script>

<template>
  <v-list-item
    :active="isSelected"
    class="explorer-item"
    @click="emit('click')"
  >
    <template #prepend>
      <v-icon
        :color="iconColor"
        :icon="icon"
      />
    </template>

    <v-list-item-title class="text-truncate">
      {{ name }}
    </v-list-item-title>

    <template #append>
      <div
        class="d-none d-sm-flex align-center"
      >
        <span
          v-if="modified"
          class="text-caption text-medium-emphasis me-4">
          {{ modified }}
        </span>
        <span
          v-if="size !== undefined"
          class="text-caption text-medium-emphasis text-right"
          style="min-width: 70px"
        >
          {{ formatSize(size) }}
        </span>
      </div>
    </template>
  </v-list-item>
</template>

<style scoped>
.explorer-item {
  border-radius: 4px;
}
.explorer-item:hover {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>
