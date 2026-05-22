<template>
  <div class="comic-card" @click="$router.push(`/comic/${comic.id}`)">
    <div class="cover">
      <img :src="`/api/comics/${comic.id}/thumbnail`" :alt="comic.title" loading="lazy" />
      <span v-if="comic.type === 'series'" class="badge">{{ comic.episode_count }}集</span>
    </div>
    <div class="info">
      <h3>{{ comic.title }}</h3>
      <p>{{ comic.type === 'single' ? `${comic.page_count}页` : `${comic.episode_count}集` }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  comic: {
    id: number;
    title: string;
    type: 'single' | 'series';
    page_count: number;
    episode_count: number;
  };
}>();
</script>

<style scoped>
.comic-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}
.comic-card:hover {
  transform: translateY(-4px);
}
.cover {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
}
.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--primary);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.info {
  padding: 12px;
}
.info h3 {
  font-size: 14px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.info p {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
