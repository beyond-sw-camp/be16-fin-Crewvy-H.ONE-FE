<template>
  <div class="payroll-item-management">
    <div class="page-header">
      <div class="header-content">
        <h1>급여 설정</h1>
        <p>급여 계산에 필요한 수당/공제 항목을 관리하고 급여 지급일을 설정합니다.</p>
      </div>
    </div>

    <!-- 급여 정책 설정 -->
    <div class="policy-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 지급일 설정</span>
          </div>
        </template>

        <el-form :model="policyForm" label-width="120px" class="policy-form">
          <div class="horizontal-sections">
            <div class="section">
              <div class="section-title">지급일</div>
              <div class="form-grid">
                <el-form-item label="지급일 유형">
                  <el-select v-model="policyForm.paymentType" placeholder="선택">
                    <el-option label="특정일" value="specific_day" />
                    <el-option label="말일" value="end_of_month" />
                  </el-select>
                </el-form-item>

                <el-form-item v-if="policyForm.paymentType === 'specific_day'" label="지급일(일)">
                  <el-input-number v-model="policyForm.paymentDay" :min="1" :max="31" />
                  <span class="hint">1~31 사이 숫자</span>
                </el-form-item>

                <el-form-item label="휴일 처리" class="no-bottom-margin">
                  <el-select v-model="policyForm.holidayPolicy" placeholder="선택">
                    <el-option label="전일 지급" value="previous_day" />
                    <el-option label="익일 지급" value="next_day" />
                  </el-select>
                  <span class="hint">지급일이 휴일일 경우 처리 방식</span>
                </el-form-item>
              </div>
            </div>

            <div class="section">
              <div class="section-title">산정 기간</div>
              <el-form-item label="구분">
                <el-radio-group v-model="policyForm.calcPeriodType">
                  <el-radio label="last_month_full">전월 1일 ~ 전월 말일</el-radio>
                  <el-radio label="this_month_full">당월 1일 ~ 당월 말일</el-radio>
                  <el-radio label="custom">기타 (사용자 지정)</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item v-if="policyForm.calcPeriodType === 'custom'">
                <div class="range-inline">
                  <div class="range-col">
                    <div class="range-label">시작</div>
                    <div class="range-controls">
                      <el-select v-model="policyForm.calcStartRelation" style="width: 110px">
                        <el-option label="전월" value="prev" />
                        <el-option label="당월" value="current" />
                      </el-select>
                      <el-input-number v-model="policyForm.calcPeriodStart" :min="1" :max="31" />
                    </div>
                  </div>
                  <div class="range-sep">~</div>
                  <div class="range-col">
                    <div class="range-label">종료</div>
                    <div class="range-controls">
                      <el-select v-model="policyForm.calcEndRelation" style="width: 110px">
                        <el-option label="전월" value="prev" />
                        <el-option label="당월" value="current" />
                      </el-select>
                      <el-input-number v-model="policyForm.calcPeriodEnd" :min="1" :max="31" />
                    </div>
                  </div>
                </div>
                <div class="range-hint">
                  <div class="hint">예: 전월 21일 ~ 당월 20일</div>
                </div>
              </el-form-item>
            </div>
          </div>
          <div class="actions">
            <el-button type="primary" :loading="saving" @click="savePolicy">저장</el-button>
            <el-button @click="resetPolicy">초기화</el-button>
          </div>
        </el-form>
      </el-card>
    </div>

    <!-- 급여 항목 테이블 -->
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 항목 관리</span>
            <span class="item-count">총 {{ payrollItems.length }}개 항목</span>
          </div>
        </template>
        
        <!-- 로딩 중일 때 표시 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading" style="font-size: 24px; color: #409EFF;">
            <Loading />
          </el-icon>
          <p style="margin-top: 12px; color: #606266; font-size: 14px;">급여 항목을 불러오는 중...</p>
        </div>
        
        <!-- 테이블이 비어있을 때 -->
        <div v-else-if="payrollItems.length === 0" class="empty-state">
          <el-empty description="등록된 급여 항목이 없습니다">
            <el-button type="primary" @click="addNewItem">첫 번째 항목 추가</el-button>
          </el-empty>
        </div>
        
        <!-- 테이블이 있을 때 -->
        <div v-else class="table-wrapper">
          <!-- 상단 탭 -->
          <div class="top-tabs">
            <div class="tabs-left">
              <div 
                class="top-tab" 
                :class="{ 'active': activeTab === 'all' }"
                @click="activeTab = 'all'"
              >
                <span class="tab-label">전체</span>
                <span class="tab-count">({{ payrollItems.length }})</span>
              </div>
              <div 
                class="top-tab" 
                :class="{ 'active': activeTab === 'payment' }"
                @click="activeTab = 'payment'"
              >
                <span class="tab-label">지급</span>
                <span class="tab-count">({{ payrollItems.filter(item => item.type === 'payment').length }})</span>
              </div>
              <div 
                class="top-tab" 
                :class="{ 'active': activeTab === 'deduction' }"
                @click="activeTab = 'deduction'"
              >
                <span class="tab-label">공제</span>
                <span class="tab-count">({{ payrollItems.filter(item => item.type === 'deduction').length }})</span>
              </div>
            </div>
            <div class="tabs-actions">
              <el-button type="info" @click="loadPayrollItems" :loading="loading">
                <el-icon><Refresh /></el-icon>
                새로고침
              </el-button>
              <el-button type="primary" @click="addNewItem">
                <el-icon><Plus /></el-icon>
                행 추가
              </el-button>
              <el-button 
                type="success" 
                @click="saveItems"
                :class="{ 'disabled-button': !hasChanges }"
              >
                <el-icon><Document /></el-icon>
                저장
              </el-button>
              <el-button 
                type="info" 
                @click="cancelChanges"
                :class="{ 'disabled-button': !hasChanges }"
              >
                <el-icon><RefreshLeft /></el-icon>
                취소
              </el-button>
            </div>
          </div>
          
          <!-- 테이블 컨테이너 (고정 높이 + 스크롤) -->
          <div ref="tableContainer" class="table-container">
            <el-table 
              ref="payrollTable"
              :data="filteredPayrollItems" 
              border 
              style="width: 100%"
              row-key="tempId"
            >
            <el-table-column type="selection" width="55" align="center" />
            
            <el-table-column label="구분" width="150" align="center">
              <template #default="scope">
                <el-select 
                  v-model="scope.row.type" 
                  placeholder="선택하세요"
                  size="small"
                  style="width: 100%"
                  :disabled="scope.row.isBasicRequired"
                  :style="{ cursor: 'default' }"
                  @change="(value) => handleTypeChange(scope.row, value)"
                >
                  <el-option label="지급" value="payment" />
                  <el-option label="공제" value="deduction" />
                </el-select>
              </template>
            </el-table-column>
            
            <el-table-column label="항목명" min-width="200">
              <template #default="scope">
                <el-input 
                  v-model="scope.row.itemName" 
                  :placeholder="'항목명을 입력하세요'"
                  size="small"
                  :readonly="scope.row.isBasicRequired"
                  :style="{ cursor: 'default' }"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="설명" min-width="250">
              <template #default="scope">
                <el-input 
                  v-model="scope.row.description" 
                  :placeholder="'항목 설명을 입력하세요'"
                  size="small"
                  :readonly="scope.row.isBasicRequired"
                  :style="{ cursor: 'default' }"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="사용여부" width="100" align="center">
              <template #default="scope">
                <el-checkbox 
                  v-model="scope.row.isActive"
                  :disabled="scope.row.isBasicRequired"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="과세 대상" width="100" align="center">
              <template #default="scope">
                <el-checkbox 
                  v-model="scope.row.isTaxable"
                  :disabled="scope.row.isBasicRequired || scope.row.type === 'deduction'"
                  :class="{ 'disabled-checkbox': scope.row.isBasicRequired || scope.row.type === 'deduction' }"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="비과세 한도" width="150" align="center">
              <template #default="scope">
                <el-input 
                  v-model="scope.row.nonTaxableLimit" 
                  placeholder="한도 입력"
                  size="small"
                  :readonly="!((scope.row.calculationCode === 'ST001' && scope.row.isTaxable === false) || scope.row.type === 'payment')"
                  :class="{ 'disabled-input': !((scope.row.calculationCode === 'ST001' && scope.row.isTaxable === false) || scope.row.type === 'payment') }"
                  type="number"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="등록일" width="120" align="center">
              <template #default="scope">
                {{ formatDate(scope.row.createdAt) }}
              </template>
            </el-table-column>
            
            <el-table-column label="작업" width="120" align="center">
              <template #default="scope">
                <el-button 
                  type="danger" 
                  size="small" 
                  :disabled="scope.row.isBasicRequired"
                  :style="{ cursor: 'default' }"
                  @click="deleteItem(scope.row)"
                >
                  <el-icon><Delete /></el-icon>
                  삭제
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          </div>
        </div>
      </el-card>
    </div>

  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import axios from 'axios'
