<template>
  <el-dialog
    :model-value="visible"
    title="결재 상세"
    width="800px"
    @update:modelValue="$emit('update:visible', $event)"
  >
    <div v-if="approval" class="detail-modal-content">
      <el-descriptions :title="approval.title" :column="2" border>
        <el-descriptions-item label="신청자">{{ approval.requester }}</el-descriptions-item>
        <el-descriptions-item label="신청일">{{ approval.date }}</el-descriptions-item>
        <el-descriptions-item label="결재 유형">{{ approval.type }}</el-descriptions-item>
        <el-descriptions-item label="우선순위">
          <el-tag :type="approval.priority === 'high' ? 'danger' : 'warning'">{{ approval.priority === 'high' ? '긴급' : '일반' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="상세 내용" :span="2">{{ approval.description }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>결재선</el-divider>
      <el-timeline>
        <el-timeline-item v-for="(step, index) in approval.steps" :key="index" :timestamp="step.statusText">
          {{ step.name }}
        </el-timeline-item>
      </el-timeline>

      <el-alert title="정책 제약 조건 (예시)" type="info" show-icon :closable="false">
        <p>- 본 휴가는 연차에서 2일 차감됩니다.</p>
        <p>- 신청 마감 기한: 3일 전 (충족)</p>
      </el-alert>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">닫기</el-button>
      <el-button type="danger" @click="$emit('reject', approval)">반려</el-button>
      <el-button type="success" @click="$emit('approve', approval)">승인</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'ApprovalDetailModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    approval: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:visible', 'approve', 'reject'],
};
</script>

<style scoped>
.detail-modal-content .el-descriptions {
  margin-bottom: 20px;
}
.detail-modal-content .el-alert {
  margin-top: 20px;
}
</style>
