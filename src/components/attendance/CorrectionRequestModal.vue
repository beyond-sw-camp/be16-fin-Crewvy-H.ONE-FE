<template>
  <el-dialog
    :model-value="visible"
    title="근태 기록 수정 요청"
    width="500px"
    @update:modelValue="$emit('update:visible', false)"
    @closed="onModalClose"
  >
    <div v-if="record">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="요청일자">{{ record.date }}</el-descriptions-item>
        <el-descriptions-item label="기존 출근시간">{{ record.checkIn || '-' }}</el-descriptions-item>
        <el-descriptions-item label="기존 퇴근시간">{{ record.checkOut || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-form :model="form" label-position="top" class="correction-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="변경할 출근시간">
              <el-time-picker
                v-model="form.newCheckIn"
                placeholder="시간 선택"
                format="HH:mm"
                value-format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="변경할 퇴근시간">
              <el-time-picker
                v-model="form.newCheckOut"
                placeholder="시간 선택"
                format="HH:mm"
                value-format="HH:mm"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="수정 사유">
          <el-input 
            v-model="form.reason" 
            type="textarea" 
            :rows="4"
            placeholder="수정 요청 사유를 구체적으로 입력해주세요."
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">취소</el-button>
      <el-button type="primary" @click="submitRequest">수정 요청</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  visible: Boolean,
  record: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'submit']);

const form = ref({
  newCheckIn: '',
  newCheckOut: '',
  reason: ''
});

watch(() => props.record, (newRecord) => {
  if (newRecord) {
    form.value.newCheckIn = newRecord.checkIn || '';
    form.value.newCheckOut = newRecord.checkOut || '';
    form.value.reason = '';
  }
});

const submitRequest = () => {
  emit('submit', {
    recordId: props.record.id,
    ...form.value
  });
  emit('update:visible', false);
};

const onModalClose = () => {
  // Reset form when modal is closed
  form.value = {
    newCheckIn: '',
    newCheckOut: '',
    reason: ''
  };
}

</script>

<style scoped>
.correction-form {
  margin-top: 20px;
}
</style>
