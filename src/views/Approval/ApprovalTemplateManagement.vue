<template>
  <div class="approval-template-management">
    <div class="page-header">
      <div class="header-content">
        <h1>결재 양식 관리</h1>
        <p>사용 가능한 결재 양식들을 관리합니다.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="createTemplate">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">새 양식 추가</span>
        </el-button>
      </div>
    </div>

    <el-card shadow="never" class="template-list-card">
      <el-table :data="templates" style="width: 100%">
        <el-table-column prop="title" label="양식 제목" sortable>
          <template #default="scope">
            <el-button type="text" @click="viewTemplate(scope.row)">{{ scope.row.title }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="카테고리" width="150" />
        <el-table-column prop="description" label="설명" />
        <el-table-column label="사용 여부" width="120" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.isActive" />
          </template>
        </el-table-column>
        <el-table-column label="관리" width="180" align="center">
          <template #default="scope">
            <el-button size="small" :icon="Edit" @click="editTemplate(scope.row)">편집</el-button>
            <el-button size="small" type="danger" :icon="Delete" @click="deleteTemplate(scope.row)">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 양식 추가/편집 모달 (더미) -->
    <el-dialog
      v-model="showTemplateEditModal"
      :title="editMode ? '양식 편집' : '새 양식 추가'"
      width="600px"
    >
      <el-form :model="currentTemplate" label-width="100px">
        <el-form-item label="제목">
          <el-input v-model="currentTemplate.title" />
        </el-form-item>
        <el-form-item label="카테고리">
          <el-input v-model="currentTemplate.category" />
        </el-form-item>
        <el-form-item label="설명">
          <el-input type="textarea" v-model="currentTemplate.description" />
        </el-form-item>
        <el-form-item label="활성화">
          <el-switch v-model="currentTemplate.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTemplateEditModal = false">취소</el-button>
        <el-button type="primary" @click="saveTemplate">저장</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';

const templates = ref([
  { id: 'expense_report', title: '공비금 지출결의서', category: '비용', description: '업무 관련 비용 지출을 결의합니다.', isActive: true },
  { id: 'overtime_request', title: '연장근무신청서', category: '근태', description: '연장 근무를 신청합니다.', isActive: true },
  { id: 'leave_request', title: '휴가신청서', category: '인사', description: '연차, 반차, 병가 등 휴가를 신청합니다.', isActive: true },
  { id: 'business_trip_report', title: '출장 보고서', category: '업무', description: '출장 결과를 보고합니다.', isActive: true },
  { id: 'resource_booking', title: '자원 예약 신청', category: '자원', description: '회의실, 차량 등 자원을 예약합니다.', isActive: false },
]);

const showTemplateEditModal = ref(false);
const editMode = ref(false);
const currentTemplate = ref({});

const createTemplate = () => {
  editMode.value = false;
  currentTemplate.value = { title: '', category: '', description: '', isActive: true };
  showTemplateEditModal.value = true;
};

const editTemplate = (template) => {
  editMode.value = true;
  currentTemplate.value = { ...template };
  showTemplateEditModal.value = true;
};

const saveTemplate = () => {
  if (editMode.value) {
    const index = templates.value.findIndex(t => t.id === currentTemplate.value.id);
    if (index !== -1) {
      templates.value[index] = { ...currentTemplate.value };
    }
  } else {
    const newId = `template_${Date.now()}`;
    templates.value.push({ ...currentTemplate.value, id: newId });
  }
  showTemplateEditModal.value = false;
};

const deleteTemplate = (template) => {
  if (confirm(`'${template.title}' 양식을 정말로 삭제하시겠습니까?`)) {
    templates.value = templates.value.filter(t => t.id !== template.id);
  }
};

const viewTemplate = (template) => {
  alert(`'${template.title}' 양식 상세보기 (실제로는 상세 페이지로 이동)`);
  // In a real app, this would navigate to a template detail/preview page
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
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

.header-actions {
  display: flex;
}

.template-list-card {
  margin-top: 20px;
}
</style>
