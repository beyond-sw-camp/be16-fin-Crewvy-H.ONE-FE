<template>
  <div class="payroll-item-management">
    <div class="page-header">
      <div class="header-content">
        <h1>급여 기초 정보</h1>
        <p>급여 지급 및 공제 항목을 관리합니다.</p>
      </div>
      <div class="header-actions">
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

    <!-- 급여 항목 테이블 -->
    <div class="content-section">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>급여 항목 관리</span>
            <span class="item-count">총 {{ payrollItems.length }}개 항목</span>
          </div>
        </template>
        
        <!-- 테이블이 비어있을 때 -->
        <div v-if="payrollItems.length === 0" class="empty-state">
          <el-empty description="등록된 급여 항목이 없습니다">
            <el-button type="primary" @click="addNewItem">첫 번째 항목 추가</el-button>
          </el-empty>
        </div>
        
        <!-- 테이블이 있을 때 -->
        <div v-else class="table-container">
          <el-table 
            :data="payrollItems" 
            border 
            style="width: 100%"
            v-loading="loading"
            element-loading-text="데이터를 불러오는 중..."
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
                  @click="deleteItem(scope.$index)"
                >
                  <el-icon><Delete /></el-icon>
                  삭제
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>

    <!-- 급여 항목 통계 -->
    <div class="statistics-section">
      <div class="stats-cards">
        <div class="stats-card payment">
          <div class="stats-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-label">지급</div>
            <div class="stats-value">{{ paymentItemsCount }}개</div>
          </div>
        </div>
        
        <div class="stats-card deduction">
          <div class="stats-icon">
            <el-icon><Remove /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-label">공제</div>
            <div class="stats-value">{{ deductionItemsCount }}개</div>
          </div>
        </div>
        
        <div class="stats-card active">
          <div class="stats-icon">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-label">사용중인 항목</div>
            <div class="stats-value">{{ activeItemsCount }}개</div>
          </div>
        </div>
        
        <div class="stats-card inactive">
          <div class="stats-icon">
            <el-icon><Close /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-label">미사용 항목</div>
            <div class="stats-value">{{ inactiveItemsCount }}개</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import axios from 'axios'
import { Plus, Document, RefreshLeft, Money, Remove, Check, Close, Delete } from '@element-plus/icons-vue'

export default {
  name: 'PayrollItemManagement',
  components: {
    Plus,
    Document,
    RefreshLeft,
    Money,
    Remove,
    Check,
    Close,
    Delete
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
      // API에서 가져온 항목명 옵션
      paymentItemOptions: [],
      deductionItemOptions: []
    }
  },
  computed: {
    paymentItemsCount() {
      return this.payrollItems.filter(item => item.type === 'payment').length
    },
    deductionItemsCount() {
      return this.payrollItems.filter(item => item.type === 'deduction').length
    },
    activeItemsCount() {
      return this.payrollItems.filter(item => item.isActive).length
    },
    inactiveItemsCount() {
      return this.payrollItems.filter(item => !item.isActive).length
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
  },
  methods: {
    // 회사 ID 가져오기 (실제로는 사용자 세션이나 환경변수에서 가져와야 함)
    getCompanyId() {
      // TODO: 실제 구현에서는 사용자 세션이나 환경변수에서 가져와야 함
      // 현재는 개발용으로 환경변수 또는 기본값 사용
      return process.env.VUE_APP_COMPANY_ID || 'f1e85c26-14fa-4603-8edd-bfbdd82234ab'
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
        console.log('백엔드에서 받은 데이터:', items)
        const convertedItems = items.map((item) => {
          const type = item.salaryType === 'ALLOWANCE' ? 'payment' : 'deduction'
          
          // companyId가 null인 경우는 기본 필수 항목, 그 외는 회사별 항목
          const isBasicRequiredItem = item.companyId === null
          
          return {
            uuid: item.id, // UUID를 사용하여 수정/삭제 시 식별
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
        console.log('변환된 데이터:', this.payrollItems)
        
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
        const newItem = {
          uuid: null, // 새 항목은 UUID가 없음
          type: '',
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
      this.info('새로운 항목이 추가되었습니다. 내용을 입력한 후 저장해주세요.')
    },
    async deleteItem(index) {
      const item = this.payrollItems[index]
      
      // 기본 필수 항목은 삭제 불가
      if (item.isBasicRequired) {
        this.warning('기본 필수 항목은 삭제할 수 없습니다.')
        return
      }
      
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
              memberId: null, // 새 항목은 memberId가 null
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
        
        // 새 항목 저장 (POST)
        if (newItems.length > 0) {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/workforce-service/payrollItem`, newItems)
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
    
  },
  async created() {
    // 컴포넌트 생성 시 급여 항목 목록 로드
    await this.loadPayrollItems()
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

.header-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: flex-end;
}

.content-section {
  margin-bottom: 24px;
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

.table-container {
  margin-top: 16px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.statistics-section {
  margin-top: 24px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stats-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.stats-card.payment .stats-icon {
  background: #10b981;
}

.stats-card.deduction .stats-icon {
  background: #ef4444;
}

.stats-card.active .stats-icon {
  background: #3b82f6;
}

.stats-card.inactive .stats-icon {
  background: #6b7280;
}

.stats-content {
  flex: 1;
}

.stats-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
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
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
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
.header-actions .el-button--success:not(.disabled-button) {
  background-color: #67c23a;
  border-color: #67c23a;
  box-shadow: 0 2px 4px rgba(103, 194, 58, 0.3);
}

.header-actions .el-button--success:not(.disabled-button):hover {
  background-color: #85ce61;
  border-color: #85ce61;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(103, 194, 58, 0.4);
}

/* 취소 버튼 활성화 상태 */
.header-actions .el-button--info:not(.disabled-button) {
  background-color: #909399;
  border-color: #909399;
  box-shadow: 0 2px 4px rgba(144, 147, 153, 0.3);
}

 .header-actions .el-button--info:not(.disabled-button):hover {
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
 </style>
