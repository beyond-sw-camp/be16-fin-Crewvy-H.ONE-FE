<template>
  <el-dialog
    :model-value="visible"
    title="결재라인 편집"
    width="800px"
    top="10vh"
    @update:modelValue="$emit('update:visible', $event)"
    @closed="resetState"
  >
    <div class="modal-body">
      <el-row :gutter="24">
        <!-- Left: Organization Tree -->
        <el-col :span="10">
          <el-input
            v-model="searchQuery"
            placeholder="직원 검색..."
            clearable
            class="search-input"
          />
          <div class="org-tree-container">
            <div v-if="filteredOrgData.length === 0" class="empty-list">검색 결과가 없습니다.</div>
            <div v-for="dept in filteredOrgData" :key="dept.name" class="org-section">
              <div class="dept-title">{{ dept.name }}</div>
              <div
                v-for="member in dept.members"
                :key="member.name"
                class="member-item"
                @click="addApprover(member)"
              >
                <el-avatar size="small">{{ member.name[0] }}</el-avatar>
                <div class="member-info">
                  <strong>{{ member.name }}</strong>
                  <span>{{ member.position }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <!-- Right: Approval Line -->
        <el-col :span="14">
           <div class="approval-line-header">결재 순서</div>
           <div class="approver-list">
              <div v-if="localApprovers.length === 0" class="empty-list">
                좌측 조직도에서 결재자를 추가하세요.
              </div>
              <div
                v-for="(approver, index) in localApprovers"
                :key="approver.name"
                class="approver-card"
              >
                <div class="approver-info">
                  <strong>{{ index + 1 }}. {{ approver.name }}</strong>
                  <span>{{ approver.position }}</span>
                </div>
                <el-button 
                  @click="removeApprover(index)" 
                  type="danger" 
                  :icon="Delete" 
                  circle 
                  plain 
                />
              </div>
           </div>
           <el-alert title="결재자를 드래그하여 순서를 변경할 수 있습니다." type="info" :closable="false" show-icon class="tip-alert" />
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">취소</el-button>
      <el-button type="primary" @click="save">저장</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from 'vue';
import { Delete } from '@element-plus/icons-vue';

const props = defineProps({
  visible: Boolean,
  currentApprovers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'update:approvers']);

const searchQuery = ref('');
const localApprovers = ref([]);

const orgData = ref([
  { name: "영업부", members: [{ name: "김대리", position: "대리" }, { name: "박과장", position: "과장" }, { name: "이부장", position: "부장" }] },
  { name: "마케팅부", members: [{ name: "최대리", position: "대리" }, { name: "정과장", position: "과장" }] },
  { name: "인사부", members: [{ name: "한대리", position: "대리" }, { name: "윤과장", position: "과장" }] },
  { name: "개발부", members: [{ name: "강사원", position: "사원" }, { name: "오팀장", position: "팀장" }] },
]);

const filteredOrgData = computed(() => {
  if (!searchQuery.value) return orgData.value;
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  const filtered = [];
  orgData.value.forEach(dept => {
    const filteredMembers = dept.members.filter(m => m.name.toLowerCase().includes(lowerCaseQuery));
    if (filteredMembers.length > 0) {
      filtered.push({ ...dept, members: filteredMembers });
    }
  });
  return filtered;
});

watch(() => props.visible, (newVal) => {
  if (newVal) {
    localApprovers.value = JSON.parse(JSON.stringify(props.currentApprovers));
  }
});

const addApprover = (member) => {
  if (!localApprovers.value.find((a) => a.name === member.name)) {
    localApprovers.value.push(member);
  }
};

const removeApprover = (index) => {
  localApprovers.value.splice(index, 1);
};

const save = () => {
  emit('update:approvers', localApprovers.value);
  emit('update:visible', false);
};

const resetState = () => {
  searchQuery.value = '';
}

</script>

<style scoped>
.search-input {
  margin-bottom: 12px;
}

.org-tree-container,
.approver-list {
  height: 55vh;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 10px;
}

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--el-text-color-placeholder);
}

.dept-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--el-text-color-primary);
  margin: 10px 0 5px 5px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.member-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.member-info {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}
.member-info span {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.approval-line-header {
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 10px;
  margin-bottom: 12px;
}

.approver-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: #fafafa;
}

.approver-info {
  display: flex;
  flex-direction: column;
}

.approver-info span {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.tip-alert {
  margin-top: 12px;
}
</style>