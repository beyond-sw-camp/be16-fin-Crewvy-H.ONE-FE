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
          <div v-else-if="filteredResults.length === 0">
            <el-empty :description="'\'' + searchQuery + '\'에 대한 검색 결과가 없습니다.'"></el-empty>
          </div>
          <div v-else>
            <div v-for="result in filteredResults" :key="result.id" class="result-item">
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
      results: [
        { id: 1, type: '직원', title: '김철수', snippet: '개발팀 팀장. <strong>검색</strong> 관련 프로젝트 담당.', category: 'employee', path: '/employee/1' },
        { id: 2, type: '조직', title: '개발팀', snippet: 'H.ONE의 핵심 기술 개발을 담당하는 부서. 현재 <strong>검색</strong> 엔진 고도화 작업 진행 중.', category: 'organization', path: '/organization/dev' },
        { id: 3, type: '게시판', title: '[공지] 2025년 하반기 정기 보안 업데이트 안내', snippet: '전사 시스템에 대한 보안 업데이트가 예정되어 있습니다. <strong>검색</strong> 기능 개선 포함.', category: 'board', path: '/board/notice/1' },
        { id: 4, type: '결재', title: '통합 검색 기능 개발 기획안', snippet: '사용자 경험 개선을 위한 통합 <strong>검색</strong> 기능 도입 기획안입니다.', category: 'approval', path: '/approval/doc/123' },
        { id: 5, type: '직원', title: '박민수', snippet: '개발팀 주임. <strong>검색</strong> 성능 최적화 담당.', category: 'employee', path: '/employee/2' },
      ],
    };
  },
  computed: {
    filteredResults() {
      if (!this.searchQuery) return [];
      return this.results.filter(result => 
        result.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        result.snippet.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  },
  methods: {
    performSearch() {
      this.searched = true;
      // 실제 검색 로직은 여기에 구현합니다.
      // 지금은 더미 데이터를 필터링하는 것으로 대체합니다.
    },
    getResultsByCategory(category) {
      return this.filteredResults.filter(result => result.category === category);
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