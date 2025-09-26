<template>
  <div class="resource-management">
    <div class="page-header">
      <div class="header-content">
        <h1>자원 관리</h1>
        <p>회의실, 차량 등 공용 자원을 관리하세요.</p>
      </div>
      <div class="header-actions">
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
          <el-option label="회의실" value="meeting_room" />
          <el-option label="차량" value="vehicle" />
          <el-option label="장비" value="equipment" />
          <el-option label="기타" value="other" />
        </el-select>
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
            <el-option label="회의실" value="meeting_room" />
            <el-option label="차량" value="vehicle" />
            <el-option label="장비" value="equipment" />
            <el-option label="기타" value="other" />
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
        <el-form-item label="상태" prop="status">
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
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

export default {
  name: 'ResourceManagement',
  components: {
    Plus,
    Search
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
          { required: true, message: '상태를 선택해주세요', trigger: 'change' }
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
          ElMessage.success('자원이 삭제되었습니다.')
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
            ElMessage.success('자원이 수정되었습니다.')
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
          ElMessage.success('자원이 추가되었습니다.')
        }
        
        this.dialogVisible = false
        this.resetForm()
        
      } catch (error) {
        if (error !== false) { // 폼 검증 실패가 아닌 경우
          ElMessage.error('저장 중 오류가 발생했습니다.')
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
}

.search-bar {
  margin-bottom: 16px;
}

.search-bar .el-input {
  max-width: 400px;
}

.filter-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.filter-section .el-select {
  min-width: 150px;
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
  }
  
  .search-bar .el-input {
    max-width: 100%;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .filter-section .el-select {
    min-width: auto;
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
</style>
