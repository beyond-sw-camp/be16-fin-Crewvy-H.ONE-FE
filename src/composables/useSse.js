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

    try {
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

      eventSource.addEventListener('notification', (event) => {
        const newNotification = JSON.parse(event.data);
        store.dispatch('notification/addNotification', newNotification);
      });

      eventSource.onerror = (event) => {
        // SSE 연결 에러 처리
        // readyState 확인:
        // 0 = CONNECTING (연결 중)
        // 1 = OPEN (연결됨)
        // 2 = CLOSED (연결 종료)
        
        // 연결이 이미 종료된 상태면 조용히 처리
        if (eventSource.readyState === EventSourcePolyfill.CLOSED) {
          // 백엔드 연결이 끊겼을 때 발생하는 정상적인 상황
          // 사용자에게 노출하지 않고 조용히 처리
          if (process.env.NODE_ENV === 'development') {
            console.warn('SSE connection closed (handled silently)');
          }
          return;
        }
        
        // 연결 중 에러가 발생한 경우
        if (eventSource.readyState === EventSourcePolyfill.CONNECTING) {
          // 개발 환경에서만 콘솔 로그 출력
          if (process.env.NODE_ENV === 'development') {
            console.warn('SSE connection error while connecting (handled silently):', event);
          }
          // 네트워크 에러는 조용히 처리 (사용자에게 노출 안 함)
          return;
        }
        
        // 기타 에러는 개발 환경에서만 로그
        if (process.env.NODE_ENV === 'development') {
          console.warn('SSE error (handled silently):', event);
        }
      };

      sse.value = eventSource;
    } catch (error) {
      // SSE 연결 실패 시 조용히 처리 (사용자에게 노출 안 함)
      // 네트워크 에러는 백엔드 연결이 끊겼을 때 발생할 수 있는 정상적인 상황
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to connect to SSE (handled silently):', error);
      }
    }
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