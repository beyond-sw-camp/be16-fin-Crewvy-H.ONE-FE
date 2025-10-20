<template>
  <div class="title-management-page">
    <div class="page-header">
      <h1>직책 관리</h1>
    </div>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>직책 목록</span>
          <el-button type="primary" @click="openAddModal" v-if="canCreateTitle">
            <el-icon style="margin-right: 8px">
              <Plus />
            </el-icon> 새로운 직책 추가
          </el-button>
        </div>
      </template>

      <draggable v-model="title" item-key="id" handle=".drag-handle" @end="handleTitleReorder" v-loading="loading" class="draggable-list">
        <template #item="{ element }">
          <div class="draggable-item">
            <div class="drag-handle">
              <el-icon><Rank /></el-icon>
              {{ element.name }}
            </div>
            <div class="actions">
              <el-button size="small" @click="openEditModal(element)" v-if="canUpdateTitle">수정</el-button>
              <el-button size="small" type="danger" @click="deleteTitle(element)" v-if="canDeleteTitle">삭제</el-button>
            </div>
          </div>
        </template>
      </draggable>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="modalTitle" width="500px" @opened="handleDialogOpened">
      <el-form :model="currentTitle" label-position="top" @submit.prevent="saveTitle"> <!-- @submit.prevent="saveTitle" 추가 -->
        <el-form-item label="직책명">
          <el-input ref="titleNameInput" v-model="currentTitle.name" placeholder="예: 팀장, 실장"></el-input> <!-- ref 추가, @keyup.enter 제거 -->
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">취소</el-button>
          <el-button type="primary" @click="saveTitle">저장</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import titleService from '@/api/titleService';
import { usePermissions } from '@/composables/usePermissions';
import { useSnackbar } from '@/composables/useSnackbar'; // Import useSnackbar
import draggable from 'vuedraggable'; // draggable 임포트
import { Plus, Rank } from '@element-plus/icons-vue'; // Rank 아이콘 임포트

const { checkPermission } = usePermissions();
const { success, error, info } = useSnackbar(); // Initialize useSnackbar
const isEdit = ref(false);
const loading = ref(false);
const title = ref([]);
const dialogVisible = ref(false);
const titleNameInput = ref(null); // ref 선언
const currentTitle = ref({ id: null, name: '' });

// 모달이 열릴 때 입력 필드에 포커스
const handleDialogOpened = () => {
  if (titleNameInput.value) {
    titleNameInput.value.focus();
  }
};
const canCreateTitle = ref(false);
const canUpdateTitle = ref(false);
const canDeleteTitle = ref(false);

const modalTitle = computed(() => {
  return isEdit.value ? '직책 수정' : '직책 추가';
});

const checkPermissions = async () => {
  canCreateTitle.value = await checkPermission('member', 'CREATE', 'COMPANY');
  canUpdateTitle.value = await checkPermission('member', 'UPDATE', 'COMPANY');
  canDeleteTitle.value = await checkPermission('member', 'DELETE', 'COMPANY');
};

const fetchTitle = async () => {
  loading.value = true;
  try {
    title.value = await titleService.getTitle();
  } catch (err) {
    const errorMessage = err.response?.data?.message || '직책 목록을 불러오는 데 실패했습니다.';
    error(errorMessage);
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEdit.value = false;
  currentTitle.value = { id: null, name: '' };
  dialogVisible.value = true;
};

const openEditModal = (title) => {
  isEdit.value = true;
  currentTitle.value = { ...title };
  dialogVisible.value = true;
};

const saveTitle = async () => {
  loading.value = true;
  try {
    if (isEdit.value) {
      await titleService.updateTitle(currentTitle.value.id, { name: currentTitle.value.name });
      success('직책이 수정되었습니다.');
    } else {
      // 새로운 직책 추가 시 displayOrder 설정
      const newDisplayOrder = title.value.length > 0 ? Math.max(...title.value.map(t => t.displayOrder)) + 1 : 0;
      await titleService.createTitle({ name: currentTitle.value.name, displayOrder: newDisplayOrder });
      success('새로운 직책이 추가되었습니다.');
    }
    dialogVisible.value = false;
    await fetchTitle();
  } catch (error) {
    const errorMessage = error.response?.data?.message || '직책 저장에 실패했습니다.';
    error(errorMessage);
    console.error("Error saving title:", error);
  } finally {
    loading.value = false;
  }
};

const deleteTitle = async (title) => {
  ElMessageBox.confirm(`'${title.name}' 직책을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`, '경고', {
    confirmButtonText: '삭제',
    cancelButtonText: '취소',
    type: 'warning'
  }).then(async () => {
    loading.value = true;
    try {
      await titleService.deleteTitle(title.id);
      success('삭제되었습니다.');
      await fetchTitle();
    } catch (error) {
      const errorMessage = error.response?.data?.message || '직책 삭제에 실패했습니다.';
      error(errorMessage);
      console.error("Error deleting title:", error);
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    info('삭제가 취소되었습니다.');
  });
};

const handleTitleReorder = async () => {
  loading.value = true;
  try {
    const titleIds = title.value.map(t => t.id);
    const memberPositionId = localStorage.getItem('memberPositionId'); // 예시: localStorage에서 가져옴
    if (!memberPositionId) {
      throw new Error("MemberPositionId not found.");
    }

    console.log('--- Reorder Title Request ---');
    console.log('memberPositionId:', memberPositionId);
    console.log('titleIds:', titleIds);

    await titleService.reorderTitle(memberPositionId, titleIds);
    success('직책 순서가 변경되었습니다.');
  } catch (err) {
    const errorMessage = err.response?.data?.message || '직책 순서 변경에 실패했습니다.';
    error(errorMessage);
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkPermissions();
  fetchTitle();
});
</script>

<style scoped>
.title-management-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.box-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: 600;
}

.el-table th {
  background-color: #f5f7fa;
}

.dialog-footer {
  text-align: right;
}

/* Draggable List Styles */
.draggable-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.draggable-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  cursor: grab;
}

.draggable-item:last-child {
  border-bottom: none;
}

.drag-handle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.actions {
  display: flex;
  gap: 10px;
}
</style>