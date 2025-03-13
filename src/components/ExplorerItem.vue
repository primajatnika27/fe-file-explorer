<script setup lang="ts">
defineProps<{
  name: string;
  isFolder?: boolean;
  modified?: string;
  size?: number;
  isSelected?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  showChevron?: boolean;
}>();

const emit = defineEmits<{
  (e: "click"): void;
  (e: "toggle"): void;
}>();

const formatSize = (bytes: number): string => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
</script>

<template>
  <div
    class="d-flex align-center explorer-item"
    :class="{ selected: isSelected }"
    style="min-width: 0;"
    @click="emit('click')"
  >
    <div class="d-flex align-center flex-grow-1 text-truncate">
      <v-btn
        v-if="isFolder && showChevron"
        icon="mdi-chevron-right"
        variant="text"
        size="small"
        class="mr-1"
        :class="{ 'rotate-90': isExpanded }"
        @click.stop="emit('toggle')"
      />
      <v-icon
        :icon="isFolder ? 'mdi-folder' : 'mdi-file'"
        :color="isFolder ? 'amber-darken-2' : undefined"
        class="mr-2"
        size="small"
      />
      <span class="text-truncate">{{ name }}</span>
      <span v-if="size != null" class="text-caption text-grey ml-2">
        {{ formatSize(size) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.explorer-item {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.explorer-item:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.explorer-item.selected {
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.rotate-90 {
  transform: rotate(90deg);
}
</style>
