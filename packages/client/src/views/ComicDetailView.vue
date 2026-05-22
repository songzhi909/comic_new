<template>
  <div class="comic-detail" v-if="comic">
    <div class="detail-header">
      <img :src="`/api/comics/${comic.id}/thumbnail`" class="cover" />
      <div class="info">
        <h1>{{ comic.title }}</h1>
        <p class="type">{{ comic.type === 'single' ? '单体漫画' : '分集漫画' }}</p>
        <p class="pages">{{ comic.type === 'single' ? `${comic.page_count}页` : `${comic.episode_count}集` }}</p>
        <div class="tags" v-if="comic.tags?.length">
          <span v-for="tag in comic.tags" :key="tag.id" class="tag" :style="{ background: tag.color }">
            {{ tag.name }}
          </span>
        </div>
        <div class="actions">
          <button class="btn-primary" @click="startReading">
            {{ comic.type === 'single' ? '开始阅读' : '查看集数' }}
          </button>
          <button @click="toggleFavorite">
            {{ comic.favorite?.is_favorite ? '取消收藏' : '收藏' }}
          </button>
        </div>
      </div>
    </div>
    <div v-if="comic.type === 'series'" class="episodes">
      <h2>集数列表</h2>
      <div class="episode-list">
        <div v-for="ep in episodes" :key="ep.id" class="episode-item" @click="readEpisode(ep.id)">
          <span>{{ ep.title }}</span>
          <span class="ep-pages">{{ ep.page_count }}页</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/utils/api';
import { useComicStore } from '@/stores/comic';

const route = useRoute();
const router = useRouter();
const comicStore = useComicStore();
const comic = ref<any>(null);
const episodes = ref<any[]>([]);

onMounted(async () => {
  const id = Number(route.params.id);
  await comicStore.fetchComic(id);
  comic.value = comicStore.currentComic;

  if (comic.value?.type === 'series') {
    episodes.value = await api.get(`/comics/${id}/episodes`);
  }
});

function startReading() {
  if (comic.value.type === 'single') {
    router.push(`/comic/${comic.value.id}/read`);
  }
}

function readEpisode(epId: number) {
  router.push(`/comic/${comic.value.id}/episodes/${epId}/read`);
}

async function toggleFavorite() {
  await comicStore.toggleFavorite(comic.value.id);
  await comicStore.fetchComic(comic.value.id);
  comic.value = comicStore.currentComic;
}
</script>

<style scoped>
.detail-header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
}
.cover {
  width: 200px;
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
}
.info h1 {
  margin-bottom: 8px;
}
.type, .pages {
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.tags {
  display: flex;
  gap: 8px;
  margin: 12px 0;
  flex-wrap: wrap;
}
.tag {
  padding: 2px 10px;
  border-radius: 12px;
  color: white;
  font-size: 12px;
}
.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.episode-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.episode-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border-radius: 8px;
  cursor: pointer;
}
.episode-item:hover {
  background: var(--border);
}
.ep-pages {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .tags, .actions {
    justify-content: center;
  }
}
</style>
