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
        placeholder="직원, 부서, 문서, 공지 등 무엇이든 검색해보세요..."
        prefix-icon="Search"
        clearable
        @keyup.enter="performSearch"
        style="width: 100%;"
      >
        <template #append>
          <el-button @click="performSearch">검색</el-button>
        </template>
      </el-input>
    </div>

    <div class="search-results">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="전체" name="all">
          <div v-if="!searched">
            <el-empty description="검색어를 입력해주세요."></el-empty>
          </div>
          <div v-else-if="results.length === 0">
            <el-empty :description="'\'' + searchQuery + '\'에 대한 검색 결과가 없습니다.'"></el-empty>
          </div>
          <div v-else>
            <div v-for="result in results" :key="result.id" class="result-item">
              <div class="result-header">
                <span class="result-type">{{ result.type }}</span>
                <h3 class="result-title" @click="navigateTo(result)">{{ result.title }}</h3>
              </div>
              <p class="result-snippet" v-html="result.snippet"></p>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane v-for="category in categories" :key="category.name" :label="category.label" :name="category.name">
            <div v-if="!searched">
              <el-empty description="검색어를 입력해주세요."></el-empty>
            </div>
            <div v-else-if="getResultsByCategory(category.name).length === 0">
              <el-empty :description="'\'' + searchQuery + '\'에 대한 ' + category.label + ' 검색 결과가 없습니다.'"></el-empty>
            </div>
            <div v-else>
              <div v-for="result in getResultsByCategory(category.name)" :key="result.id" class="result-item">
                <div class="result-header">
                  <h3 class="result-title" @click="navigateTo(result)">{{ result.title }}</h3>
                </div>
                <p class="result-snippet" v-html="result.snippet"></p>
              </div>
            </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import employeeService from '@/api/employeeService';
export default {
  name: 'GlobalSearch',
  data() {
    return {
      searchQuery: '',
      activeTab: 'all',
      searched: false,
      categories: [
        { name: 'employee', label: '직원' },
        { name: 'organization', label: '조직' },
        { name: 'board', label: '게시판' },
        { name: 'approval', label: '결재' },
      ],
      results: [],
    };
  },
  computed: {
  },
  methods: {
    async performSearch() {
      this.searched = true;
      this.results = [];
      if (!this.searchQuery) {
        return;
      }

      try {
        const response = await employeeService.searchEmployees(this.searchQuery);
        this.results = response.data.data.map(emp => ({
          id: emp.memberId,
          type: '직원',
          title: emp.name,
                    snippet: `${emp.organizationName.join(', ')} - ${emp.titleName.join(', ')}`,          category: 'employee',
          path: `/member/detail/${emp.memberId}`
        }));
      } catch (error) {
        console.error('Error searching employees:', error);
        // You can add user-facing error handling here, like a snackbar notification.
      }
    },
    getResultsByCategory(category) {
      return this.results.filter(result => result.category === category);
    },
    navigateTo(result) {
      this.$router.push(result.path);
    }
  }
};
</script>

<style scoped>
.global-search {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
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

.search-section {
  margin-bottom: 32px;
}

.search-results {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.result-item {
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.result-type {
  background-color: #f0f2f5;
  color: #606266;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  margin-right: 12px;
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  margin: 0;
}

.result-title:hover {
  color: #667eea;
}

.result-snippet {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}
</style>