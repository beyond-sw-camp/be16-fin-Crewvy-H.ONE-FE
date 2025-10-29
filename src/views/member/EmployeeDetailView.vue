<template>
  <div class="employee-detail-view">
    <div class="page-header">
      <div class="header-content">
        <h1>직원 상세 정보</h1>
        <p>직원의 상세 정보를 확인하고 관리합니다.</p>
      </div>
      <div class="header-actions">
        <el-button @click="goBack">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span style="margin-left: 8px;">목록으로</span>
        </el-button>
        <el-button type="info" @click="printToPdf">
          <el-icon>
            <Printer />
          </el-icon>
          <span style="margin-left: 8px;">PDF 출력</span>
        </el-button>
        <el-button v-if="canUpdate" type="primary" @click="editEmployee">
          <el-icon>
            <Edit />
          </el-icon>
          <span style="margin-left: 8px;">수정</span>
        </el-button>
      </div>
    </div>

    <el-card v-if="employee" class="detail-card" ref="overallContent">
      <div class="detail-overview">
        <el-avatar :src="employee.avatar || defaultAvatarSvg" :size="80" />
        <div class="overview-info">
          <div class="name-and-status">
            <h2>{{ employee.name }}</h2>
            <el-tag
              :type="employee.memberStatusName === '재직' ? 'success' : (employee.memberStatusName === '휴직' ? 'warning' : 'primary')"
              size="small">
              {{ employee.memberStatusName }}
            </el-tag>
          </div>
          <p class="position-department">{{ employee.memberPositionResList[0]?.title?.name || '-' }} • {{
            employee.memberPositionResList[0]?.organization?.name || '-' }}</p>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="전체" name="overall">
          <div class="overall-content">
            <div class="info-section">
              <h3>기본 정보</h3>
              <div class="info-grid-page">
                <div class="info-item-page">
                  <span class="label">사번</span>
                  <span class="value">{{ employee.sabun }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">이메일</span>
                  <span class="value">{{ employee.email }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">연락처</span>
                  <span class="value">{{ employee.phoneNumber }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">비상연락처</span>
                  <span class="value">{{ employee.emergencyContact || '-' }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">내선 전화</span>
                  <span class="value">{{ employee.extensionNumber || '-' }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">일반 전화</span>
                  <span class="value">{{ employee.telNumber || '-' }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">은행명</span>
                  <span class="value">{{ employee.bank || '-' }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">계좌번호</span>
                  <span class="value">{{ employee.bankAccount || '-' }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">입사일</span>
                  <span class="value">{{ employee.joinDate }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">근속기간</span>
                  <span class="value">{{ employee.lengthOfService }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">주소</span>
                  <span class="value">{{ employee.address || '-' }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">고용형태</span>
                  <span class="value">{{ employee.employmentTypeName }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">재직 상태</span>
                  <span class="value">{{ employee.memberStatusName }}</span>
                </div>
                <div class="info-item-page">
                  <span class="label">계정 상태</span>
                  <span class="value">{{ formatAccountStatus(employee.accountStatus) }}</span>
                </div>
              </div>
            </div>

            <div class="info-section hr-info-section">
              <h3>인사 정보</h3>
              <el-table v-if="employee.gradeHistoryList && employee.gradeHistoryList.length > 0"
                :data="employee.gradeHistoryList" style="width: 100%">
                <el-table-column prop="gradeName" label="직급명"></el-table-column>
                <el-table-column prop="promotionDate" label="진급일"></el-table-column>
              </el-table>
              <p v-else class="no-data">진급 이력이 없습니다.</p>
            </div>

            <div class="info-section">
              <h3>직무 정보</h3>
              <div v-if="employee.memberPositionResList && employee.memberPositionResList.length > 0">
                <div v-for="(position, index) in employee.memberPositionResList" :key="index"
                  class="position-detail-item-page">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="info-item-page">
                        <span class="label">부서</span>
                        <span class="value">{{ position.organization?.name || '-' }}</span>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="info-item-page">
                        <span class="label">직책</span>
                        <span class="value">{{ position.title?.name || '-' }}</span>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="info-item-page">
                        <span class="label">역할</span>
                        <span class="value">{{ position.role?.name || '-' }}</span>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="info-item-page">
                        <span class="label">근무기간</span>
                        <span class="value">{{ position.lengthOfService || '-' }}</span>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="info-item-page">
                        <span class="label">시작일</span>
                        <span class="value">{{ formatDate(position.startDate) }}</span>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="info-item-page">
                        <span class="label">종료일</span>
                        <span class="value">{{ formatDate(position.endDate) || '-' }}</span>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
              <p v-else class="no-data">직무 정보가 없습니다.</p>
            </div>
          </div>

        </el-tab-pane>

        <el-tab-pane label="기본 정보" name="basic">
          <div class="info-section">
            <div class="info-grid-page">
              <div class="info-item-page">
                <span class="label">사번</span>
                <span class="value">{{ employee.sabun }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">이메일</span>
                <span class="value">{{ employee.email }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">연락처</span>
                <span class="value">{{ employee.phoneNumber }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">비상연락처</span>
                <span class="value">{{ employee.emergencyContact || '-' }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">내선 전화</span>
                <span class="value">{{ employee.extensionNumber || '-' }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">일반 전화</span>
                <span class="value">{{ employee.telNumber || '-' }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">은행명</span>
                <span class="value">{{ employee.bank || '-' }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">계좌번호</span>
                <span class="value">{{ employee.bankAccount || '-' }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">입사일</span>
                <span class="value">{{ employee.joinDate }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">근속기간</span>
                <span class="value">{{ employee.lengthOfService }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">주소</span>
                <span class="value">{{ employee.address || '-' }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">고용형태</span>
                <span class="value">{{ employee.employmentTypeName }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">재직 상태</span>
                <span class="value">{{ employee.memberStatusName }}</span>
              </div>
              <div class="info-item-page">
                <span class="label">계정 상태</span>
                <span class="value">{{ formatAccountStatus(employee.accountStatus) }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="인사 정보" name="hr">
          <div class="info-section">
            <el-table v-if="employee.gradeHistoryList && employee.gradeHistoryList.length > 0"
              :data="employee.gradeHistoryList" style="width: 100%">
              <el-table-column prop="gradeName" label="직급명"></el-table-column>
              <el-table-column prop="promotionDate" label="진급일"></el-table-column>
            </el-table>
            <p v-else class="no-data">진급 이력이 없습니다.</p>
          </div>
        </el-tab-pane>

        <el-tab-pane label="직무 정보" name="job">
          <div class="info-section">
            <div v-if="employee.memberPositionResList && employee.memberPositionResList.length > 0">
              <div v-for="(position, index) in employee.memberPositionResList" :key="index"
                class="position-detail-item-page">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="info-item-page">
                      <span class="label">부서</span>
                      <span class="value">{{ position.organization?.name || '-' }}</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="info-item-page">
                      <span class="label">직책</span>
                      <span class="value">{{ position.title?.name || '-' }}</span>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="info-item-page">
                      <span class="label">역할</span>
                      <span class="value">{{ position.role?.name || '-' }}</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="info-item-page">
                      <span class="label">근무기간</span>
                      <span class="value">{{ position.lengthOfService || '-' }}</span>
                    </div>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="info-item-page">
                      <span class="label">시작일</span>
                      <span class="value">{{ formatDate(position.startDate) }}</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="info-item-page">
                      <span class="label">종료일</span>
                      <span class="value">{{ formatDate(position.endDate) || '-' }}</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
            <p v-else class="no-data">직무 정보가 없습니다.</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-empty v-else description="직원 정보를 불러오지 못했습니다."></el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineExpose, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSnackbar } from '@/composables/useSnackbar';
import { usePermissions } from '@/composables/usePermissions';
import { defaultAvatarSvg } from '@/utils/defaultAvatar.js';
import employeeService from '@/api/employeeService';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Edit, Printer } from '@element-plus/icons-vue';

const route = useRoute();
// eslint-disable-next-line no-unused-vars
const router = useRouter();
const { error } = useSnackbar();
const { checkPermission } = usePermissions();

const employee = ref(null);
const activeTab = ref('overall'); // Set default tab to overall
const canUpdate = ref(false);
const overallContent = ref(null); // Ref for the overall content to print

const employeeId = computed(() => route.params.id);

const fetchEmployeeDetails = async (id) => {
  if (id === undefined || id === null || id === '') {
    error('직원 ID가 유효하지 않아 상세 정보를 불러올 수 없습니다.'); // Display error to user
    return; // Guard against invalid id
  }
  try {
    const response = await employeeService.getEmployeeDetails(id);
    if (response.data && response.data.success) {
      employee.value = response.data.data;
    }
  } catch (err) {
    console.error('직원 상세 정보를 불러오는 데 실패했습니다:', err);
    if (err.response && err.response.status === 403) {
      error('해당 직원의 정보에 접근할 권한이 없습니다.');
      router.back();
    } else {
      error(err.response?.data?.message || '서버 오류가 발생했습니다.');
    }
  }
};

onMounted(async () => {
  if (employeeId.value) {
    await fetchEmployeeDetails(employeeId.value);
  }
  canUpdate.value = await checkPermission('member', 'UPDATE');
});

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await fetchEmployeeDetails(newId);
    }
  }
);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR'); // Adjust locale as needed
};

const formatAccountStatus = (status) => {
  switch (status) {
    case 'ACTIVE': return '정상';
    case 'INACTIVE': return '비활성';
    case 'LOCK': return '잠금';
    default: return status;
  }
};

const printToPdf = async () => {
  if (!employee.value) {
    error('직원 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  activeTab.value = 'overall';
  await nextTick(); // Wait for DOM to update after tab change

  // Add a slightly longer delay to ensure all content is fully rendered
  await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay

  if (overallContent.value && overallContent.value.$el) { // Ensure $el exists
    const element = overallContent.value.$el;
    const tabsHeader = element.querySelector('.detail-tabs .el-tabs__header'); // Get tabs header

    if (tabsHeader) {
      tabsHeader.style.display = 'none'; // Temporarily hide tabs header
    }

    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right in mm
      filename: `직원상세정보_${employee.value?.name || 'unknown'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true, // Important for images from external sources
        scrollY: 0, // Start capture from the top
        windowHeight: element.scrollHeight // Capture full height of the element
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    console.log('Starting PDF generation...'); // Log before html2pdf call
    try {
      await html2pdf().set(opt).from(element).save();
      console.log('PDF generation completed successfully.'); // Log after successful generation
    } catch (pdfError) {
      console.error('PDF 생성 중 오류 발생:', pdfError);
      error('PDF 생성 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
    } finally {
      // Ensure tabs header is shown again, even if PDF generation fails
      if (tabsHeader) {
        tabsHeader.style.display = ''; // Restore tabs header visibility
      }
    }
  } else {
    error('PDF로 변환할 내용을 찾을 수 없습니다. (overallContent.value.$el이 유효하지 않음)'); // More specific error
  }
}; // <--- This is the closing brace and semicolon for the `printToPdf` function

const goBack = () => {
  router.back();
};

const editEmployee = () => {
  router.push({ name: 'EmployeeEdit', params: { id: employeeId.value } });
};

defineExpose({ goBack, editEmployee, printToPdf });
</script>

<style scoped>
/* Base font for consistency */
.employee-detail-view {
  /* font-family: 'Pretendard', 'Noto Sans KR', sans-serif; */ /* Apply a consistent font */
  font-size: 14px; /* Base font size for the component */
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 30px; /* Slightly adjusted for overall consistency */
  font-weight: 700; /* Make it bolder */
  color: #2c3e50;
  margin-bottom: 10px; /* Increased margin */
}

.header-content p {
  font-size: 15px; /* Adjusted for consistency */
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
}

.detail-card {
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.detail-overview {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.overview-info {
  flex: 1;
}

.name-and-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.name-and-status h2 {
  font-size: 26px; /* Slightly adjusted for overall consistency */
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.position-department {
  font-size: 15px; /* Adjusted for consistency */
  color: #606266;
  margin: 0;
}

.detail-tabs {
  margin-top: 20px;
}

.info-section {
  padding: 20px 0;
}

/* Styling for section titles (h3) */
.info-section h3 {
  font-size: 20px; /* Larger font size for section titles */
  font-weight: 700; /* Bolder to stand out */
  color: #34495e; /* Slightly darker color for emphasis */
  margin-bottom: 18px; /* Increased space below the title */
  padding-bottom: 8px; /* Padding for visual separation */
  border-bottom: 2px solid #e0e0e0; /* A subtle line to distinguish */
  display: block; /* Ensure border-bottom spans full width */
}

/* Font consistency for Element Plus Table within info-section */
.info-section :deep(.el-table__header-cell .cell) {
  /* font-family: 'Pretendard', 'Noto Sans KR', sans-serif !important; */
  font-size: 14px !important; /* Match .label font size */
  color: #2c3e50 !important; /* Ensure consistent text color */
  font-weight: 500 !important; /* Match .label font weight */
}

.info-section :deep(.el-table__cell .cell) {
  /* font-family: 'Pretendard', 'Noto Sans KR', sans-serif !important; */
  font-size: 16px !important; /* Match .value font size */
  color: #2c3e50 !important; /* Ensure consistent text color */
  font-weight: 600 !important; /* Match .value font weight */
}

/* Also ensure the table header itself uses the correct font */
.info-section :deep(.el-table__header) {
  /* font-family: 'Pretendard', 'Noto Sans KR', sans-serif !important; */
}

.info-grid-page {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 10px; /* Add some space above the grid */
}

.info-item-page {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item-page:last-child {
  border-bottom: none;
}

.info-item-page .label {
  font-weight: 500;
  color: #606266;
  font-size: 14px; /* Adjusted for consistency */
  margin-bottom: 6px; /* Increased margin */
}

.info-item-page .value {
  color: #2c3e50;
  font-size: 16px; /* Adjusted for consistency */
  font-weight: 600;
}

.position-detail-item-page {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fdfdfd;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.hr-info-section {
  page-break-before: always;
}
</style>