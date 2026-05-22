<template>
  <div class="settings-view">
    <h1>设置</h1>

    <section class="settings-section">
      <h2>图片分辨率</h2>
      <div class="setting-item">
        <label>默认分辨率</label>
        <select v-model="resolution" @change="saveSettings">
          <option value="auto">自动（匹配屏幕宽度）</option>
          <option value="original">原图</option>
          <option value="1920">1920px</option>
          <option value="1280">1280px</option>
          <option value="800">800px</option>
        </select>
      </div>
    </section>

    <section class="settings-section">
      <h2>阅读器</h2>
      <div class="setting-item">
        <label>默认深色模式</label>
        <input type="checkbox" v-model="darkMode" @change="saveSettings" />
      </div>
    </section>

    <section class="settings-section">
      <h2>漫画库管理</h2>
      <LibraryManager />
    </section>

    <section class="settings-section">
      <h2>账号</h2>
      <div class="setting-item">
        <button @click="showChangePassword = true">修改密码</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LibraryManager from '@/components/LibraryManager.vue';

const resolution = ref(localStorage.getItem('resolution') || 'auto');
const darkMode = ref(localStorage.getItem('darkMode') === 'true');
const showChangePassword = ref(false);

function saveSettings() {
  localStorage.setItem('resolution', resolution.value);
  localStorage.setItem('darkMode', String(darkMode.value));
}
</script>

<style scoped>
.settings-view {
  max-width: 600px;
}
.settings-section {
  margin-bottom: 32px;
}
.settings-section h2 {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}
</style>