import { Plus, Document, RefreshLeft, Delete, Loading, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'PayrollItemManagement',
  components: {
    Plus,
    Document,
    RefreshLeft,
    Delete,
    Loading,
    Refresh
  },
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      payrollItems: [],
      originalPayrollItems: [], // 원본 데이터 저장
      loading: false,
      saving: false, // 정책 저장 중 상태
      policyExists: false,
      activeTab: 'all', // 현재 선택된 탭: 'all', 'payment', 'deduction'
      // API에서 가져온 항목명 옵션
      paymentItemOptions: [],
      deductionItemOptions: [],
      // 급여 정책 폼
      policyForm: {
        paymentType: 'specific_day',
        paymentDay: 25,
        holidayPolicy: 'previous_day',
        calcPeriodType: 'this_month_full',
        calcStartRelation: 'current',
        calcEndRelation: 'current',
        calcPeriodStart: 1,
        calcPeriodEnd: 31
      }
    }
  },
  computed: {
    // 탭에 따른 필터링된 항목
    filteredPayrollItems() {
      if (this.activeTab === 'all') {
        return this.payrollItems
      } else if (this.activeTab === 'payment') {
        return this.payrollItems.filter(item => item.type === 'payment')
      } else if (this.activeTab === 'deduction') {
        return this.payrollItems.filter(item => item.type === 'deduction')
      }
      return this.payrollItems
    },
    hasChanges() {
      if (this.originalPayrollItems.length !== this.payrollItems.length) {
        return true
      }
      
      return this.payrollItems.some((item, index) => {
        const original = this.originalPayrollItems[index]
        if (!original) return true
        
        return (
          item.type !== original.type ||
          item.itemName !== original.itemName ||
          item.description !== original.description ||
          item.isActive !== original.isActive ||
          item.isTaxable !== original.isTaxable ||
          item.nonTaxableLimit !== original.nonTaxableLimit
        )
      })
    },
    changedItems() {
      return this.payrollItems.filter((item, index) => {
        const original = this.originalPayrollItems[index]
        if (!original) return true
        
        return (
          item.type !== original.type ||
          item.itemName !== original.itemName ||
          item.description !== original.description ||
          item.isActive !== original.isActive ||
          item.isTaxable !== original.isTaxable ||
          item.nonTaxableLimit !== original.nonTaxableLimit
        )
      })
    }
  },
  async mounted() {
    await this.loadItemOptions()
    await this.loadPayrollItems()
    await this.loadPolicy()
  },
  watch: {
    'policyForm.paymentType'(val) {
      if (val === 'end_of_month') {
        this.policyForm.paymentDay = null
      }
    }
  },
  methods: {
    // 회사 ID 가져오기 (실제로는 사용자 토큰이나 환경변수에서 가져와야 함)
    getCompanyId() {
      // TODO: 실제 구현에서는 사용자 토큰이나 환경변수에서 가져와야 함
      // 현재는 개발용으로 환경변수 또는 기본값 사용
      return process.env.VUE_APP_COMPANY_ID || 'd0ea5827-55f2-4338-9c6d-2a65fea18cb0'
    },
    
    // 항목명 옵션을 API에서 가져오기
    async loadItemOptions() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem/list`, {
          params: { companyId: this.getCompanyId() } // 특정 회사 ID로 요청 (백엔드에서 null 포함해서 응답)
        })
        
        // API 응답에 따라 데이터 구조 조정
        let items = []
        if (response.data) {
          if (Array.isArray(response.data)) {
            items = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            items = response.data.data
          } else if (response.data.payrollItems && Array.isArray(response.data.payrollItems)) {
            items = response.data.payrollItems
          }
        }
        
        // 지급/공제 구분하여 옵션 생성
        this.paymentItemOptions = items
          .filter(item => item.salaryType === 'ALLOWANCE')
          .map(item => ({
            label: item.name,
            value: item.name
          }))
        
        this.deductionItemOptions = items
          .filter(item => item.salaryType === 'DEDUCTION')
          .map(item => ({
            label: item.name,
            value: item.name
          }))
      } catch (error) {
        console.warn('항목 옵션 로드 실패:', error)
        // 실패 시 빈 배열로 초기화
        this.paymentItemOptions = []
        this.deductionItemOptions = []
      }
    },
    
    // 백엔드에서 급여 항목 목록 로드
    async loadPayrollItems() {
      try {
        this.loading = true
        
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem/list`, {
          params: { companyId: this.getCompanyId() }
        })
        
        // API 응답에 따라 데이터 구조 조정
        let items = []
        if (response.data) {
          if (Array.isArray(response.data)) {
            items = response.data
          } else if (response.data.data && Array.isArray(response.data.data)) {
            items = response.data.data
          } else if (response.data.payrollItems && Array.isArray(response.data.payrollItems)) {
            items = response.data.payrollItems
          }
        }
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const convertedItems = items.map((item) => {
          const type = item.salaryType === 'ALLOWANCE' ? 'payment' : 'deduction'
          
          // companyId가 null인 경우는 기본 필수 항목, 그 외는 회사별 항목
          const isBasicRequiredItem = item.companyId === null
          
          return {
            uuid: item.id, // UUID를 사용하여 수정/삭제 시 식별
            tempId: item.id, // row-key로 사용
            type: type,
            itemName: item.name, // 항목명을 직접 사용
            description: item.description || '',
            isActive: item.isActive === 'TRUE' || item.isActive === true || item.isActive === 'true',
            isTaxable: item.isTaxable === true || item.isTaxable === 'TRUE' || item.isTaxable === 'true', // 과세 대상 여부
            nonTaxableLimit: item.nonTaxableLimit || 0, // 비과세 한도
            calculationCode: item.calculationCode || null, // 계산 코드
            createdAt: item.createdAt,
            isBasicRequired: isBasicRequiredItem // 기본 필수 항목 여부
          }
        })
        
        // 지급 항목을 상위에, 공제 항목을 하위에 정렬
        // 각 구분 내에서 기본 필수 항목을 먼저, 기타항목을 나중에 배치
        this.payrollItems = convertedItems.sort((a, b) => {
          // 먼저 구분별로 정렬 (지급 > 공제)
          if (a.type === 'payment' && b.type === 'deduction') return -1
          if (a.type === 'deduction' && b.type === 'payment') return 1
          
          // 같은 구분 내에서는 기본 필수 항목을 먼저, 기타항목을 나중에 배치
          if (a.type === b.type) {
            if (a.isBasicRequired && !b.isBasicRequired) return -1
            if (!a.isBasicRequired && b.isBasicRequired) return 1
          }
          
          return 0
        })
        
        // 원본 데이터 저장 (깊은 복사)
        this.originalPayrollItems = JSON.parse(JSON.stringify(this.payrollItems))
        
      } catch (error) {
        console.error('급여 항목 로드 실패:', error)
        this.payrollItems = []
        this.originalPayrollItems = []
        this.error('급여 항목을 불러오는데 실패했습니다.')
      } finally {
        this.loading = false
      }
    },

    addNewItem() {
      // 현재 탭에 따라 type 설정
      let defaultType = ''
      if (this.activeTab === 'payment') {
        defaultType = 'payment'
      } else if (this.activeTab === 'deduction') {
        defaultType = 'deduction'
      }
      
      // 임시 ID 생성
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const newItem = {
        uuid: null, // 새 항목은 UUID가 없음
        tempId: tempId, // 임시 ID
        type: defaultType,
        itemName: '',
        description: '',
        isActive: true,
        isTaxable: false, // 기본값: 비과세
        nonTaxableLimit: 0, // 기본값: 0원
        calculationCode: null, // 계산 코드
        createdAt: new Date(),
        isBasicRequired: false // 새로 추가하는 항목은 기본 필수 항목이 아님
      }
      this.payrollItems.push(newItem)
      
      // DOM 업데이트 후 스크롤
      this.$nextTick(() => {
        this.scrollToNewItem(tempId)
      })
      
      this.info('새로운 항목이 추가되었습니다. 내용을 입력한 후 저장해주세요.')
    },
    
    // 새로 추가된 항목으로 스크롤
    scrollToNewItem(tempId) {
      const table = this.$refs.payrollTable
      const container = this.$refs.tableContainer
      
      if (!table || !container) return
      
      // 테이블의 모든 행 찾기
      const rows = table.$el.querySelectorAll('tbody tr')
      
      // 해당 임시 ID를 가진 행 찾기
      rows.forEach((row, index) => {
        const rowData = this.filteredPayrollItems[index]
        if (rowData && rowData.tempId === tempId) {
          // 해당 행으로 스크롤
          row.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    },
    
    async deleteItem(item) {
      // row 객체를 받아서 처리
      
      // 기본 필수 항목은 삭제 불가
      if (item.isBasicRequired) {
        this.warning('기본 필수 항목은 삭제할 수 없습니다.')
        return
      }
      
      // 배열에서 해당 항목의 인덱스 찾기
      const index = this.payrollItems.findIndex(p => {
        if (item.uuid) {
          return p.uuid === item.uuid
        } else {
          return p === item
        }
      })
      
      // 새로 추가된 항목(uuid가 null)인 경우 백엔드 요청 없이 로컬에서만 삭제
      if (!item.uuid) {
        this.$confirm('이 항목을 삭제하시겠습니까?', '삭제 확인', {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning'
        }).then(() => {
          this.payrollItems.splice(index, 1)
          this.success('항목이 삭제되었습니다.')
        }).catch(() => {
          this.info('삭제가 취소되었습니다.')
        })
        return
      }

      // 기존 항목인 경우 백엔드 삭제 요청
      this.$confirm('이 항목을 삭제하시겠습니까?', '삭제 확인', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(async () => {
        try {
          // axios delete 요청으로 RequestBody에 항목의 uuid 배열로 전송 (일괄 삭제 대응)
          await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem`, {
            data: [item.uuid]
          })
          
          // 백엔드 삭제 성공 시 로컬에서도 삭제
          this.payrollItems.splice(index, 1)
          this.success('항목이 삭제되었습니다.')
        } catch (error) {
          console.error('항목 삭제 실패:', error)
          this.error('항목 삭제 중 오류가 발생했습니다.')
        }
      }).catch(() => {
        this.info('삭제가 취소되었습니다.')
      })
    },
    
    cancelChanges() {
      // 변경사항이 없으면 취소하지 않음 (추가 안전장치)
      if (!this.hasChanges) {
        this.warning('취소할 변경사항이 없습니다.')
        return
      }
      
      this.$confirm('변경사항을 취소하시겠습니까?', '취소 확인', {
        confirmButtonText: '취소',
        cancelButtonText: '계속 편집',
        type: 'warning'
      }).then(() => {
        // 원본 데이터로 복원
        this.payrollItems = JSON.parse(JSON.stringify(this.originalPayrollItems))
        this.info('변경사항이 취소되었습니다.')
      }).catch(() => {
        this.info('편집을 계속합니다.')
      })
    },

    // 개별 항목의 변경사항 확인
    hasItemChanged(originalItem, currentItem) {
      // 기본 필수 항목은 변경사항 무시
      if (currentItem.isBasicRequired) {
        return false
      }
      
      const fieldsToCompare = ['type', 'itemName', 'description', 'isActive', 'isTaxable', 'nonTaxableLimit']
      
      for (const field of fieldsToCompare) {
        if (currentItem[field] !== originalItem[field]) {
          return true
        }
      }
      
      return false
    },

    async saveItems() {
      // 변경사항이 없으면 저장하지 않음
      if (!this.hasChanges) {
        this.info('변경된 내용이 없습니다.')
        return
      }
      
      // 유효성 검사
      const invalidItems = this.payrollItems.filter(item => {
        if (!item.type || !item.itemName.trim()) return true
        return false
      })
      
      if (invalidItems.length > 0) {
        this.error('구분과 항목명은 필수 입력 항목입니다.')
        return
      }
      
      // 저장 로직 (실제로는 API 호출)
      try {
        // 새 항목과 변경된 기존 항목을 구분
        const newItems = []
        const changedItems = []
        
        this.payrollItems.forEach(item => {
          // 기본 필수 항목은 저장 대상에서 제외
          if (item.isBasicRequired) {
            return
          }
          
          const finalItemName = item.itemName
          const finalSalaryType = item.type === 'payment' ? 'ALLOWANCE' : 'DEDUCTION'
          
          // 새 항목인 경우 (uuid가 null)
          if (!item.uuid) {
            const itemData = {
              companyId: this.getCompanyId(), // 회사 UUID
              salaryType: finalSalaryType,
              name: finalItemName,
              isActive: item.isActive ? 'TRUE' : 'FALSE',
              description: item.description,
              isTaxable: item.isTaxable ? 'TRUE' : 'FALSE',
              nonTaxableLimit: item.nonTaxableLimit || 0,
              calculationCode: null
            }
            newItems.push(itemData)
          } else {
            // 기존 항목인 경우 변경사항 확인
            const originalItem = this.originalPayrollItems.find(orig => orig.uuid === item.uuid)
            if (originalItem && this.hasItemChanged(originalItem, item)) {
              changedItems.push({
                id: item.uuid, // UUID로 식별
                salaryType: finalSalaryType,
                name: finalItemName,
               isActive: item.isActive ? 'TRUE' : 'FALSE',
               description: item.description,
               isTaxable: item.isTaxable ? 'TRUE' : 'FALSE',
               nonTaxableLimit: item.nonTaxableLimit || 0,
                calculationCode: null
              })
            }
          }
        })
        
        // 새 항목 저장 (POST) - 각 항목을 단일 객체로 전송
        if (newItems.length > 0) {
          for (const newItem of newItems) {
            await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem`, newItem)
          }
        }
        
        // 변경된 기존 항목 수정 (PUT)
        if (changedItems.length > 0) {
          await axios.put(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem`, changedItems)
        }
        
        this.success('급여 항목이 성공적으로 저장되었습니다.', {
          title: '저장 완료',
          duration: 3000
        })
        
        // 저장 후 원본 데이터 업데이트
        this.originalPayrollItems = JSON.parse(JSON.stringify(this.payrollItems))
        
        // 저장 후 데이터 다시 로드
        await this.loadPayrollItems()
      } catch (error) {
        console.error('급여 항목 저장 실패:', error)
        this.error('저장 중 오류가 발생했습니다.')
      } finally {
        this.loading = false
      }
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      })
    },
    
    // 구분 변경 시 처리
    handleTypeChange(row) {
      // 구분이 변경되면 항목명과 설명 초기화
      row.itemName = ''
      row.description = ''
    },
    
    // 급여 정책 로드
    async loadPolicy() {
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/salary-policy/list`, {
          params: { companyId: this.getCompanyId() }
        })
        let policy = null
        const d = res?.data
        if (Array.isArray(d)) policy = d[0]
        else if (Array.isArray(d?.data)) policy = d.data[0]
        else if (d?.data) policy = d.data

        if (policy) {
          this.policyExists = true
          const paymentType = policy.payDayType === 'SPECIFIC_DAY' ? 'specific_day' : 'end_of_month'
          const holidayPolicy = policy.holidayRule === 'PREPAID' ? 'previous_day' : 'next_day'

          // periodType에 따른 calcPeriodType 결정
          let calcPeriodType = 'custom'
          if (policy.periodType === 'LAST_MONTH_FULL') {
            calcPeriodType = 'last_month_full'
          } else if (policy.periodType === 'THIS_MONTH_FULL') {
            calcPeriodType = 'this_month_full'
          } else {
            calcPeriodType = 'custom'
          }
          
          // periodStartMonthType, periodEndMonthType에서 관계 매핑
          const calcStartRelation = policy.periodStartMonthType === 'PREVIOUS_MONTH' ? 'prev' : 'current'
          const calcEndRelation = policy.periodEndMonthType === 'PREVIOUS_MONTH' ? 'prev' : 'current'

          this.policyForm = {
            ...this.policyForm,
            paymentType,
            paymentDay: paymentType === 'specific_day' ? policy.paymentDay : null,
            holidayPolicy,
            calcPeriodType,
            calcStartRelation,
            calcEndRelation,
            calcPeriodStart: policy.periodStartDay ?? 1,
            calcPeriodEnd: policy.periodEndDay ?? 31
          }
        } else {
          this.policyExists = false
        }
      } catch (e) {
        // 정책이 없을 수 있으니 조용히 스킵
      }
    },
    
    // 정책 유효성 검사
    validatePolicy() {
      if (this.policyForm.paymentType === 'specific_day' && (!this.policyForm.paymentDay || this.policyForm.paymentDay < 1 || this.policyForm.paymentDay > 31)) {
        this.warning('특정일 지급의 경우 지급일(일)을 1~31 사이로 입력하세요.')
        return false
      }
      if (this.policyForm.paymentType === 'end_of_month') {
        this.policyForm.paymentDay = null
      }
      if (this.policyForm.calcPeriodType === 'custom') {
        if (this.policyForm.calcPeriodStart < 1 || this.policyForm.calcPeriodStart > 31 || this.policyForm.calcPeriodEnd < 1 || this.policyForm.calcPeriodEnd > 31) {
          this.warning('산정 기간 일자는 1~31 사이여야 합니다.')
          return false
        }
        if (!['prev', 'current'].includes(this.policyForm.calcStartRelation) || !['prev', 'current'].includes(this.policyForm.calcEndRelation)) {
          this.warning('산정 기간의 월 구분을 선택하세요.')
          return false
        }
      }
      return true
    },
    
    // 정책 저장
    async savePolicy() {
      if (!this.validatePolicy()) return
      this.saving = true
      try {
        // 백엔드 사양에 맞춘 매핑
        const payDayType = this.policyForm.paymentType === 'specific_day' ? 'SPECIFIC_DAY' : 'END_OF_MONTH'
        const holidayRule = this.policyForm.holidayPolicy === 'previous_day' ? 'PREPAID' : 'POSTPAID'

        // 산정기간 매핑
        let periodType, periodStartMonthType, periodStartDay, periodEndMonthType, periodEndDay
        
        if (this.policyForm.calcPeriodType === 'last_month_full') {
          periodType = 'LAST_MONTH_FULL'
          periodStartMonthType = 'PREVIOUS_MONTH'
          periodStartDay = 1
          periodEndMonthType = 'PREVIOUS_MONTH'
          periodEndDay = 0
        } else if (this.policyForm.calcPeriodType === 'this_month_full') {
          periodType = 'THIS_MONTH_FULL'
          periodStartMonthType = 'CURRENT_MONTH'
          periodStartDay = 1
          periodEndMonthType = 'CURRENT_MONTH'
          periodEndDay = 0
        } else {
          periodType = 'SPECIFIC'
          periodStartMonthType = this.policyForm.calcStartRelation === 'prev' ? 'PREVIOUS_MONTH' : 'CURRENT_MONTH'
          periodStartDay = this.policyForm.calcPeriodStart
          periodEndMonthType = this.policyForm.calcEndRelation === 'prev' ? 'PREVIOUS_MONTH' : 'CURRENT_MONTH'
          periodEndDay = this.policyForm.calcPeriodEnd
        }

        const payload = {
          companyId: this.getCompanyId(),
          payDayType: payDayType,
          paymentDay: this.policyForm.paymentType === 'specific_day' ? this.policyForm.paymentDay : 0,
          holidayRule: holidayRule,
          periodType: periodType,
          periodStartMonthType: periodStartMonthType,
          periodStartDay: periodStartDay,
          periodEndMonthType: periodEndMonthType,
          periodEndDay: periodEndDay
        }

        const endpoint = this.policyExists ? 'update' : 'create'
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/salary-policy/${endpoint}`, payload)
        this.success('급여 정책이 저장되었습니다.')
      } catch (e) {
        this.error('정책 저장 중 오류가 발생했습니다.')
      } finally {
        this.saving = false
      }
    },
    
    // 정책 초기화
    resetPolicy() {
      this.policyForm = {
        paymentType: 'specific_day',
        paymentDay: 25,
        holidayPolicy: 'previous_day',
        calcPeriodType: 'this_month_full',
        calcStartRelation: 'current',
        calcEndRelation: 'current',
        calcPeriodStart: 1,
        calcPeriodEnd: 31
      }
    }
    
  }
}
</script>

<style scoped>
.payroll-item-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.page-header p {
  color: #606266;
  font-size: 14px;
}


.content-section {
  margin-top: 24px;
}

.content-section :deep(.el-card__body) {
  padding-top: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span:first-child {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.item-count {
  font-size: 14px;
  color: #606266;
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 12px;
}

.table-wrapper {
  margin-top: 20px;
}

.table-container {
  max-height: 350px;
  overflow-y: auto;
  position: relative;
}

.table-container :deep(.el-table) {
  height: 100%;
}

.table-container :deep(.el-table__header) {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f8f9fa;
}

/* 스크롤바 스타일 커스터마이징 */
.table-container::-webkit-scrollbar {
  width: 6px;
}

.table-container::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}

/* 상단 탭 스타일 */
.top-tabs {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 0;
}

.tabs-left {
  display: flex;
  gap: 0;
}

.tabs-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.tabs-actions .el-button {
  margin-left: 0 !important;
}

.top-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  top: 2px;
}

.top-tab:hover {
  color: #409EFF;
  background-color: #f5f9ff;
}

.top-tab.active {
  color: #409EFF;
  font-weight: 600;
  border-bottom-color: #409EFF;
  background-color: #ecf5ff;
}

.top-tab .tab-label {
  font-size: 13px;
}

.top-tab .tab-count {
  font-size: 11px;
  opacity: 0.7;
}

.top-tab.active .tab-count {
  opacity: 1;
  font-weight: 600;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.policy-section {
  margin-top: 24px;
}

.policy-form {
  width: 100%;
}

.policy-form :deep(.el-form-item) {
  align-items: flex-start;
}

.policy-form :deep(.el-form-item__content) {
  display: flex;
  align-items: flex-start;
}

.policy-form :deep(.el-form-item__label) {
  align-self: flex-start;
}

.no-bottom-margin {
  margin-bottom: 0 !important;
}

.horizontal-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 992px) {
  .horizontal-sections {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
  
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.section {
  margin-bottom: 12px;
}

.section-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px 16px;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.range-inline {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  align-self: center;
  width: 100%;
  margin: 16px auto;
  padding-right: 0;
}

.range-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.range-label {
  font-size: 13px;
  color: #606266;
  text-align: right;
  width: 100%;
}

.range-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  width: 250px;
  margin-left: auto;
}

.range-sep {
  align-self: center;
  color: #909399;
  margin: 8px 0;
}

.hint {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.range-hint {
  width: 250px;
  margin: 0 auto;
}

.range-hint .hint {
  text-align: right;
  margin-left: 0;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 테이블 스타일 */
.table-container :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-container :deep(.el-table th) {
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
}

.table-container :deep(.el-table td) {
  border-bottom: 1px solid #f0f0f0;
}

.table-container :deep(.el-table tr:hover > td) {
  background: #f8f9fa;
}

/* 항목명 컨테이너 스타일 */
.item-name-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 기본 필수 항목의 커서 스타일 강제 적용 */
.table-container :deep(.el-select.is-disabled) {
  cursor: default !important;
}

.table-container :deep(.el-switch.is-disabled) {
  cursor: default !important;
}

.table-container :deep(.el-input.is-disabled) {
  cursor: default !important;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .payroll-item-management {
    padding: 16px;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .top-tabs {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .tabs-actions {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .top-tab {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .top-tab .tab-label {
    font-size: 12px;
  }
  
  .top-tab .tab-count {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}

/* 버튼 스타일링 */
.disabled-button {
  opacity: 0.5 !important;
  filter: grayscale(50%);
}

.disabled-button:hover {
  transform: none !important;
}

/* 저장 버튼 활성화 상태 */
.tabs-actions .el-button--success:not(.disabled-button) {
  background-color: #67c23a;
  border-color: #67c23a;
  box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
}

.tabs-actions .el-button--success:not(.disabled-button):hover {
  background-color: #85ce61;
  border-color: #85ce61;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(103, 194, 58, 0.4);
}

/* 취소 버튼 활성화 상태 */
.tabs-actions .el-button--info:not(.disabled-button) {
  background-color: #909399;
  border-color: #909399;
  box-shadow: 0 2px 4px rgba(144, 147, 153, 0.3);
}

 .tabs-actions .el-button--info:not(.disabled-button):hover {
   background-color: #a6a9ad;
   border-color: #a6a9ad;
   transform: translateY(-1px);
   box-shadow: 0 4px 8px rgba(144, 147, 153, 0.4);
 }

 /* 비활성화된 체크박스 스타일 */
 .disabled-checkbox :deep(.el-checkbox__input) {
   background-color: #f5f7fa !important;
   border-color: #dcdfe6 !important;
 }

 .disabled-checkbox :deep(.el-checkbox__label) {
   color: #c0c4cc !important;
 }

 .disabled-checkbox :deep(.el-checkbox__input.is-disabled + .el-checkbox__label) {
   color: #c0c4cc !important;
 }

 /* 비활성화된 입력 필드 스타일 */
 .disabled-input :deep(.el-input__inner) {
   background-color: #f5f7fa !important;
   color: #c0c4cc !important;
   border-color: #dcdfe6 !important;
 }

 .disabled-input :deep(.el-input__inner:focus) {
   background-color: #f5f7fa !important;
   border-color: #dcdfe6 !important;
 }

/* 로딩 컨테이너 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  min-height: 300px;
}

.loading-container .el-icon {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
 </style>
