<template>
  <el-dialog
    :model-value="visible"
    title="신청서 필수 정보 입력"
    width="500px"
    @update:modelValue="$emit('update:visible', false)"
    @closed="resetForm"
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="신청 유형">
        <el-select v-model="form.requestType" placeholder="신청 유형을 선택하세요" style="width: 100%;">
          <el-option label="휴가 신청" value="vacation_request" />
          <el-option label="출장 신청" value="business_trip" />
          <!-- 다른 신청 유형도 필요하면 추가 -->
        </el-select>
      </el-form-item>

      <el-row v-if="form.requestType === 'vacation_request'">
        <el-col :span="24">
          <el-form-item label="휴가 종류">
            <el-select v-model="form.vacationType" placeholder="휴가 종류를 선택하세요" style="width: 100%;">
              <el-option label="연차" value="annual" />
              <el-option label="반차" value="half_day" />
              <el-option label="병가" value="sick" />
              <el-option label="경조사" value="family" />
              <el-option label="기타" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="시작일">
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="시작일 선택"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="종료일">
        <el-date-picker
          v-model="form.endDate"
          type="date"
          placeholder="종료일 선택"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%;"
        />
      </el-form-item>
      <el-form-item label="사유">
        <el-input 
          v-model="form.reason" 
          type="textarea" 
          :rows="4"
          placeholder="신청 사유를 입력해주세요."
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">취소</el-button>
      <el-button type="primary" @click="submitForm">신청</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

defineProps({
  visible: Boolean,
});

const emit = defineEmits(['update:visible', 'submit']);

const form = ref({
  requestType: '',
  vacationType: '',
  startDate: '',
  endDate: '',
  reason: '',
});

watch(() => form.value.requestType, (newType) => {
  if (newType !== 'vacation_request') {
    form.value.vacationType = ''; // Reset vacationType if not a vacation request
  }
});

const submitForm = () => {
  if (!form.value.requestType || !form.value.startDate || !form.value.endDate || !form.value.reason) {
    alert('모든 필수 정보를 입력해주세요.'); // Element Plus notification would be better
    return;
  }
  if (form.value.requestType === 'vacation_request' && !form.value.vacationType) {
    alert('휴가 종류를 선택해주세요.');
    return;
  }
  emit('submit', { ...form.value });
  emit('update:visible', false);
};

const resetForm = () => {
  form.value = {
    requestType: '',
    vacationType: '',
    startDate: '',
    endDate: '',
    reason: '',
  };
};

// Explicitly return to satisfy ESLint no-unused-vars for submitForm and resetForm
// In <script setup>, this is often implicit, but explicit return can help with linting.
// However, since they are used in the template, ESLint should ideally recognize them.
// If warnings persist, it might be an ESLint config issue or a false positive.
// For now, let's ensure they are exposed.

</script>
