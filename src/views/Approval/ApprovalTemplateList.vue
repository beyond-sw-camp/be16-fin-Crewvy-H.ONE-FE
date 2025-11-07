<template>
  <div class="template-list-container">
    <div class="page-header">
      <h1>결재 템플릿 관리</h1>
    </div>

    <el-table :data="templates" style="width: 100%">
      <el-table-column prop="documentName" label="템플릿 이름" />
      <el-table-column prop="description" label="설명" />
      <el-table-column label="관리" width="180">
        <template #default="scope">
          <el-button size="small" @click="openPolicyEditor(scope.row)">정책관리</el-button>
        </template>
      </el-table-column>
    </el-table>

    <PolicyEditorModal 
      v-if="showPolicyEditor"
      :visible="showPolicyEditor" 
      :document-id="selectedTemplate ? selectedTemplate.documentId : null"
      @update:visible="showPolicyEditor = $event"
      @save="handleSavePolicy"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import apiClient from '@/api/http';
import PolicyEditorModal from '@/components/approval/PolicyEditorModal.vue';

export default {
  name: 'ApprovalTemplateList',
  components: {
    PolicyEditorModal,
  },
  setup() {
    const templates = ref([]);
    const showPolicyEditor = ref(false);
    const selectedTemplate = ref(null);

    const fetchTemplates = async () => {
      try {
        const response = await apiClient.get('/workforce-service/approval/get-document-list');
        templates.value = response.data.data;
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };

    onMounted(fetchTemplates);

    const openPolicyEditor = (template) => {
      selectedTemplate.value = template;
      showPolicyEditor.value = true;
    };

    const handleSavePolicy = (policy) => {
      console.log('Saving policy:', policy);
      // After saving, you might want to refresh the templates list
      // fetchTemplates();
    };

    return {
      templates,
      showPolicyEditor,
      openPolicyEditor,
      handleSavePolicy,
      selectedTemplate,
    };
  },
};
</script>

<style scoped>
.template-list-container {
  padding: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
</style>
