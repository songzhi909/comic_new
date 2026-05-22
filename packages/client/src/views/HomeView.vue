<template>
  <div class="home-view">
    <section class="section">
      <h2>收藏的漫画</h2>
      <div class="comics-grid">
        <ComicCard v-for="comic in favorites" :key="comic.id" :comic="comic" />
        <p v-if="favorites.length === 0" class="empty">暂无收藏</p>
      </div>
    </section>

    <section class="section">
      <h2>最近阅读</h2>
      <div class="comics-grid">
        <ComicCard v-for="comic in recentlyRead" :key="comic.id" :comic="comic" />
        <p v-if="recentlyRead.length === 0" class="empty">暂无阅读记录</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/utils/api';
import ComicCard from '@/components/ComicCard.vue';

const favorites = ref<any[]>([]);
const recentlyRead = ref<any[]>([]);

onMounted(async () => {
  const result = await api.get<any>('/comics?limit=10');
  recentlyRead.value = result.comics;
  favorites.value = result.comics.filter((c: any) => c.favorite?.is_favorite);
});
</script>

<style scoped>
.section {
  margin-bottom: 32px;
}
.section h2 {
  margin-bottom: 16px;
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
</style>
