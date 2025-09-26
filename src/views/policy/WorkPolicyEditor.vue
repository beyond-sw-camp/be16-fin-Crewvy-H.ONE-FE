<template>
  <div class="work-policy-editor">
    <div class="content-card">
      <div class="card-header">
        <h3>근무 정책 수정</h3>
        <div>
          <el-button @click="goBack">취소</el-button>
          <el-button type="primary" @click="savePolicy">저장</el-button>
        </div>
      </div>

      <div class="form-container">
        <el-form :model="policy" label-position="top">
          <el-form-item label="정책명">
            <el-input v-model="policy.name"></el-input>
          </el-form-item>

          <!-- 근무 유형 블록 -->
          <div class="policy-block">
            <div class="block-header">
              <h4>근무 유형</h4>
              <el-tag type="success">필수</el-tag>
            </div>
            <div class="block-content">
              <el-form-item label="근무 유형 선택">
                <el-radio-group v-model="policy.blocks.work_type.value">
                  <el-radio label="FIXED">일반 근무</el-radio>
                  <el-radio label="FLEX">시차 출퇴근</el-radio>
                  <el-radio label="SHIFT">교대 근무</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>
          </div>

          <!-- 근무 시간 블록 -->
          <div class="policy-block">
            <div class="block-header">
              <h4>근무 시간</h4>
               <el-tag type="success">필수</el-tag>
            </div>
            <div class="block-content">
                <el-form-item label="출/퇴근 시간">
                    <el-time-picker
                        v-model="policy.blocks.daily_hours.start_time"
                        placeholder="출근 시간"
                        format="HH:mm"
                    />
                    <span style="margin: 0 10px;">~</span>
                    <el-time-picker
                        v-model="policy.blocks.daily_hours.end_time"
                        placeholder="퇴근 시간"
                        format="HH:mm"
                    />
                </el-form-item>
                 <el-form-item label="휴게 시간 (분)">
                    <el-input-number v-model="policy.blocks.break_minutes.value" :min="0" controls-position="right"></el-input-number>
                </el-form-item>
            </div>
          </div>

          <!-- 코어 타임 블록 -->
          <div class="policy-block">
            <div class="block-header">
              <h4>코어 타임</h4>
              <el-switch v-model="policy.blocks.core_time.enabled"></el-switch>
            </div>
            <div v-if="policy.blocks.core_time.enabled" class="block-content">
                <el-form-item label="코어 타임 시간">
                    <el-time-picker
                        v-model="policy.blocks.core_time.start"
                        placeholder="시작 시간"
                        format="HH:mm"
                    />
                    <span style="margin: 0 10px;">~</span>
                    <el-time-picker
                        v-model="policy.blocks.core_time.end"
                        placeholder="종료 시간"
                        format="HH:mm"
                    />
                </el-form-item>
            </div>
          </div>

        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'WorkPolicyEditor',
  setup() {
    const router = useRouter();
    const { success } = useSnackbar();

    const policy = ref({
      type: 'WORK_SCHEDULE',
      name: '기본 근무 정책',
      schema_version: '1.0.0',
      blocks: {
        work_type: { value: 'FIXED' },
        daily_hours: { start_time: new Date(2024, 1, 1, 9, 0), end_time: new Date(2024, 1, 1, 18, 0) },
        break_minutes: { value: 60 },
        core_time: {
          enabled: true,
          start: new Date(2024, 1, 1, 10, 0),
          end: new Date(2024, 1, 1, 16, 0),
        },
      },
    });

    const goBack = () => {
      router.push('/admin/policy-management');
    };

    const savePolicy = () => {
      console.log('Saving work policy:', JSON.stringify(policy.value, null, 2));
      success('근무 정책이 성공적으로 저장되었습니다.');
      router.push('/admin/policy-management');
    };

    return {
      policy,
      goBack,
      savePolicy,
    };
  },
};
</script>

<style scoped>
.work-policy-editor {
  max-width: 1000px;
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

.form-container {
  padding: 24px;
}

.policy-block {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.block-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.block-content {
  padding: 16px;
}
</style>
