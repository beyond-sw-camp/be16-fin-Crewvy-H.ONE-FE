<template>
  <div class="leave-request">
    <div class="content-card">
      <div class="card-header">
        <h3>휴가/출장 신청</h3>
      </div>
      <div class="request-form-section">
        <el-form :model="requestForm" label-width="120px" label-position="left">
          <el-form-item label="신청 유형">
            <el-select v-model="requestForm.type" placeholder="신청 유형 선택" style="width: 100%;">
              <el-option label="휴가 신청" value="vacation_request"></el-option>
              <el-option label="출장 신청" value="business_trip"></el-option>
              <el-option label="연장근무 신청" value="overtime_request"></el-option>
              <el-option label="지출결의서" value="expense_report"></el-option>
              <el-option label="자원 예약 신청" value="resource_booking"></el-option>
              <el-option label="기타 신청" value="other"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="기간">
            <el-date-picker
              v-model="requestForm.duration"
              type="daterange"
              range-separator="-"
              start-placeholder="시작일"
              end-placeholder="종료일"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="사유">
            <el-input
              v-model="requestForm.reason"
              type="textarea"
              :rows="4"
              placeholder="상세 사유를 입력하세요"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="proceedToDetailForm">다음 단계</el-button>
            <el-button @click="cancelRequest">취소</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useSnackbar } from '@/composables/useSnackbar';
import { useRouter } from 'vue-router';

export default {
  name: 'LeaveRequest',
  setup() {
    const { warning } = useSnackbar();
    const router = useRouter();

    const requestForm = ref({
      type: '',
      duration: [], // [startDate, endDate]
      reason: '',
    });

    const proceedToDetailForm = () => {
      if (!requestForm.value.type || !requestForm.value.duration[0] || !requestForm.value.duration[1] || !requestForm.value.reason) {
        warning('모든 필수 정보를 입력해주세요.');
        return;
      }

      let routeName = '';
      let queryParams = {
        startDate: requestForm.value.duration[0],
        endDate: requestForm.value.duration[1],
        reason: requestForm.value.reason
      };

      switch (requestForm.value.type) {
        case 'vacation_request':
          routeName = 'VacationRequestForm';
          // If specific vacationType is needed, it would be selected here or in the next form
          break;
        case 'business_trip':
          routeName = 'BusinessTripRequestForm';
          break;
        case 'overtime_request':
          routeName = 'OvertimeRequest';
          break;
        case 'expense_report':
          routeName = 'ExpenseReport';
          break;
        case 'resource_booking':
          routeName = 'ResourceBookingForm';
          break;
        case 'other':
          routeName = 'OtherApprovalForm';
          break;
        default:
          warning('알 수 없는 신청 유형입니다.');
          return;
      }

      router.push({
        name: routeName,
        query: queryParams
      });
    };

    const cancelRequest = () => {
      console.log('신청 취소');
      warning('신청이 취소되었습니다.');
      router.back(); // 이전 페이지로 돌아가기
    };

    return {
      requestForm,
      proceedToDetailForm,
      cancelRequest,
    };
  },
};
</script>

<style scoped>
.leave-request {
  max-width: 800px;
  margin: 0 auto;
}

.content-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.request-form-section {
  padding: 24px;
}

.form-help-text {
    font-size: 12px;
    color: #909399;
}
</style>