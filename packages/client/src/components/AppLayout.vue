<template>
  <div class="app-layout">
    <nav class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-header">
        <h2>漫画阅读器</h2>
        <button class="close-btn" @click="sidebarOpen = false">&times;</button>
      </div>
      <router-link to="/" @click="sidebarOpen = false">书架</router-link>
      <router-link to="/library" @click="sidebarOpen = false">漫画库</router-link>
      <router-link to="/tags" @click="sidebarOpen = false">标签</router-link>
      <router-link to="/settings" @click="sidebarOpen = false">设置</router-link>
      <router-link v-if="authStore.user?.role === 'admin'" to="/admin/users" @click="sidebarOpen = false">用户管理</router-link>
      <router-link v-if="authStore.user?.role === 'admin'" to="/admin/invite-codes" @click="sidebarOpen = false">授权码</router-link>
      <button class="logout-btn" @click="authStore.logout()">退出</button>
    </nav>

    <div class="sidebar-overlay" v-if="sidebarOpen" @click="sidebarOpen = false"></div>

    <main class="content">
      <button class="menu-btn" @click="sidebarOpen = true">&#9776;</button>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const sidebarOpen = ref(false);
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: var(--bg-card);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-right: 1px solid var(--border);
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  display: none;
  background: none;
  font-size: 24px;
  padding: 0;
}

.sidebar a {
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--text);
}

.sidebar a.router-link-active {
  background: var(--primary);
  color: white;
}

.logout-btn {
  margin-top: auto;
  background: var(--danger);
  color: white;
}

.sidebar-overlay {
  display: none;
}

.content {
  flex: 1;
  padding: 20px;
  margin-left: 220px;
}

.menu-btn {
  display: none;
  background: none;
  font-size: 24px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .close-btn {
    display: block;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .content {
    margin-left: 0;
  }

  .menu-btn {
    display: block;
  }
}

@media (min-width: 769px) {
  .sidebar {
    transform: translateX(0);
  }
}
</style>
