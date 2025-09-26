<template>
  <div class="leave-policy-editor">
    <div class="content-card">
      <div class="card-header">
        <h3>새 연차 정책</h3>
        <div>
          <el-button @click="goBack">취소</el-button>
          <el-button type="primary" @click="savePolicy">저장</el-button>
        </div>
      </div>

      <div class="form-container">
        <!-- 기본 정보 -->
        <div class="form-section">
          <h4>기본 정보</h4>
          <el-form :model="policy" label-position="top">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="정책 유형">
                  <el-select v-model="policy.type" placeholder="정책 유형 선택" style="width: 100%;">
                    <el-option label="연차" value="leave"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="정책명">
                  <el-input v-model="policy.name" placeholder="예: 정규직 연차 정책"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="설명">
              <el-input type="textarea" :rows="3" v-model="policy.description" placeholder="예: 근로기준법에 의거한 정규직 연차 정책입니다."></el-input>
            </el-form-item>
          </el-form>
        </div>

        <!-- 연차 부여 규칙 -->
        <div class="form-section">
          <div class="section-header">
            <h4>연차 부여 규칙</h4>
            <el-button type="success" plain @click="addGrantRule">
              <el-icon><Plus /></el-icon>
              <span style="margin-left: 8px;">규칙 추가</span>
            </el-button>
          </div>
          <el-table :data="policy.grantRules" style="width: 100%">
            <el-table-column label="근속년수">
              <template #default="scope">
                <el-input-number v-model="scope.row.yearsOfService" :min="0" controls-position="right" style="width: 100px;"></el-input-number> 년
              </template>
            </el-table-column>
            <el-table-column label="부여일수">
              <template #default="scope">
                <el-input-number v-model="scope.row.daysGranted" :min="0" controls-position="right" style="width: 100px;"></el-input-number> 일
              </template>
            </el-table-column>
            <el-table-column label="부여방식">
              <template #default="scope">
                <el-select v-model="scope.row.grantType" placeholder="부여방식">
                  <el-option label="월별" value="monthly"></el-option>
                  <el-option label="연별" value="yearly"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="작업">
              <template #default="scope">
                <el-button type="danger" icon="Delete" circle @click="removeGrantRule(scope.$index)"></el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 사용 규칙 -->
        <div class="form-section">
          <h4>사용 규칙</h4>
          <el-form :model="policy" label-position="top">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="최소 사용 단위">
                  <el-select v-model="policy.usageRules.minUnit" placeholder="최소 사용 단위" style="width: 100%;">
                    <el-option label="하루 (1일)" value="day"></el-option>
                    <el-option label="오전반차 (0.5일)" value="half-day-am"></el-option>
                    <el-option label="오후반차 (0.5일)" value="half-day-pm"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="최소 신청 기한 (일 전)">
                  <el-input-number v-model="policy.usageRules.minRequestDays" :min="0" controls-position="right" style="width: 100%;"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 이월 규칙 -->
        <div class="form-section">
          <h4>이월 규칙</h4>
          <el-form :model="policy" label-position="top">
            <el-checkbox v-model="policy.carryOverRules.enabled">미사용 연차 이월 허용</el-checkbox>
            <el-form-item v-if="policy.carryOverRules.enabled" label="최대 이월 가능일수" style="margin-top: 16px; max-width: 300px;">
              <el-input-number v-model="policy.carryOverRules.maxDays" :min="0" controls-position="right"></el-input-number>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 결재선 설정 -->
        <div class="form-section">
          <h4>결재선 설정</h4>
          <el-form :model="policy" label-position="top">
            <el-form-item label="결재선 선택">
              <el-select v-model="policy.approvalLine" placeholder="결재선 선택" style="width: 50%;">
                <el-option label="기본 결재선 (팀장 → 부서장)" value="default"></el-option>
                <el-option label="팀장 확인" value="team-leader"></el-option>
                <el-option label="자동 승인" value="auto"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 정책 할당 -->
        <div class="form-section">
          <h4>정책 할당</h4>
          <el-form :model="policy.assignment" label-position="top">
            <el-form-item label="할당 유형">
              <el-radio-group v-model="policy.assignment.type">
                <el-radio label="company">전사</el-radio>
                <el-radio label="department">부서</el-radio>
                <el-radio label="employee">개인</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="policy.assignment.type === 'department'" label="부서 선택">
              <el-select v-model="policy.assignment.targets" multiple placeholder="정책을 할당할 부서를 선택하세요" style="width: 100%;">
                <el-option label="개발팀" value="dev"></el-option>
                <el-option label="디자인팀" value="design"></el-option>
                <el-option label="마케팅팀" value="marketing"></el-option>
                <el-option label="영업팀" value="sales"></el-option>
              </el-select>
            </el-form-item>
            <div v-if="policy.assignment.type === 'employee'">
              <el-form-item label="직원 선택">
                 <el-table
                  ref="employeeTable"
                  :data="employeeList"
                  style="width: 100%"
                  @selection-change="handleEmployeeSelectionChange"
                  row-key="id"
                >
                  <el-table-column type="selection" width="55" :reserve-selection="true"></el-table-column>
                  <el-table-column property="department" label="부서" width="180"></el-table-column>
                  <el-table-column property="name" label="이름"></el-table-column>
                </el-table>
              </el-form-item>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'LeavePolicyEditor',
  setup() {
    const router = useRouter();
    const { success } = useSnackbar();

    const policy = ref({
      type: 'leave',
      name: '정규직 연차 정책',
      description: '근로기준법에 의거한 정규직 연차 정책입니다.',
      grantRules: [
        { yearsOfService: 0, daysGranted: 1, grantType: 'monthly' },
        { yearsOfService: 1, daysGranted: 15, grantType: 'yearly' },
      ],
      usageRules: {
        minUnit: 'half-day-am',
        minRequestDays: 3,
      },
      carryOverRules: {
        enabled: true,
        maxDays: 5,
      },
      approvalLine: 'default',
      assignment: {
        type: 'company', // company, department, or employee
        targets: [], // array of department or employee IDs
      },
    });

    const employeeList = ref([
      { id: '1', name: '김철수', department: '개발팀' },
      { id: '2', name: '이영희', department: '디자인팀' },
      { id: '3', name: '박민준', department: '개발팀' },
      { id: '4', name: '최지우', department: '마케팅팀' },
      { id: '5', name: '정다솜', department: '개발팀' },
      { id: '6', name: '홍길동', department: '영업팀' },
    ]);

    const employeeTable = ref(null); // Ref for the table component

    const addGrantRule = () => {
      policy.value.grantRules.push({ yearsOfService: 0, daysGranted: 0, grantType: 'yearly' });
    };

    const removeGrantRule = (index) => {
      policy.value.grantRules.splice(index, 1);
    };

    const handleEmployeeSelectionChange = (selection) => {
      policy.value.assignment.targets = selection.map(emp => emp.id);
    };

    watch(() => policy.value.assignment.type, (newType) => {
      policy.value.assignment.targets = [];
      if (newType === 'employee') {
        // Clear selection when switching to employee tab
        // and restore selection if there are any targets
        setTimeout(() => {
          if (employeeTable.value) {
            employeeTable.value.clearSelection();
          }
        }, 0);
      }
    });

    const goBack = () => {
      router.push('/policy');
    };

    const savePolicy = () => {
      // In a real app, you'd send this to a server
      console.log('Saving policy:', policy.value);
      success('연차 정책이 성공적으로 저장되었습니다.');
      router.push('/policy');
    };

    return {
      policy,
      employeeList,
      employeeTable,
      addGrantRule,
      removeGrantRule,
      handleEmployeeSelectionChange,
      goBack,
      savePolicy,
    };
  },
};
</script>

<style scoped>
.leave-policy-editor {
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

.form-section {
  margin-bottom: 32px;
}

.form-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-header h4 {
    margin: 0;
}
</style>
