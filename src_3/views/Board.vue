<template>
  <div class="board">
    <div class="page-header">
      <div class="header-content">
        <h1>게시판</h1>
        <p>공지사항, 자료실, 자유게시판 등 다양한 정보를 확인하세요.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openPostCreationModal">
          <el-icon><EditPen /></el-icon>
          <span style="margin-left: 8px;">새 게시글 작성</span>
        </el-button>
      </div>
    </div>

    <el-card shadow="never" class="board-filters">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select v-model="selectedCategory" placeholder="카테고리" clearable style="width: 100%;">
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-col>
        <el-col :span="16">
          <el-input
            v-model="searchQuery"
            placeholder="제목 또는 작성자 검색..."
            clearable
          >
            <template #append>
              <el-button :icon="Search" />
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <el-card shadow="never" class="board-list">
      <el-table :data="filteredPosts" style="width: 100%">
        <el-table-column prop="title" label="제목">
          <template #default="scope">
            <el-button type="text" @click="viewPost(scope.row)">{{ scope.row.title }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="카테고리" width="120">
          <template #default="scope">
            <el-tag size="small">{{ categories.find(c => c.value === scope.row.category)?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="작성자" width="120" />
        <el-table-column prop="date" label="작성일" width="120" />
        <el-table-column prop="views" label="조회수" width="80" />
        <el-table-column prop="comments" label="댓글" width="80" />
      </el-table>
    </el-card>

    <!-- 게시글 작성 모달 -->
    <post-creation-modal
      v-model:visible="showPostCreationModal"
      @submit="handlePostSubmit"
    />
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import PostCreationModal from '@/components/board/PostCreationModal.vue'

export default {
  name: 'BoardPage',
  components: {
    PostCreationModal
  },
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      showPostCreationModal: false,
      categories: [
        { label: '전체', value: '' },
        { label: '공지사항', value: 'notice' },
        { label: '자유게시판', value: 'free' },
        { label: '자료실', value: 'data' }
      ],
      posts: [
        {
          id: 1,
          title: '2024년 하반기 워크샵 안내',
          category: 'notice',
          author: '관리자',
          date: '2024-09-20',
          views: 120,
          comments: 5
        },
        {
          id: 2,
          title: '점심 메뉴 추천 받습니다!',
          category: 'free',
          author: '김철수',
          date: '2024-09-19',
          views: 88,
          comments: 12
        },
        {
          id: 3,
          title: '신규 입사자 교육 자료',
          category: 'data',
          author: '인사팀',
          date: '2024-09-18',
          views: 55,
          comments: 2
        }
      ]
    }
  },
  computed: {
    filteredPosts() {
      let filtered = this.posts
      if (this.selectedCategory) {
        filtered = filtered.filter(post => post.category === this.selectedCategory)
      }
      if (this.searchQuery) {
        filtered = filtered.filter(post => post.title.includes(this.searchQuery) || post.author.includes(this.searchQuery))
      }
      return filtered
    }
  },
  methods: {
    openPostCreationModal() {
      this.showPostCreationModal = true;
    },
    handlePostSubmit(payload) {
      console.log('New Post Submitted:', payload);
      // In a real application, you would send this data to your backend API
      // For now, let's simulate adding it to the posts array
      const newPost = {
        id: this.posts.length + 1,
        title: payload.title,
        category: payload.category,
        author: '현재 사용자', // Replace with actual user data
        date: new Date().toISOString().slice(0, 10),
        views: 0,
        comments: 0,
        // attachments: payload.attachments // Handle attachments as needed
      };
      this.posts.unshift(newPost); // Add to the beginning of the list
      this.success('게시글이 성공적으로 작성되었습니다.');
      this.showPostCreationModal = false;
    },
    viewPost(post) {
      this.info(`${post.title} 게시글을 봅니다.`);
      // In a real application, this would navigate to a post detail page
    }
  }
}
</script>
<style scoped>
.board {
  max-width: 1200px;
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
}

.board-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  background: #4f46e5;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.board-main {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
}

.board-sidebar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: fit-content;
}

.sidebar-section {
  margin-bottom: 24px;
}

.sidebar-section:last-child {
  margin-bottom: 0;
}

.sidebar-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.category-item:hover {
  background-color: #f8f9fa;
}

.category-item.active {
  background-color: #e3f2fd;
  color: #667eea;
}

.category-item .count {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.popular-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.popular-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.post-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.board-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.post-list {
  padding: 0;
}

.post-item {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.post-item:hover {
  background-color: #f8f9fa;
}

.post-item:last-child {
  border-bottom: none;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.post-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.post-date {
  font-size: 12px;
  color: #909399;
}

.post-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-summary {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.post-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}


.pagination {
  padding: 20px 24px;
  display: flex;
  justify-content: center;
}

.post-detail {
  padding: 20px 0;
}

.post-detail .post-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.post-detail .post-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.post-detail .post-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.post-detail .post-content {
  margin-bottom: 24px;
}

.post-detail .post-content p {
  font-size: 16px;
  line-height: 1.6;
  color: #2c3e50;
}

.post-actions {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

.comments-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.comment-list {
  margin-bottom: 20px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 500;
  color: #2c3e50;
}

.comment-date {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.comment-form {
  display: flex;
  gap: 12px;
  align-items: center;
}

.upload-demo {
  width: 100%;
}

.like-icon {
  font-size: 16px;
  color: #ccc;
  transition: color 0.3s ease;
  cursor: pointer;
}

.like-icon.liked {
  color: #e74c3c;
}
</style>
