<script setup lang="ts">
const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();
</script>

<template>
  <div class="explorer-toolbar">
    <v-toolbar density="compact" color="surface-variant" elevation="1">
      <v-btn prepend-icon="mdi-folder-plus" variant="text">
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
