import { ref } from 'vue';
import { useStore } from 'vuex';
import { EventSourcePolyfill } from 'event-source-polyfill';

export function useSse() {
  const store = useStore();
  const sse = ref(null);

  const connect = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('SSE connection failed: No access token found.');
      return;
    }

    const eventSource = new EventSourcePolyfill(
      `${process.env.VUE_APP_API_BASE_URL}/workspace-service/sse/subscribe`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    eventSource.onopen = () => {
      console.log('SSE connection opened.');
    };

    eventSource.addEventListener('notification', () => {
      store.dispatch('notification/incrementUnreadCount');
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    sse.value = eventSource;
  };

  const disconnect = () => {
    if (sse.value) {
      sse.value.close();
      sse.value = null;
      console.log('SSE connection closed.');
    }
  };

  return {
    connect,
    disconnect,
  };
}