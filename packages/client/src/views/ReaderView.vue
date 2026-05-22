<template>
  <div class="reader" :class="{ dark: readerStore.isDarkMode }">
    <div class="toolbar" v-show="showToolbar" @click.stop>
      <button @click="goBack">返回</button>
      <span class="title">{{ comicTitle }}</span>
      <span class="page-info">{{ readerStore.currentPage + 1 }} / {{ readerStore.pages.length }}</span>
      <button @click="readerStore.toggleDarkMode()">
        {{ readerStore.isDarkMode ? '浅色' : '深色' }}
      </button>
    </div>

    <div class="pages-container" ref="containerRef" @click="toggleToolbar" @scroll="onScroll">
      <div
        v-for="(page, index) in readerStore.pages"
        :key="index"
        class="page-wrapper"
        :data-index="index"
      >
        <img
          v-if="shouldLoadImage(index)"
          :src="getImageUrl(index)"
          :alt="`Page ${index + 1}`"
          loading="lazy"
          @error="handleImageError($event, index)"
        />
        <div v-else class="page-placeholder"></div>
      </div>
    </div>

    <div class="progress-bar">
      <input
        type="range"
        :min="0"
        :max="readerStore.pages.length - 1"
        :value="readerStore.currentPage"
        @input="jumpToPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useReaderStore } from '@/stores/reader';
import { useComicStore } from '@/stores/comic';

const route = useRoute();
const router = useRouter();
const readerStore = useReaderStore();
const comicStore = useComicStore();

const containerRef = ref<HTMLElement>();
const showToolbar = ref(false);
const comicTitle = ref('');

const comicId = computed(() => Number(route.params.id));
const episodeId = computed(() => route.params.epId ? Number(route.params.epId) : undefined);

let saveTimer: number;

function getImageUrl(index: number): string {
  const base = episodeId.value
    ? `/api/comics/${comicId.value}/episodes/${episodeId.value}/pages/${index}`
    : `/api/comics/${comicId.value}/pages/${index}`;
  const width = window.innerWidth < 768 ? window.innerWidth : undefined;
  return width ? `${base}?width=${width}` : base;
}

function shouldLoadImage(index: number): boolean {
  const diff = Math.abs(index - readerStore.currentPage);
  return diff <= 3;
}

function toggleToolbar() {
  showToolbar.value = !showToolbar.value;
}

function goBack() {
  router.push(`/comic/${comicId.value}`);
}

function onScroll() {
  if (!containerRef.value) return;
  const scrollTop = containerRef.value.scrollTop;
  const scrollHeight = containerRef.value.scrollHeight - containerRef.value.clientHeight;
  readerStore.scrollPosition = scrollTop / scrollHeight;

  const pages = containerRef.value.querySelectorAll('.page-wrapper');
  for (let i = 0; i < pages.length; i++) {
    const rect = pages[i].getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
      readerStore.currentPage = i;
      break;
    }
  }

  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    readerStore.saveProgress(comicId.value, episodeId.value);
  }, 1000);
}

function jumpToPage(e: Event) {
  const target = e.target as HTMLInputElement;
  const page = parseInt(target.value, 10);
  readerStore.currentPage = page;
  const pageEl = containerRef.value?.querySelector(`[data-index="${page}"]`);
  pageEl?.scrollIntoView({ behavior: 'smooth' });
}

function handleImageError(e: Event, index: number) {
  const img = e.target as HTMLImageElement;
  setTimeout(() => {
    img.src = getImageUrl(index);
  }, 2000);
}

onMounted(async () => {
  await comicStore.fetchComic(comicId.value);
  comicTitle.value = comicStore.currentComic?.title || '';
  await readerStore.loadPages(comicId.value, episodeId.value);
  await readerStore.loadProgress(comicId.value, episodeId.value);

  if (readerStore.currentPage > 0) {
    setTimeout(() => {
      const pageEl = containerRef.value?.querySelector(`[data-index="${readerStore.currentPage}"]`);
      pageEl?.scrollIntoView();
    }, 100);
  }
});

onUnmounted(() => {
  clearTimeout(saveTimer);
  readerStore.saveProgress(comicId.value, episodeId.value);
});
</script>

<style scoped>
.reader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  flex-direction: column;
}
.reader.dark {
  background: #1a1a1a;
}
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.title {
  flex: 1;
  text-align: center;
}
.pages-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.page-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.page-wrapper img {
  max-width: 100%;
  height: auto;
}
.page-placeholder {
  width: 100%;
  height: 100vh;
  background: #f0f0f0;
}
.progress-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.5);
}
.progress-bar input {
  width: 100%;
}
</style>
