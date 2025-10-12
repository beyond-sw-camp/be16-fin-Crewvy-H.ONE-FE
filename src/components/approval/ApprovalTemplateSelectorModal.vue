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
      <div class="template-list-form">
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
          :class="{ 'selected': selectedTemplate && selectedTemplate.id === template.id }"
          @click="selectItem(template)"
        >
          <span class="icon">📄</span>
          <span class="template-title">{{ template.title }}</span>
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
        양식 선택하기
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'ApprovalTemplateSelectorModal',
  props: {
    visible: Boolean,
  },
  emits: ['update:visible', 'select'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const selectedTemplate = ref(null);
    const templates = ref([]);

    const fetchTemplates = async () => {
      try {
        const response = await axios.get('http://localhost:8080/approval/get-document-list');
        templates.value = response.data.map(item => ({
          id: item.documentId,
          title: item.documentName,
        }));
      } catch (error) {
        console.error('Failed to fetch approval templates:', error);
        // Optionally, you can use a snackbar or other UI element to notify the user.
      }
    };

    onMounted(() => {
      fetchTemplates();
    });

    const filteredTemplates = computed(() => {
      if (!searchQuery.value) {
        return templates.value;
      }
      return templates.value.filter(t => 
        t.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    const selectItem = (template) => {
      selectedTemplate.value = template;
    };

    const confirmSelection = () => {
      if (selectedTemplate.value) {
        emit('select', selectedTemplate.value.id);
        selectedTemplate.value = null;
      }
    };
    
    watch(() => props.visible, (newValue) => {
      if (newValue) {
        // When the modal becomes visible, fetch the latest templates
        fetchTemplates();
      } else {
        selectedTemplate.value = null;
        searchQuery.value = '';
      }
    });

    return { 
      searchQuery, 
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
  height: 50vh; /* Adjusted height */
  display: flex;
  flex-direction: column;
}
.search-input {
  margin-bottom: 16px;
}
.template-list-form {
  flex-grow: 1;
  overflow-y: auto;
  padding-right: 8px; /* For scrollbar */
}
.template-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #fff;
}
.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
.template-card.selected {
  background-color: #f0f9ff;
  border-color: #409eff;
}
.icon {
  margin-right: 16px;
  font-size: 24px;
}
.template-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}
</style>