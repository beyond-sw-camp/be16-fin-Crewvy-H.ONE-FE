<template>
  <div class="grade-management-page">
    <div class="page-header">
      <h1>직급 관리</h1>
    </div>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>직급 목록</span>
          <el-button type="primary" @click="openAddModal" v-if="canCreateGrade">
            <el-icon style="margin-right: 8px">
              <Plus />
            </el-icon> 새로운 직급 추가
          </el-button>
        </div>
      </template>

      <el-table :data="grade" style="width: 100%" row-key="id" v-loading="loading" ref="tableRef" class="grade-table">
        <el-table-column label="" width="50">
          <template #default>
            <div class="drag-handle">
              <el-icon>
                <Grid />
              </el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="순서" width="80">
          <template #default="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="직급명"></el-table-column>
        <el-table-column label="액션" width="150">
          <template #default="scope">
            <el-button size="small" @click="openEditModal(scope.row)" v-if="canUpdateGrade">수정</el-button>
            <el-button size="small" type="danger" @click="deleteGrade(scope.row)" v-if="canDeleteGrade">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="modalTitle" width="500px" @opened="handleDialogOpened">
      <el-form :model="currentGrade" label-position="top" @submit.prevent="saveGrade">
        <el-form-item label="직급명">
          <el-input ref="gradeNameInput" v-model="currentGrade.name" placeholder="예: 사원, 대리, 과장"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">취소</el-button>
          <el-button type="primary" @click="saveGrade">저장</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessageBox } from 'element-plus';
import gradeService from '@/api/gradeService';
import { usePermissions } from '@/composables/usePermissions';
import { useSnackbar } from '@/composables/useSnackbar';
import { Plus, Grid } from '@element-plus/icons-vue';
import Sortable from 'sortablejs';

const { checkPermission } = usePermissions();
const { success, error, info } = useSnackbar();
const isEdit = ref(false);
const loading = ref(false);
const grade = ref([]);
const dialogVisible = ref(false);
const gradeNameInput = ref(null);
const currentGrade = ref({ id: null, name: '' });
const tableRef = ref(null);

const initSortable = () => {
  const tbody = tableRef.value.$el.querySelector('.el-table__body-wrapper tbody');
  Sortable.create(tbody, {
    handle: '.drag-handle',
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt;
      const movedItem = grade.value.splice(oldIndex, 1)[0];
      grade.value.splice(newIndex, 0, movedItem);
      handleGradeReorder();
    },
  });
};

const handleDialogOpened = () => {
  if (gradeNameInput.value) {
    gradeNameInput.value.focus();
  }
};
const canCreateGrade = ref(false);
const canUpdateGrade = ref(false);
const canDeleteGrade = ref(false);

const modalTitle = computed(() => {
  return isEdit.value ? '직급 수정' : '직급 추가';
});

const checkPermissions = async () => {
  canCreateGrade.value = await checkPermission('member', 'CREATE', 'COMPANY');
  canUpdateGrade.value = await checkPermission('member', 'UPDATE', 'COMPANY');
  canDeleteGrade.value = await checkPermission('member', 'DELETE', 'COMPANY');
};

const fetchGrade = async () => {
  loading.value = true;
  try {
    grade.value = await gradeService.getGrade();
  } catch (err) {
    const errorMessage = err.response?.data?.message || '직급 목록을 불러오는 데 실패했습니다.';
    error(errorMessage);
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  isEdit.value = false;
  currentGrade.value = { id: null, name: '' };
  dialogVisible.value = true;
};

const openEditModal = (grade) => {
  isEdit.value = true;
  currentGrade.value = { ...grade };
  dialogVisible.value = true;
};

const saveGrade = async () => {
  loading.value = true;
  try {
    if (isEdit.value) {
      await gradeService.updateGrade(currentGrade.value.id, { name: currentGrade.value.name });
      success('직급이 수정되었습니다.');
    } else {
      const newDisplayOrder = grade.value.length > 0 ? Math.max(...grade.value.map(g => g.displayOrder)) + 1 : 0;
      await gradeService.createGrade({ name: currentGrade.value.name, displayOrder: newDisplayOrder });
      success('새로운 직급이 추가되었습니다.');
    }
    dialogVisible.value = false;
    await fetchGrade();
  } catch (error) {
    const errorMessage = error.response?.data?.message || '직급 저장에 실패했습니다.';
    error(errorMessage);
    console.error("Error saving grade:", error);
  } finally {
    loading.value = false;
  }
};

const deleteGrade = async (grade) => {
  ElMessageBox.confirm(`'${grade.name}' 직급을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`, '경고', {
    confirmButtonText: '삭제',
    cancelButtonText: '취소',
    type: 'warning'
  }).then(async () => {
    loading.value = true;
    try {
      await gradeService.deleteGrade(grade.id);
      success('삭제되었습니다.');
      await fetchGrade();
    } catch (error) {
      const errorMessage = error.response?.data?.message || '직급 삭제에 실패했습니다.';
      error(errorMessage);
      console.error("Error deleting grade:", error);
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    info('삭제가 취소되었습니다.');
  });
};

const handleGradeReorder = async () => {
  loading.value = true;
  try {
    const gradeIds = grade.value.map(g => g.id);
    const memberPositionId = localStorage.getItem('memberPositionId');
    if (!memberPositionId) {
      throw new Error("MemberPositionId not found.");
    }

    await gradeService.reorderGrade(memberPositionId, gradeIds);
    success('직급 순서가 변경되었습니다.');
  } catch (err) {
    const errorMessage = err.response?.data?.message || '직급 순서 변경에 실패했습니다.';
    error(errorMessage);
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkPermissions();
  fetchGrade();
  initSortable();
});
</script>

<style scoped>
.grade-management-page {
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

.grade-table {
  font-size: 16px;
}

.el-table th {
  background-color: #f5f7fa;
}

.dialog-footer {
  text-align: right;
}
</style>