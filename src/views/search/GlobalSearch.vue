<template>
  <div class="global-search">
    <div class="page-header">
      <div class="header-content">
        <h1>통합 검색</h1>
        <p>H.ONE의 모든 정보를 검색합니다.</p>
      </div>
    </div>

    <div class="search-section">
            <el-input
              v-model="searchQuery"
              placeholder="직원, 부서, 결재 문서, 회의록 등 무엇이든 검색해보세요."
              prefix-icon="Search"
              clearable
              @keyup.enter="performSearch"
            >
            </el-input>
            <el-button @click="performSearch">검색</el-button>
    </div>

    <div class="search-results">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="전체" name="all">
          <div v-if="!searched">
            <el-empty description="검색어를 입력해주세요."></el-empty>
          </div>
          <div v-else-if="results.length === 0">
            <el-empty :description="`'${searchQuery}'에 대한 검색 결과가 없습니다.`"></el-empty>
          </div>
          <div v-else>
            <!-- Employee Results in All Tab -->
            <div v-if="getResultsByCategory('employee').length > 0" class="result-group">
              <h2 class="group-title">직원</h2>
              <div class="employee-list-header">
                <div class="employee-list-cell">이름</div>
                <div class="employee-list-cell">부서</div>
                <div class="employee-list-cell">직책</div>
                <div class="employee-list-cell">연락처</div>
                <div class="employee-list-cell">상태</div>
              </div>
              <div v-for="result in getResultsByCategory('employee').slice(0, 5)" :key="result.id"
                class="employee-list-row" @click="navigateTo(result)">
                <div class="employee-list-cell">{{ result.title }}</div>
                <div class="employee-list-cell">{{ result.department }}</div>
                <div class="employee-list-cell">{{ result.position }}</div>
                <div class="employee-list-cell">{{ result.contact }}</div>
                <div class="employee-list-cell">{{ result.status }}</div>
              </div>
              <div v-if="getResultsByCategory('employee').length > 5" class="view-more-container">
                <el-button type="text" @click="activeTab = 'employee'">직원 더보기 ({{
                  getResultsByCategory('employee').length -
                  5 }}개)</el-button>
              </div>
            </div>

            <!-- Approval Results in All Tab -->
            <div v-if="approvalResults.length > 0" class="result-group">
              <h2 class="group-title">결재문서</h2>
              <div class="approval-list-header">
                <div class="approval-list-cell">제목</div>
                <div class="approval-list-cell">직책명</div>
                <div class="approval-list-cell">이름</div>
                <div class="approval-list-cell">작성일</div>
              </div>
              <div v-for="result in approvalResults.slice(0, 5)" :key="result.id" class="approval-list-row"
                @click="navigateTo(result)">
                <div class="approval-list-cell">{{ result.title }}</div>
                <div class="approval-list-cell">{{ result.titleName }}</div>
                <div class="approval-list-cell">{{ result.memberName }}</div>
                <div class="approval-list-cell">{{ formatDateTime(result.createAt) }}</div>
              </div>
              <div v-if="approvalTotalItems > 5" class="view-more-container">
                <el-button type="text" @click="activeTab = 'approval'">결재문서 더보기 ({{ approvalTotalItems - 5
                }}개)</el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Employee Tab -->
        <el-tab-pane label="직원" name="employee">
          <div v-if="!searched">
            <el-empty description="검색어를 입력해주세요."></el-empty>
          </div>
          <div v-else-if="getResultsByCategory('employee').length === 0">
            <el-empty :description="`'${searchQuery}'에 대한 직원 검색 결과가 없습니다.`"></el-empty>
          </div>
          <div v-else>
            <div class="employee-list-header">
              <div class="employee-list-cell">이름</div>
              <div class="employee-list-cell">부서</div>
              <div class="employee-list-cell">직책</div>
              <div class="employee-list-cell">연락처</div>
              <div class="employee-list-cell">상태</div>
            </div>
            <div v-for="result in getResultsByCategory('employee')" :key="result.id" class="employee-list-row"
              @click="navigateTo(result)">
              <div class="employee-list-cell">{{ result.title }}</div>
              <div class="employee-list-cell">{{ result.department }}</div>
              <div class="employee-list-cell">{{ result.position }}</div>
              <div class="employee-list-cell">{{ result.contact }}</div>
              <div class="employee-list-cell">{{ result.status }}</div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Approval Tab -->
        <el-tab-pane label="결재문서" name="approval">
          <div v-if="!searched">
            <el-empty description="검색어를 입력해주세요."></el-empty>
          </div>
          <div v-else-if="approvalResults.length === 0">
            <el-empty :description="`'${searchQuery}'에 대한 결재문서 검색 결과가 없습니다.`"></el-empty>
          </div>
          <div v-else>
            <div class="approval-list-header">
              <div class="approval-list-cell">제목</div>
              <div class="approval-list-cell">직책명</div>
              <div class="approval-list-cell">이름</div>
              <div class="approval-list-cell">작성일</div>
            </div>
            <div v-for="result in approvalResults" :key="result.id" class="approval-list-row"
              @click="navigateTo(result)">
              <div class="approval-list-cell">{{ result.title }}</div>
              <div class="approval-list-cell">{{ result.titleName }}</div>
              <div class="approval-list-cell">{{ result.memberName }}</div>
              <div class="approval-list-cell">{{ formatDateTime(result.createAt) }}</div>
            </div>
            <el-pagination background layout="prev, pager, next" :total="approvalTotalItems"
              :page-size="approvalsPerPage" v-model:current-page="approvalCurrentPage"
              @current-change="handleApprovalPageChange" class="pagination-container" />
          </div>
        </el-tab-pane>

        <!-- Other tabs will be dynamically created here, but won't have content yet -->
        <el-tab-pane v-for="category in categories.filter(c => c.name !== 'employee' && c.name !== 'approval')"
          :key="category.name" :label="category.label" :name="category.name">
          <el-empty :description="`'${category.label}'에 대한 검색 기능은 아직 준비중입니다.`"></el-empty>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import searchService from '@/api/searchService';

