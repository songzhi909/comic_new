import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/utils/api';

export const useReaderStore = defineStore('reader', () => {
  const pages = ref<string[]>([]);
  const currentPage = ref(0);
  const scrollPosition = ref(0);
  const isDarkMode = ref(false);

  async function loadPages(comicId: number, episodeId?: number) {
    const url = episodeId
      ? `/comics/${comicId}/episodes/${episodeId}/pages`
      : `/comics/${comicId}/pages`;
    const result = await api.get<{ pages: string[] }>(url);
    pages.value = result.pages;
  }

  async function loadProgress(comicId: number, episodeId?: number) {
    const url = episodeId
      ? `/comics/${comicId}/episodes/${episodeId}/progress`
      : `/comics/${comicId}/progress`;
    const result = await api.get<any>(url);
    currentPage.value = result.current_page || 0;
    scrollPosition.value = result.scroll_position || 0;
  }

  async function saveProgress(comicId: number, episodeId?: number) {
    const url = episodeId
      ? `/comics/${comicId}/episodes/${episodeId}/progress`
      : `/comics/${comicId}/progress`;
    await api.put(url, {
      current_page: currentPage.value,
      scroll_position: scrollPosition.value,
    });
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value;
  }

  return { pages, currentPage, scrollPosition, isDarkMode, loadPages, loadProgress, saveProgress, toggleDarkMode };
});
