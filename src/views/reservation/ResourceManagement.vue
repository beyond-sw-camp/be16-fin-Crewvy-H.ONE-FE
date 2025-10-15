<template>
  <div class="resource-management">
    <div class="page-header">
      <div class="header-content">
        <h1>자원 관리</h1>
        <p>회의실, 차량 등 공용 자원을 관리하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="success" @click="showCategoryDialog">
          <el-icon><Setting /></el-icon>
          <span style="margin-left: 8px;">카테고리 관리</span>
        </el-button>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          <span style="margin-left: 8px;">자원 추가</span>
        </el-button>
      </div>
    </div>

    <!-- 검색 및 필터 -->
    <div class="search-section">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="자원명으로 검색..."
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="filter-section">
        <el-select v-model="selectedCategory" placeholder="카테고리" clearable @change="handleFilter">
          <el-option label="전체" value="" />
          <el-option 
            v-for="category in categories" 
            :key="category.id" 
            :label="category.name" 
            :value="category.value" 
          />
        </el-select>
      </div>
      <div class="filter-section">
        <el-select v-model="selectedStatus" placeholder="상태" clearable @change="handleFilter">
          <el-option label="전체" value="" />
          <el-option label="사용가능" value="available" />
          <el-option label="사용중" value="in_use" />
          <el-option label="점검중" value="maintenance" />
        </el-select>
      </div>
    </div>

    <!-- 자원 목록 테이블 -->
    <div class="table-section">
      <el-table
        :data="filteredResources"
        v-loading="loading"
        stripe
        style="width: 100%"
        empty-text="등록된 자원이 없습니다."
        :reserve-selection="true"
        :row-key="row => row.id"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="자원명" min-width="150" />
        <el-table-column prop="category" label="카테고리" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="위치" min-width="120" />
        <el-table-column prop="capacity" label="수용인원" width="100" />
        <el-table-column prop="status" label="상태" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="설명" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="등록일" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="관리" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editResource(row)">수정</el-button>
            <el-button size="small" type="danger" @click="deleteResource(row)">삭제</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 자원 추가/수정 다이얼로그 -->
    <el-dialog
      :title="isEditMode ? '자원 수정' : '자원 추가'"
      v-model="dialogVisible"
      width="600px"
      @close="resetForm"
      :destroy-on-close="true"
      :close-on-click-modal="false"
    >
      <el-form
        ref="resourceForm"
        :model="resourceForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="자원명" prop="name">
          <el-input v-model="resourceForm.name" placeholder="자원명을 입력하세요" />
        </el-form-item>
        <el-form-item label="카테고리" prop="category">
          <el-select v-model="resourceForm.category" placeholder="카테고리를 선택하세요">
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="위치" prop="location">
          <el-input v-model="resourceForm.location" placeholder="위치를 입력하세요" />
        </el-form-item>
        <el-form-item label="수용인원" prop="capacity">
          <el-input-number
            v-model="resourceForm.capacity"
            :min="1"
            :max="1000"
            placeholder="수용인원"
          />
        </el-form-item>
        <el-form-item v-if="isEditMode" label="상태" prop="status">
          <el-select v-model="resourceForm.status" placeholder="상태를 선택하세요">
            <el-option label="사용가능" value="available" />
            <el-option label="사용중" value="in_use" />
            <el-option label="점검중" value="maintenance" />
          </el-select>
        </el-form-item>
        <el-form-item label="설명" prop="description">
          <el-input
            v-model="resourceForm.description"
            type="textarea"
            :rows="3"
            placeholder="자원에 대한 설명을 입력하세요"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">취소</el-button>
          <el-button type="primary" @click="saveResource" :loading="saving">
            {{ isEditMode ? '수정' : '추가' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 카테고리 관리 다이얼로그 -->
    <el-dialog
      title="카테고리 관리"
      v-model="categoryDialogVisible"
      width="600px"
      @close="resetCategoryForm"
      :destroy-on-close="true"
      :close-on-click-modal="false"
    >
      <div class="category-management">
        <div class="category-form">
          <div class="category-form-content">
            <el-form
              ref="categoryForm"
              :model="categoryForm"
              :rules="categoryFormRules"
              label-width="100px"
              inline
            >
              <el-form-item label="카테고리명" prop="name">
                <el-input 
                  v-model="categoryForm.name" 
                  placeholder="카테고리명을 입력하세요" 
                  style="width: 200px;"
                />
              </el-form-item>
            </el-form>
            <div class="category-form-buttons">
              <el-button type="primary" @click="saveCategory" :loading="categorySaving">
                {{ isCategoryEditMode ? '수정' : '추가' }}
              </el-button>
              <el-button v-if="isCategoryEditMode" @click="cancelCategoryEdit">
                취소
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="category-list">
          <el-table 
            :data="categories" 
            style="width: 100%"
            :reserve-selection="true"
            :row-key="row => row.id"
          >
            <el-table-column prop="name" label="카테고리명" align="center" />
            <el-table-column label="관리" align="center">
              <template #default="{ row, $index }">
                <el-button 
                  size="small" 
                  @click="editCategory(row, $index)"
                >
                  수정
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click="deleteCategory(row, $index)"
                  :disabled="categories.length <= 1"
                >
                  삭제
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">닫기</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessageBox } from 'element-plus'
import { Plus, Search, Setting } from '@element-plus/icons-vue'
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'ResourceManagement',
  components: {
    Plus,
    Search,
    Setting
  },
  setup() {
    const { success, error } = useSnackbar()
    
    // ResizeObserver 루프 경고 방지
    const suppressResizeObserverError = () => {
      const originalError = console.error
      console.error = (...args) => {
        if (args[0] && args[0].includes && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
          return
        }
        originalError.apply(console, args)
      }
    }
    
    // 컴포넌트 마운트 시 에러 억제
    suppressResizeObserverError()
    
    return {
      success,
      error
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      dialogVisible: false,
      isEditMode: false,
      searchQuery: '',
      selectedCategory: '',
      selectedStatus: '',
      
      // 카테고리 관리
      categoryDialogVisible: false,
      categorySaving: false,
      isCategoryEditMode: false,
      editingCategoryIndex: -1,
      categories: [
        { id: 1, name: '회의실', value: 'meeting_room' },
        { id: 2, name: '차량', value: 'vehicle' },
        { id: 3, name: '장비', value: 'equipment' },
        { id: 4, name: '기타', value: 'other' }
      ],
      categoryForm: {
        name: ''
      },
      categoryFormRules: {
        name: [
          { required: true, message: '카테고리명을 입력해주세요', trigger: 'blur' },
          { min: 2, max: 20, message: '카테고리명은 2-20자 사이여야 합니다', trigger: 'blur' }
        ]
      },
      
      // 자원 목록 데이터
      resources: [
        {
          id: 1,
          name: '대회의실 A',
          category: 'meeting_room',
          location: '3층 301호',
          capacity: 20,
          status: 'available',
          description: '프레젠테이션 시설이 완비된 대형 회의실',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          name: '소회의실 B',
          category: 'meeting_room',
          location: '3층 302호',
          capacity: 8,
          status: 'in_use',
          description: '소규모 회의용 회의실',
          createdAt: '2024-01-15'
        },
        {
          id: 3,
          name: '회사 차량 1',
          category: 'vehicle',
          location: '지하 1층 주차장',
          capacity: 5,
          status: 'available',
          description: '승용차 - 외근 및 출장용',
          createdAt: '2024-01-10'
        },
        {
          id: 4,
          name: '프로젝터',
          category: 'equipment',
          location: '3층 보관실',
          capacity: 1,
          status: 'maintenance',
          description: '고화질 프로젝터 - 회의실 사용',
          createdAt: '2024-01-20'
        },
        {
          id: 5,
          name: '노트북',
          category: 'equipment',
          location: 'IT팀 사무실',
          capacity: 1,
          status: 'available',
          description: '회의용 노트북',
          createdAt: '2024-01-25'
        }
      ],
      
      // 폼 데이터
      resourceForm: {
        id: null,
        name: '',
        category: '',
        location: '',
        capacity: 1,
        status: 'available',
        description: ''
      },
      
      // 폼 검증 규칙
      formRules: {
        name: [
          { required: true, message: '자원명을 입력해주세요', trigger: 'blur' },
          { min: 2, max: 50, message: '자원명은 2-50자 사이여야 합니다', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '카테고리를 선택해주세요', trigger: 'change' }
        ],
        location: [
          { required: true, message: '위치를 입력해주세요', trigger: 'blur' },
          { min: 2, max: 100, message: '위치는 2-100자 사이여야 합니다', trigger: 'blur' }
        ],
        capacity: [
          { required: true, message: '수용인원을 입력해주세요', trigger: 'blur' },
          { type: 'number', min: 1, max: 1000, message: '수용인원은 1-1000명 사이여야 합니다', trigger: 'blur' }
        ],
        status: [
          { required: this.isEditMode, message: '상태를 선택해주세요', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    filteredResources() {
      let filtered = this.resources
      
      // 검색어 필터링
      if (this.searchQuery) {
        filtered = filtered.filter(resource =>
          resource.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          resource.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          resource.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      // 카테고리 필터링
      if (this.selectedCategory) {
        filtered = filtered.filter(resource => resource.category === this.selectedCategory)
      }
      
      // 상태 필터링
      if (this.selectedStatus) {
        filtered = filtered.filter(resource => resource.status === this.selectedStatus)
      }
      
      return filtered
    }
  },
  methods: {
    // 검색 처리
    handleSearch() {
      // 검색은 computed property에서 자동으로 처리됨
    },
    
    // 필터 처리
    handleFilter() {
      // 필터링은 computed property에서 자동으로 처리됨
    },
    
    // 자원 추가 다이얼로그 표시
    showAddDialog() {
      this.isEditMode = false
      this.resetForm()
      this.dialogVisible = true
    },
    
    // 자원 수정
    editResource(resource) {
      this.isEditMode = true
      this.resourceForm = { ...resource }
      this.dialogVisible = true
    },
    
    // 자원 삭제
    async deleteResource(resource) {
      try {
        await ElMessageBox.confirm(
          `"${resource.name}" 자원을 삭제하시겠습니까?`,
          '자원 삭제',
          {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning'
          }
        )
        
        const index = this.resources.findIndex(r => r.id === resource.id)
        if (index > -1) {
          this.resources.splice(index, 1)
          
          // ID 자동 정렬 (1부터 순차적으로 재할당)
          this.resources.forEach((resource, index) => {
            resource.id = index + 1
          })
          
          this.success('자원이 삭제되었습니다.')
        }
      } catch (error) {
        // 사용자가 취소한 경우
      }
    },
    
    // 자원 저장
    async saveResource() {
      try {
        await this.$refs.resourceForm.validate()
        
        this.saving = true
        
        // 실제 API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (this.isEditMode) {
          // 수정
          const index = this.resources.findIndex(r => r.id === this.resourceForm.id)
          if (index > -1) {
            this.resources.splice(index, 1, { ...this.resourceForm })
            this.success('자원이 수정되었습니다.')
          }
        } else {
          // 추가
          const newId = Math.max(...this.resources.map(r => r.id)) + 1
          const newResource = {
            ...this.resourceForm,
            id: newId,
            createdAt: new Date().toISOString().split('T')[0]
          }
          this.resources.unshift(newResource)
          this.success('자원이 추가되었습니다.')
        }
        
        this.dialogVisible = false
        this.resetForm()
        
      } catch (error) {
        if (error !== false) { // 폼 검증 실패가 아닌 경우
          this.error('저장 중 오류가 발생했습니다.')
        }
      } finally {
        this.saving = false
      }
    },
    
    // 폼 초기화
    resetForm() {
      this.resourceForm = {
        id: null,
        name: '',
        category: '',
        location: '',
        capacity: 1,
        status: 'available',
        description: ''
      }
      if (this.$refs.resourceForm) {
        this.$refs.resourceForm.clearValidate()
      }
    },
    
    // 카테고리 라벨 반환
    getCategoryLabel(category) {
      const labels = {
        meeting_room: '회의실',
        vehicle: '차량',
        equipment: '장비',
        other: '기타'
      }
      return labels[category] || category
    },
    
    // 카테고리 태그 타입 반환
    getCategoryTagType(category) {
      const types = {
        meeting_room: 'primary',
        vehicle: 'success',
        equipment: 'warning',
        other: 'info'
      }
      return types[category] || 'info'
    },
    
    // 상태 라벨 반환
    getStatusLabel(status) {
      const labels = {
        available: '사용가능',
        in_use: '사용중',
        maintenance: '점검중'
      }
      return labels[status] || status
    },
    
    // 상태 태그 타입 반환
    getStatusTagType(status) {
      const types = {
        available: 'success',
        in_use: 'warning',
        maintenance: 'danger'
      }
      return types[status] || 'info'
    },
    
    // 날짜 포맷팅
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR')
    },
    
    // 카테고리 관리 다이얼로그 표시
    showCategoryDialog() {
      this.categoryDialogVisible = true
    },
    
    // 카테고리 저장 (추가/수정)
    async saveCategory() {
      try {
        await this.$refs.categoryForm.validate()
        
        this.categorySaving = true
        
        // 실제 API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 중복 체크 (수정 모드에서는 현재 편집 중인 카테고리 제외)
        const existingCategory = this.categories.find((cat, index) => 
          index !== this.editingCategoryIndex && (
            cat.name === this.categoryForm.name || 
            cat.value === this.categoryForm.name.toLowerCase().replace(/\s+/g, '_')
          )
        )
        
        if (existingCategory) {
          this.error('이미 존재하는 카테고리입니다.')
          return
        }
        
        if (this.isCategoryEditMode) {
          // 수정
          const newValue = this.categoryForm.name.toLowerCase().replace(/\s+/g, '_')
          
          // 기존 자원들의 카테고리 값도 업데이트
          this.resources.forEach(resource => {
            if (resource.category === this.categories[this.editingCategoryIndex].value) {
              resource.category = newValue
            }
          })
          
          // 카테고리 정보 업데이트
          this.categories[this.editingCategoryIndex].name = this.categoryForm.name
          this.categories[this.editingCategoryIndex].value = newValue
          
          this.success('카테고리가 수정되었습니다.')
        } else {
          // 추가
          const newCategory = {
            id: Math.max(...this.categories.map(c => c.id)) + 1,
            name: this.categoryForm.name,
            value: this.categoryForm.name.toLowerCase().replace(/\s+/g, '_')
          }
          
          this.categories.push(newCategory)
          this.success('카테고리가 추가되었습니다.')
        }
        
        this.resetCategoryForm()
        
      } catch (error) {
        if (error !== false) { // 폼 검증 실패가 아닌 경우
          this.error(this.isCategoryEditMode ? '카테고리 수정 중 오류가 발생했습니다.' : '카테고리 추가 중 오류가 발생했습니다.')
        }
      } finally {
        this.categorySaving = false
      }
    },
    
    // 카테고리 수정
    editCategory(category, index) {
      this.isCategoryEditMode = true
      this.editingCategoryIndex = index
      this.categoryForm.name = category.name
    },
    
    // 카테고리 수정 취소
    cancelCategoryEdit() {
      this.isCategoryEditMode = false
      this.editingCategoryIndex = -1
      this.resetCategoryForm()
    },
    
    // 카테고리 삭제
    async deleteCategory(category, index) {
      try {
        // 해당 카테고리를 사용하는 자원이 있는지 확인
        const usedResources = this.resources.filter(resource => resource.category === category.value)
        
        if (usedResources.length > 0) {
          this.error(`"${category.name}" 카테고리를 사용하는 자원이 있어 삭제할 수 없습니다.`)
          return
        }
        
        await ElMessageBox.confirm(
          `"${category.name}" 카테고리를 삭제하시겠습니까?`,
          '카테고리 삭제',
          {
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            type: 'warning'
          }
        )
        
        this.categories.splice(index, 1)
        this.success('카테고리가 삭제되었습니다.')
        
      } catch (error) {
        // 사용자가 취소한 경우
      }
    },
    
    // 카테고리 폼 초기화
    resetCategoryForm() {
      this.categoryForm = {
        name: ''
      }
      this.isCategoryEditMode = false
      this.editingCategoryIndex = -1
      if (this.$refs.categoryForm) {
        this.$refs.categoryForm.clearValidate()
      }
    }
  }
}
</script>

<style scoped>
.resource-management {
  max-width: 1220px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.header-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-bar {
  flex: 2;
  min-width: 180px;
}

.search-bar .el-input {
  width: 100%;
}

.filter-section {
  flex: 1;
}

.filter-section .el-select {
  width: 100%;
}

.table-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .resource-management {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-content h1 {
    font-size: 24px;
  }
  
  .search-section {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  .search-bar {
    max-width: 100%;
    flex: none;
  }
  
  .search-bar .el-input {
    width: 100%;
  }
  
  .filter-section {
    flex: none;
    width: 100%;
  }
  
  .filter-section .el-select {
    width: 100%;
  }
  
  .table-section {
    padding: 16px;
    overflow-x: auto;
  }
}

/* 테이블 스타일 개선 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-table .cell) {
  padding: 0 12px;
}

/* 태그 스타일 */
:deep(.el-tag) {
  font-weight: 500;
}

/* 버튼 스타일 */
:deep(.el-button--small) {
  padding: 5px 12px;
  font-size: 12px;
}

/* 폼 스타일 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #2c3e50;
}

:deep(.el-input__inner) {
  border-radius: 6px;
}

:deep(.el-select .el-input__inner) {
  border-radius: 6px;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
}

/* 다이얼로그 스타일 */
:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #ebeef5;
}

/* 카테고리 관리 스타일 */
.category-management {
  padding: 10px 0;
}

.category-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  width: 100%;
  min-width: 500px;
}

.category-form :deep(.el-form-item) {
  margin-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.category-form :deep(.el-form-item__label) {
  margin-bottom: 0 !important;
  line-height: 32px;
}

.category-form-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
}

.category-form-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.category-form :deep(.el-form-item) {
  margin-bottom: 0 !important;
  display: flex;
  align-items: center;
}

.category-form :deep(.el-form-item__label) {
  margin-bottom: 0 !important;
  line-height: 32px;
}

.category-form :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.category-list {
  margin-top: 20px;
}

.category-list .el-table {
  border-radius: 6px;
  overflow: hidden;
}

.category-list :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
}
</style>
