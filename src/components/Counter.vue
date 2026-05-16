<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <button
    class="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
    @click="count++"
  >
    Count: {{ count }}
  </button>
</template>