export default {
  name: 'GlobalSearch',
  data() {
    return {
      searchQuery: '',
      activeTab: 'all',
      searched: false,
      categories: [
        { name: 'employee', label: '직원' },
        { name: 'approval', label: '결재문서' },
        { name: 'meeting', label: '회의록' },
      ],
      results: [], // For global search results
      approvalResults: [], // For paginated approval results
      approvalCurrentPage: 1,
      approvalTotalItems: 0,
      approvalsPerPage: 10,
    };
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'approval' && this.searched && this.approvalResults.length === 0) {
        this.fetchApprovalResults();
      }
    }
  },
  computed: {
    groupedResults() {
      const groups = {
        '직원': this.getResultsByCategory('employee'),
        '결재문서': this.getResultsByCategory('approval'),
      };
      return Object.fromEntries(Object.entries(groups).filter(([, value]) => value.length > 0));
    }
  },
  methods: {
    async performSearch() {
      this.searched = true;
      this.results = [];
      this.approvalResults = [];
      this.approvalCurrentPage = 1;
      this.approvalTotalItems = 0;

      if (!this.searchQuery) {
        return;
      }

      try {
        // Fetch global results for "All" tab
        const response = await searchService.searchGlobal(this.searchQuery);
        this.results = response.data.data.map(res => {
          if (res.category === 'employee') {
            return {
              id: res.id,
              type: '직원',
              title: res.title,
              department: res.department,
              position: res.position,
              contact: res.contact,
              status: res.status,
              category: 'employee',
              path: `/member/detail/${res.id}`
            };
          } else if (res.category === 'approval') {
            return {
              id: res.id,
              type: '결재문서',
              title: res.title,
              titleName: res.titleName, // Added
              memberName: res.memberName, // Added
              createAt: res.createAt, // Added
              category: 'approval',
              path: `/approval/detail/${res.id}`
            };
          }
          return null;
        }).filter(Boolean);

        // Fetch first page for "Approval" tab
        this.fetchApprovalResults();

      } catch (error) {
        console.error('Error searching:', error);
      }
    },
    async fetchApprovalResults() {
      if (!this.searchQuery) return;
      try {
        const response = await searchService.searchApprovals(
          this.searchQuery,
          this.approvalCurrentPage - 1,
          this.approvalsPerPage
        );
        const pageData = response.data.data;
        this.approvalResults = pageData.content.map(doc => ({
          id: doc.approvalId,
          type: '결재문서',
          title: doc.title,
          titleName: doc.titleName, // Added
          memberName: doc.memberName, // Added
          createAt: doc.createAt, // Added
          category: 'approval',
          path: `/approval/detail/${doc.approvalId}`
        }));
        this.approvalTotalItems = pageData.totalElements;
      } catch (error) {
        console.error('Error fetching approval results:', error);
      }
    },
    handleApprovalPageChange(newPage) {
      this.approvalCurrentPage = newPage;
      this.fetchApprovalResults();
    },
    getResultsByCategory(category) {
      return this.results.filter(result => result.category === category);
    },
    navigateTo(result) {
      this.$router.push(result.path);
    }, // Added comma here
    formatDateTime(dateTimeArray) {
      if (!dateTimeArray || dateTimeArray.length < 5) return '';
      const year = dateTimeArray[0];
      const month = String(dateTimeArray[1]).padStart(2, '0');
      const day = String(dateTimeArray[2]).padStart(2, '0');
      const hour = String(dateTimeArray[3]).padStart(2, '0');
      const minute = String(dateTimeArray[4]).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
  }
};
</script>

