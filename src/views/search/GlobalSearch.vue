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
            <div v-for="(group, category) in groupedResults" :key="category" class="result-group">
              <h2 class="group-title">{{ category }}</h2>
              <template v-if="category === '직원'">
                <div class="employee-list-header">
                  <div class="employee-list-cell">이름</div>
                  <div class="employee-list-cell">부서</div>
                  <div class="employee-list-cell">직책</div>
                  <div class="employee-list-cell">연락처</div>
                  <div class="employee-list-cell">상태</div>
                </div>
                <div v-for="result in group.slice(0, 5)" :key="result.id" class="employee-list-row" @click="navigateTo(result)">
                  <div class="employee-list-cell">{{ result.title }}</div>
                  <div class="employee-list-cell">{{ result.department }}</div>
                  <div class="employee-list-cell">{{ result.position }}</div>
                  <div class="employee-list-cell">{{ result.contact }}</div>
                  <div class="employee-list-cell">{{ result.status }}</div>
                </div>
                <div v-if="group.length > 5" class="view-more-container">
                  <el-button type="text" @click="activeTab = 'employee'">직원 더보기 ({{ group.length - 5 }}개)</el-button>
                </div>
              </template>
              <template v-else>
                <div v-for="result in group.slice(0, 5)" :key="result.id" class="result-item">
                  <div class="result-header">
                    <h3 class="result-title" @click="navigateTo(result)">{{ result.title }}</h3>
                  </div>
                  <p class="result-snippet" v-html="result.snippet"></p>
                </div>
                <div v-if="group.length > 5" class="view-more-container">
                  <el-button type="text" @click="activeTab = categories.find(c => c.label === category).name">{{ category }} 더보기 ({{ group.length - 5 }}개)</el-button>
                </div>
              </template>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="직원" name="employee">
          <div v-if="!searched">
            <el-empty description="검색어를 입력해주세요."></el-empty>
          </div>
          <div v-else-if="getResultsByCategory('employee').length === 0">
            <el-empty :description="'\'' + searchQuery + '\'에 대한 직원 검색 결과가 없습니다.'"></el-empty>
          </div>
          <div v-else>
            <div class="employee-list-header">
              <div class="employee-list-cell">이름</div>
              <div class="employee-list-cell">부서</div>
              <div class="employee-list-cell">직책</div>
              <div class="employee-list-cell">연락처</div>
              <div class="employee-list-cell">상태</div>
            </div>
            <div v-for="result in getResultsByCategory('employee')" :key="result.id" class="employee-list-row" @click="navigateTo(result)">
              <div class="employee-list-cell">{{ result.title }}</div>
              <div class="employee-list-cell">{{ result.department }}</div>
              <div class="employee-list-cell">{{ result.position }}</div>
              <div class="employee-list-cell">{{ result.contact }}</div>
              <div class="employee-list-cell">{{ result.status }}</div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane v-for="category in categories.filter(c => c.name !== 'employee')" :key="category.name" :label="category.label" :name="category.name">
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
      results: [],
    };
  },
  created() {
  },
  computed: {
    groupedResults() {
      return this.results.reduce((groups, result) => {
        const category = result.type;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(result);
        return groups;
      }, {});
    }
  },
  methods: {
    async performSearch() {
      this.searched = true;
      this.results = [];
      if (!this.searchQuery) {
        return;
      }

      try {
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
              snippet: `${res.department} / ${res.position} / ${res.contact} / ${res.status}`,
              category: 'employee',
              path: `/member/detail/${res.id}`
            };
          } 
          return null;
        }).filter(Boolean);

      } catch (error) {
        console.error('Error searching:', error);
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

.result-group {
  margin-bottom: 24px;
}

.group-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 2px solid #eee;
  margin-bottom: 16px;
}

.employee-list-header,
.employee-list-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.employee-list-header {
  font-weight: 600;
  background-color: #f5f7fa;
  border-top: 1px solid #f0f0f0;
}

.employee-list-row:hover {
  background-color: #f9f9f9;
  cursor: pointer;
}

.employee-list-cell {
  flex: 1;
  text-align: center;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.organization-list-header,
.organization-list-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.organization-list-header {
  font-weight: 600;
  background-color: #f5f7fa;
  border-top: 1px solid #f0f0f0;
}

.organization-list-row:hover {
  background-color: #f9f9f9;
  cursor: pointer;
}

.organization-list-cell {
  flex: 1;
  text-align: center;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-more-container {
  text-align: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}</style>