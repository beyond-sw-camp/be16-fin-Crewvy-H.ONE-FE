# 스낵바 컴포넌트 사용법

## 개요
공통으로 사용할 수 있는 스낵바 컴포넌트입니다. 성공, 오류, 경고, 정보 메시지를 표시할 수 있습니다.

## 사용법

### 1. 기본 사용법

```javascript
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  setup() {
    const { success, error, warning, info } = useSnackbar()
    
    return {
      success,
      error,
      warning,
      info
    }
  },
  methods: {
    showSuccess() {
      this.success('작업이 성공적으로 완료되었습니다.')
    },
    showError() {
      this.error('오류가 발생했습니다.')
    },
    showWarning() {
      this.warning('주의가 필요합니다.')
    },
    showInfo() {
      this.info('정보를 확인해주세요.')
    }
  }
}
```

### 2. 옵션 사용법

```javascript
// 제목과 함께 표시
this.success('저장되었습니다.', {
  title: '성공',
  duration: 5000
})

// 위치 지정
this.info('새로운 알림이 있습니다.', {
  position: 'top-right',
  duration: 3000
})

// 자동 닫기 비활성화
this.warning('중요한 알림입니다.', {
  duration: 0  // 자동으로 닫히지 않음
})
```

### 3. 옵션 목록

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `type` | String | 'info' | 메시지 타입 (success, error, warning, info) |
| `title` | String | '' | 제목 |
| `message` | String | - | 메시지 내용 (필수) |
| `duration` | Number | 4000 | 자동 닫기 시간 (밀리초, 0이면 자동 닫기 안함) |
| `position` | String | 'bottom-right' | 표시 위치 (top-left, top-right, bottom-left, bottom-right) |

### 4. 스타일 커스터마이징

각 타입별로 다른 색상이 적용됩니다:
- **Success**: 파란색 계열
- **Error**: 빨간색 계열  
- **Warning**: 주황색 계열
- **Info**: 파란색 계열

### 5. 여러 스낵바 동시 표시

여러 개의 스낵바를 동시에 표시할 수 있으며, 각각 독립적으로 관리됩니다.

```javascript
this.success('첫 번째 작업 완료')
this.info('두 번째 작업 진행 중')
this.warning('세 번째 작업 주의 필요')
```

## 파일 구조

```
src/
├── components/
│   ├── Snackbar.vue           # 스낵바 컴포넌트
│   └── SnackbarContainer.vue # 스낵바 컨테이너
├── composables/
│   └── useSnackbar.js        # 스낵바 로직
└── App.vue                   # 메인 앱 (SnackbarContainer 포함)
```
