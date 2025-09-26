<template>
  <el-dialog
    :model-value="visible"
    title="신청 내역 상세"
    width="700px"
    @update:modelValue="$emit('update:visible', $event)"
  >
    <div v-if="request" class="detail-modal-content">
      <el-descriptions :title="request.title" :column="2" border>
        <el-descriptions-item label="신청일">{{ request.date }}</el-descriptions-item>
        <el-descriptions-item label="결재 상태">
          <el-tag :type="getStatusType(request.status)">{{ request.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="상세 내용" :span="2">{{ request.description }}</el-descriptions-item>
      </el-descriptions>

      <el-divider>결재 진행 현황</el-divider>
      <el-timeline>
        <el-timeline-item v-for="(step, index) in request.steps" :key="index" :timestamp="step.statusText">
          {{ step.name }}
        </el-timeline-item>
      </el-timeline>
    </div>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">닫기</el-button>
      <el-button
        v-if="request && request.status === '진행중'"
        type="warning"
        @click="$emit('cancel', request)"
      >신청 취소</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'RequestDetailModal',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    request: {
      type: Object,
      default: null,
    },
  },
  emits: ['update:visible', 'cancel'],
  methods: {
    getStatusType(status) {
      const statusMap = {
        '승인': 'success',
        '반려': 'danger',
        '진행중': 'warning',
      };
      return statusMap[status] || 'info';
    },
  },
};
</script>

<style scoped>
.detail-modal-content .el-descriptions {
  margin-bottom: 20px;
}
</style>
