<template>
  <div class="btrip-policy-editor">
    <div class="content-card">
      <div class="card-header">
        <h3>출장 정책 수정</h3>
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

          <!-- 결재선 블록 -->
          <div class="policy-block">
            <div class="block-header">
              <h4>결재선 지정</h4>
              <el-tag type="success">필수</el-tag>
            </div>
            <div class="block-content">
              <el-form-item label="결재선 선택">
                <el-select v-model="policy.blocks.workflow.value" placeholder="결재선 선택" style="width: 50%;">
                  <el-option label="기본 결재선 (팀장 → 부서장)" value="DEFAULT_APPROVAL"></el-option>
                  <el-option label="팀장 확인" value="TEAM_LEADER_APPROVAL"></el-option>
                  <el-option label="자동 승인" value="AUTO_APPROVAL"></el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>

          <!-- 교통비 블록 -->
          <div class="policy-block">
            <div class="block-header">
              <h4>교통비</h4>
              <el-switch v-model="policy.blocks.transportation.enabled"></el-switch>
            </div>
            <div v-if="policy.blocks.transportation.enabled" class="block-content">
              <el-checkbox v-model="policy.blocks.transportation.personal_car.enabled">개인 차량 사용 시 유류비 지원</el-checkbox>
              <div v-if="policy.blocks.transportation.personal_car.enabled" class="rule-sub-details">
                <el-form-item label="지원 단가 (km당)">
                  <el-input-number v-model="policy.blocks.transportation.personal_car.rate_per_km" :min="0" controls-position="right"></el-input-number> 원
                </el-form-item>
              </div>
               <el-checkbox v-model="policy.blocks.transportation.corp_car.enabled">법인차 배정</el-checkbox>
            </div>
          </div>

          <!-- 식대 블록 -->
          <div class="policy-block">
            <div class="block-header">
              <h4>식대</h4>
              <el-switch v-model="policy.blocks.meals.enabled"></el-switch>
            </div>
            <div v-if="policy.blocks.meals.enabled" class="block-content">
              <el-form-item label="1일당 지원 금액">
                <el-input-number v-model="policy.blocks.meals.daily_allowance" :min="0" controls-position="right"></el-input-number> 원
              </el-form-item>
            </div>
          </div>

          <!-- 숙박비 블록 -->
          <div class="policy-block">
            <div class="block-header">
              <h4>숙박비</h4>
              <el-switch v-model="policy.blocks.accommodation.enabled"></el-switch>
            </div>
            <div v-if="policy.blocks.accommodation.enabled" class="block-content">
              <p>숙박비 관련 설정을 여기에 추가합니다.</p>
            </div>
          </div>

          <!-- 허용 출장지 블록 -->
          <div class="policy-block">
            <div class="block-header">
              <h4>허용 출장지</h4>
              <el-switch v-model="policy.blocks.allowedLocations.enabled"></el-switch>
            </div>
            <div v-if="policy.blocks.allowedLocations.enabled" class="block-content">
              <el-form-item label="출장 가능 지역">
                <el-select v-model="policy.blocks.allowedLocations.locations" multiple placeholder="출장지를 선택하세요" style="width: 100%;">
                  <el-option v-for="location in workLocations" :key="location.workLocationId" :label="location.name" :value="location.name"></el-option>
                </el-select>
              </el-form-item>
              <p class="help-text">특정 출장지만 허용하려면 선택하세요. 선택하지 않으면 모든 출장지가 허용됩니다.</p>
            </div>
          </div>

        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSnackbar } from '@/composables/useSnackbar';
import { getActiveWorkLocations } from '@/api/attendance';

export default {
  name: 'BusinessTripPolicyEditor',
  setup() {
    const router = useRouter();
    const { success, error } = useSnackbar();
    const workLocations = ref([]);

    // This data structure now mirrors the JSON format from the scenario
    const policy = ref({
      type: 'BUSINESS_TRIP',
      name: '출장 정책',
      schema_version: '1.0.0',
      blocks: {
        workflow: { value: 'DEFAULT_APPROVAL' },
        transportation: {
          enabled: true,
          personal_car: { enabled: true, rate_per_km: 300 },
          corp_car: { enabled: false },
        },
        meals: {
          enabled: true,
          daily_allowance: 20000,
        },
        accommodation: {
          enabled: false,
        },
        allowedLocations: {
          enabled: false,
          locations: [],
        },
      },
    });

    const fetchWorkLocations = async () => {
      try {
        workLocations.value = await getActiveWorkLocations();
      } catch (err) {
        error(err.message || '근무지 목록을 불러오는 데 실패했습니다.');
      }
    };

    onMounted(() => {
      fetchWorkLocations();
    });

    const goBack = () => {
      router.push('/admin/policy-management');
    };

    const savePolicy = () => {
      console.log('Saving business trip policy:', JSON.stringify(policy.value, null, 2));
      success('출장 정책이 성공적으로 저장되었습니다.');
      router.push('/admin/policy-management');
    };

    return {
      policy,
      workLocations,
      goBack,
      savePolicy,
    };
  },
};
</script>

<style scoped>
.btrip-policy-editor {
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

.rule-sub-details {
    padding-left: 24px;
    margin-top: 8px;
    max-width: 400px;
}

.help-text {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
}
</style>