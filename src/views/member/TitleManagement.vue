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

      <el-table :data="title" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="직책명" />
        <el-table-column label="액션" width="150">
          <template #default="scope">
            <el-button size="small" @click="openEditModal(scope.row)" v-if="canUpdateTitle">수정</el-button>
            <el-button size="small" type="danger" @click="deleteTitle(scope.row)" v-if="canDeleteTitle">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="modalTitle" width="500px">
      <el-form :model="currentTitle" label-position="top">
        <el-form-item label="직책명">
          <el-input v-model="currentTitle.name" placeholder="예: 팀장, 실장"></el-input>
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

const { checkPermission } = usePermissions();
const { success, error, info } = useSnackbar(); // Initialize useSnackbar
const isEdit = ref(false);
const loading = ref(false);
const title = ref([]);
const dialogVisible = ref(false);
const currentTitle = ref({ id: null, name: '' });
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
      await titleService.createTitle({ name: currentTitle.value.name });
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
</style>