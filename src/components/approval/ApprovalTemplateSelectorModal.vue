<template>
  <el-dialog
    :model-value="visible"
    title="결재 양식 선택"
    width="600px"
    top="10vh"
    @update:modelValue="$emit('update:visible', $event)"
  >
    <div class="template-selector-content">
      <el-input
        v-model="searchQuery"
        placeholder="양식 제목으로 검색"
        clearable
        class="search-input"
      />
      <div class="template-list">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-item"
          :class="{ 'selected': selectedTemplate && selectedTemplate.id === template.id }"
          @click="selectItem(template)"
        >
          <span class="icon">📄</span>
          <div class="template-info">
            <div class="template-title">{{ template.title }}</div>
            <div class="template-category">{{ template.category }}</div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">취소</el-button>
      <el-button 
        type="primary" 
        @click="confirmSelection"
        :disabled="!selectedTemplate"
      >
        양식 선택
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'ApprovalTemplateSelectorModal',
  props: {
    visible: Boolean,
  },
  emits: ['update:visible', 'select'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const selectedTemplate = ref(null);

    const templates = ref([
      { id: 'expense_report', title: '공비금 지출결의서', category: '업무결재' },
      { id: 'overtime_request', title: '연장근무신청서', category: '근태결재' },
      { id: 'vacation_request', title: '휴가신청서', category: '인사관리' },
      { id: 'business_trip', title: '출장 신청서', category: '업무결재' }, // Changed from business_trip_report
      { id: 'resource_booking', title: '자원 예약 신청', category: '자원' }, // Changed from purchase_request
      { id: 'other', title: '기타 신청', category: '기타' }, // Added other
    ]);

    const filteredTemplates = computed(() => {
      if (!searchQuery.value) {
        return templates.value;
      }
      return templates.value.filter(t => 
        t.title.includes(searchQuery.value)
      );
    });

    const selectItem = (template) => {
      selectedTemplate.value = template;
    };

    const confirmSelection = () => {
      if (selectedTemplate.value) {
        emit('select', selectedTemplate.value.id);
        // Reset selection after confirming
        selectedTemplate.value = null;
      }
    };
    
    // Watch for the dialog becoming hidden and reset the selection
    watch(() => props.visible, (newValue) => {
      if (!newValue) {
        selectedTemplate.value = null;
        searchQuery.value = '';
      }
    });

    return { 
      searchQuery, 
      templates,
      filteredTemplates, 
      selectedTemplate,
      selectItem,
      confirmSelection 
    };
  },
};
</script>

<style scoped>
.template-selector-content {
  height: 55vh;
  display: flex;
  flex-direction: column;
}
.search-input {
  margin-bottom: 20px;
}
.template-list {
  flex: 1;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 8px;
}
.template-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid transparent;
}
.template-item:hover {
  background-color: var(--el-color-primary-light-9);
}
.template-item.selected {
  background-color: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-5);
}
.icon {
  margin-right: 15px;
  font-size: 20px;
}
.template-info {
  display: flex;
  flex-direction: column;
}
.template-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}
.template-category {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>