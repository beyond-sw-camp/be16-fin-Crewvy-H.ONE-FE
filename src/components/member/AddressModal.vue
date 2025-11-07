<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <div class="modal-header">
          <h3>주소 검색</h3>
          <button @click="close" class="close-button" aria-label="닫기">
            &times;
          </button>
        </div>
        <div id="postcode-container"></div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AddressModal',
  mounted() {
    this.loadDaumPostcodeScript();
  },
  methods: {
    loadDaumPostcodeScript() {
      const script = document.createElement('script');
      script.src =
        '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => this.openAddressSearch();
      document.head.appendChild(script);
    },
    openAddressSearch() {
      const container = document.getElementById('postcode-container');
      
      if (container) {
        new window.daum.Postcode({
          oncomplete: (data) => {
            this.$emit('address-selected', data);
            this.close();
          },
          
          // --- 💡 여기가 핵심 수정 사항입니다 ---
          onresize: (size) => {
            // API가 자체적으로 계산한 높이(size.height)를
            // 컨테이너(#postcode-container)의 높이로 설정합니다.
            // 이렇게 하면 불필요한 공백이 사라집니다.
            container.style.height = size.height + 'px';
          },
          // --- 💡 여기까지 ---

          width: '100%',
          height: '100%', // 이 옵션은 부모 요소(container)의 크기를 따르도록 함
        }).embed(container);
      } else {
        console.error('Postcode container not found.');
      }
    },
    close() {
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
/* 모달 애니메이션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 모달 배경 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 모달 본체 (반응형 적용) */
.modal-content {
  background-color: white;
  padding: 1.75rem; /* 28px */
  border-radius: 0.75rem; /* 12px */
  width: 90vw; /* 화면 너비의 90% */
  max-width: 31.25rem; /* 최대 500px */
  max-height: 90vh; /* 화면 높이의 90%를 넘지 않음 */
  overflow-y: auto; /* 모달 내용이 화면보다 길면 모달 자체 스크롤 */
  display: flex;
  flex-direction: column;
  box-shadow: 0 0.625rem 1.5rem rgba(0, 0, 0, 0.1), 0 0.3125rem 0.625rem rgba(0, 0, 0, 0.05);
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem; /* 24px */
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
}

/* 닫기 버튼 */
.close-button {
  background: transparent;
  border: none;
  font-size: 2rem;
  line-height: 1;
  color: #aaa;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #333;
}

/* 주소 검색 API 컨테이너 */
#postcode-container {
  /*
    [중요]
    height: 500px 고정값을 제거하고,
    API의 기본 높이(약 400px)를 기준으로 min-height를 설정합니다.
    실제 높이는 스크립트의 onresize 콜백에 의해 동적으로 변경됩니다.
  */
  min-height: 400px; /* API의 최소 높이(초기 로딩 시) */
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 0.5rem; /* 8px */
  overflow: hidden; /* 내부 스크롤 방지 */
  
  /* 높이가 변경될 때 부드러운 효과를 줍니다 */
  transition: height 0.3s ease;
}
</style>