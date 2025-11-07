import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(ElementPlus)

// Element Plus 아이콘 등록
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Fix for ResizeObserver loop completed with undelivered notifications
// This is a common workaround for issues with UI libraries like Element Plus
// that use ResizeObserver, especially when elements are dynamically resized or removed.
const debounce = (fn, delay) => {
  let timeout = null;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(context, args), delay);
  };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    super(debounce(callback, 16)); // Debounce with a delay of 16ms (approx. 1 frame at 60fps)
  }
};

app.mount('#app')
