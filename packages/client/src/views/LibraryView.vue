<template>
  <div class="library-view">
    <div class="header">
      <h1>漫画库</h1>
      <input v-model="search" placeholder="搜索漫画..." @input="debouncedSearch" />
    </div>
    <div class="comics-grid">
      <ComicCard v-for="comic in comicStore.comics" :key="comic.id" :comic="comic" />
      <p v-if="comicStore.comics.length === 0" class="empty">暂无漫画</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useComicStore } from '@/stores/comic';
import ComicCard from '@/components/ComicCard.vue';

const comicStore = useComicStore();
const search = ref('');
let debounceTimer: number;

function debouncedSearch() {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    comicStore.fetchComics({ search: search.value });
  }, 300);
}

onMounted(() => {
  comicStore.fetchComics();
});
</script>

<style scoped>
.library-view {
  max-width: 1200px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.comics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}
.empty {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
}

@media (max-width: 768px) {
  .comics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
