<template>
  <div class="policy-editor">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>새 근태 정책 생성</h2>
          <div>
            <el-button @click="$router.back()">취소</el-button>
            <el-button type="primary" @click="savePolicy">저장</el-button>
          </div>
        </div>
      </template>

      <el-form :model="policy" label-width="120px" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="정책 이름">
              <el-input v-model="policy.name" placeholder="예: 2024년 하계 유연근무 정책"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="정책 유형">
              <el-select v-model="policy.policyTypeId" placeholder="정책 유형을 선택하세요" style="width: 100%;">
                <el-option label="기본근무" value="PTC101"></el-option>
                <el-option label="연차유급휴가" value="PTC001"></el-option>
                <el-option label="출장" value="PTC102"></el-option>
                <!-- 백엔드 PolicyTypeCode Enum에 따라 추가 -->
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="정책 적용 기간">
          <el-date-picker
            v-model="policy.effectiveDates"
            type="daterange"
            range-separator="-"
            start-placeholder="시작일"
            end-placeholder="종료일"
            style="width: 100%;"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="유급 여부">
           <el-switch v-model="policy.isPaid"></el-switch>
        </el-form-item>
      </el-form>

      <el-divider>규칙 블록 추가</el-divider>

      <div class="rule-block-section">
        <p class="description-text">
          정책에 적용할 규칙 블록을 추가하세요. 각 규칙은 조합하여 사용할 수 있습니다.
        </p>
        <div class="rule-block-actions">
          <el-button>+ 근무 시간 규칙</el-button>
          <el-button>+ 인증 규칙</el-button>
          <el-button>+ 외출 규칙</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'PolicyEditor',
  data() {
    return {
      policy: {
        name: '',
        policyTypeId: null,
        effectiveDates: [],
        isPaid: false,
        ruleDetails: {}
      }
    };
  },
  methods: {
    savePolicy() {
      // TODO: API 연동 로직 추가
      console.log('Saving policy:', this.policy);
      // API 호출 후 목록 페이지로 이동
      // this.$router.push({ name: 'PolicyManagement' });
    }
  }
};
</script>

<style scoped>
/* 기존 프로젝트 스타일과 유사하게 구성 */
.policy-editor {
  max-width: 1000px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
}
.rule-block-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
}
.description-text {
  color: #6b7280;
  margin-bottom: 16px;
}
.rule-block-actions {
  display: flex;
  gap: 10px;
}
</style>
