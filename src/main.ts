// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import './input.css'; // Подключение Tailwind CSS

const app = createApp(App);
const pinia = createPinia();

// Инициализация Pinia и загрузка данных из localStorage
app.use(pinia);

// Запуск приложения
app.mount('#app');