<style scoped>
.global-search {

  max-width: 1200px;
  /* Increased max-width for more spacious layout */

  margin: 0 auto;

  padding: 20px;

  font-family: 'Noto Sans KR', sans-serif;

  color: #333;

}



.page-header {



  text-align: left;
  /* Align to top-left */



  margin-bottom: 20px;
  /* Reduced margin */



  padding: 0;
  /* Remove background and padding */



  background-color: transparent;
  /* Remove background */



  box-shadow: none;
  /* Remove shadow */



  border-radius: 0;
}

.header-content h1 {
  font-size: 24px;
  /* Adjusted to match typical page titles */
  font-weight: 600;
  color: #303133;
  /* Darker text for standard title */
  margin-bottom: 5px;
  /* Reduced margin */
}







.header-content p {



  font-size: 14px;
  /* Smaller for subtitle */



  color: #909399;
  /* Lighter text for subtitle */



  margin: 0;



}



.search-section {
  margin-bottom: 40px;
  display: flex;
  gap: 10px;
}

.search-section .el-input {
  flex-grow: 1;
  --el-input-border-radius: 10px;
  --el-input-height: 50px;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-section .el-input__inner {
  padding-left: 15px;
}

.search-section .el-input-group__append {
  display: none;
}

.search-section .el-button {
  padding: 0 25px;
  height: 50px;
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  font-weight: 600;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.search-section .el-button:hover {
  background-color: #66b1ff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}



.search-results {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px; /* Slightly reduced padding for tabs */
}

/* Customizing El-Tabs */
.el-tabs__header {
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.el-tabs__item {
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  padding: 0 15px;
  height: 45px;
  line-height: 45px;
}

.el-tabs__item.is-active {
  color: #409eff;
}

.el-tabs__active-bar {
  background-color: #409eff;
}

.el-tabs__nav-wrap::after {
  height: 0; /* Remove default bottom border */
}



.result-group {

  margin-bottom: 30px;

  border: 1px solid #ebeef5;

  border-radius: 8px;

  overflow: hidden;

}



.group-title {
  font-size: 20px; /* Slightly smaller for better balance */
  font-weight: 700;
  color: #303133;
  padding: 12px 20px; /* Adjusted padding */
  background-color: #fcfdff; /* Lighter background */
  border-bottom: 1px solid #e4e7ed; /* Slightly softer border */
  border-left: 5px solid #409eff; /* Accent border on the left */
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}



.employee-list-header,
.approval-list-header {
  display: flex;
  padding: 15px 20px;
  background-color: #f5f7fa;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.employee-list-row,
.approval-list-row {
  display: flex;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f2f5;
  align-items: center;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  background-color: white;
}

.employee-list-row:last-child,
.approval-list-row:last-child {
  border-bottom: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.employee-list-row:hover,
.approval-list-row:hover {
  background-color: #f9fbfd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
  cursor: pointer;
}

.employee-list-cell,
.approval-list-cell {
  flex: 1;
  text-align: left;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #606266;
}

.employee-list-cell:first-child,
.approval-list-cell:first-child {
  font-weight: 500;
  color: #303133;
}



.view-more-container {

  text-align: center;

  padding: 15px 0;

  background-color: #f9fafb;

  border-top: 1px solid #ebeef5;

}



.view-more-container .el-button {

  color: #409eff;

  font-weight: 600;

}



/* Pagination styling */

.pagination-container {

  margin-top: 30px;

  text-align: center;

}



/* Responsive adjustments */

@media (max-width: 768px) {

  .global-search {

    padding: 10px;

  }



  .page-header {

    margin-bottom: 20px;

  }



  .header-content h1 {

    font-size: 28px;

  }



  .header-content p {

    font-size: 16px;

  }



  .search-section {

    margin-bottom: 20px;

  }



  .search-results {

    padding: 15px;

  }



  .group-title {

    font-size: 20px;

    padding: 10px 15px;

  }



  .employee-list-header,

  .approval-list-header,

  .employee-list-row,

  .approval-list-row {

    flex-wrap: wrap;

    padding: 10px 15px;

  }



  .employee-list-cell,

  .approval-list-cell {

    flex: 1 1 50%;

    text-align: left;

    margin-bottom: 5px;

  }



  .employee-list-cell:nth-child(odd),

  .approval-list-cell:nth-child(odd) {

    padding-right: 10px;

  }



  .employee-list-cell:nth-child(even),

  .approval-list-cell:nth-child(even) {

    padding-left: 10px;

  }

}
</style>