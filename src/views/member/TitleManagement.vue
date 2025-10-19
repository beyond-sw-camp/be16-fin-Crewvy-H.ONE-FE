<template>
  <div class="title-management-page">
    <div class="page-header">
      <h1>직책 관리</h1>
    </div>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>직책 목록</span>
          <div>
            <el-switch v-if="canDeleteTitle" v-model="showDeleted" inline-prompt active-text="삭제 포함" inactive-text="삭제 제외" style="margin-right: 16px;"/>
            <el-button type="primary" @click="openAddModal" v-if="canCreateTitle">
              <el-icon style="margin-right: 8px"><Plus /></el-icon> 새로운 직책 추가
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="filteredTitle" style="width: 100%" row-key="id" v-loading="loading" ref="tableRef" class="title-table">
        <el-table-column label="" width="50">
          <template #default>
            <div class="drag-handle">
              <el-icon><Grid /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="순서" width="80">
          <template #default="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="직책명"></el-table-column>
        <el-table-column label="상태" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.ynDel === true ? 'danger' : 'success'" disable-transitions>
              {{ scope.row.ynDel === true ? '삭제됨' : '사용중' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="액션" width="150">
          <template #default="scope">
            <el-button size="small" @click="openEditModal(scope.row)" v-if="canUpdateTitle && !scope.row.ynDel">수정</el-button>
            <el-button size="small" type="danger" @click="deleteTitle(scope.row)" v-if="canDeleteTitle && !scope.row.ynDel">삭제</el-button>
            <el-button size="small" @click="restoreTitle(scope.row)" v-if="canDeleteTitle && scope.row.ynDel">복원</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="modalTitle" width="500px" @opened="handleDialogOpened">
      <el-form :model="currentTitle" label-position="top" @submit.prevent="saveTitle">
        <el-form-item label="직책명">
          <el-input ref="titleNameInput" v-model="currentTitle.name" placeholder="예: 팀장, 실장"></el-input>
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
import { useSnackbar } from '@/composables/useSnackbar';
import { Plus, Grid } from '@element-plus/icons-vue';
import Sortable from 'sortablejs';

const { checkPermission } = usePermissions();
const { success, error, info } = useSnackbar();
const isEdit = ref(false);
const loading = ref(false);
const title = ref([]);
const dialogVisible = ref(false);
const titleNameInput = ref(null);
const currentTitle = ref({ id: null, name: '' });
const tableRef = ref(null);
const showDeleted = ref(false);

const filteredTitle = computed(() => {
  if (showDeleted.value) {
    return title.value;
  }
  return title.value.filter(t => !t.ynDel);
});

const initSortable = () => {
  const tbody = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody');
  Sortable.create(tbody, {
    handle: '.drag-handle',
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt;
      const movedItem = title.value.splice(oldIndex, 1)[0];
      title.value.splice(newIndex, 0, movedItem);
      handleTitleReorder();
    },
  });
};

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
  ElMessageBox.confirm(`'${title.name}' 직책을 삭제하시겠습니까?`, '경고', {
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

const restoreTitle = async (title) => {
  ElMessageBox.confirm(`'${title.name}' 직책을 복원하시겠습니까?`, '확인', {
    confirmButtonText: '복원',
    cancelButtonText: '취소',
    type: 'info'
  }).then(async () => {
    loading.value = true;
    try {
      await titleService.restoreTitle(title.id);
      success('복원되었습니다.');
      await fetchTitle();
    } catch (error) {
      const errorMessage = error.response?.data?.message || '직책 복원에 실패했습니다.';
      error(errorMessage);
      console.error("Error restoring title:", error);
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    info('복원이 취소되었습니다.');
  });
};

const handleTitleReorder = async () => {
  loading.value = true;
  try {
    const titleIds = title.value.map(t => t.id);
    const memberPositionId = localStorage.getItem('memberPositionId');
    if (!memberPositionId) {
      throw new Error("MemberPositionId not found.");
    }

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
  initSortable();
});
</script>

<style scoped>
.title-management-page {
  max-width: 1200px;
  margin: 0 auto;
}

.drag-handle {
  cursor: grab;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
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

.title-table {
  font-size: 16px;
}

.el-table th {
  background-color: #f5f7fa;
}

.dialog-footer {
  text-align: right;
}
</style>
