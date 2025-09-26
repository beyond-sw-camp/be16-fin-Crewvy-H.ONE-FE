<template>
  <div class="board">
    <div class="page-header">
      <div class="header-content">
        <h1>게시판</h1>
        <p>사내 공지사항과 커뮤니케이션을 위한 게시판입니다.</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="writePost">
          <el-icon><Edit /></el-icon>
          <span style="margin-left: 8px;">글쓰기</span>
        </el-button>
        <el-button @click="showCategories = true">
          <el-icon><Setting /></el-icon>
          <span style="margin-left: 8px;">카테고리 관리</span>
        </el-button>
      </div>
    </div>

    <!-- 게시판 통계 -->
    <div class="board-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-title">전체 게시글</div>
          <div class="stat-value">{{ totalPosts }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><View /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-title">오늘 조회수</div>
          <div class="stat-value">{{ todayViews }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-title">댓글 수</div>
          <div class="stat-value">{{ totalComments }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-title">활성 사용자</div>
          <div class="stat-value">{{ activeUsers }}</div>
        </div>
      </div>
    </div>

    <!-- 게시판 메인 -->
    <div class="board-main">
      <div class="board-sidebar">
        <div class="sidebar-section">
          <h3>카테고리</h3>
          <div class="category-list">
            <div 
              class="category-item" 
              v-for="category in categories" 
              :key="category.id"
              :class="{ active: selectedCategory === category.id }"
              @click="selectCategory(category.id)"
            >
              <el-icon><component :is="category.icon" /></el-icon>
              <span>{{ category.name }}</span>
              <span class="count">{{ category.count }}</span>
            </div>
          </div>
        </div>
        
        <div class="sidebar-section">
          <h3>인기 게시글</h3>
          <div class="popular-posts">
            <div class="popular-item" v-for="post in popularPosts" :key="post.id">
              <div class="post-title">{{ post.title }}</div>
              <div class="post-meta">
                <span class="views">{{ post.views }}회</span>
                <span class="date">{{ post.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="board-content">
        <div class="content-header">
          <div class="search-section">
            <el-input
              v-model="searchQuery"
              placeholder="게시글 검색..."
              prefix-icon="Search"
              style="width: 300px"
            />
            <el-select v-model="selectedSort" placeholder="정렬" style="width: 120px">
              <el-option label="최신순" value="latest" />
              <el-option label="조회순" value="views" />
              <el-option label="댓글순" value="comments" />
            </el-select>
          </div>
        </div>

        <div class="post-list">
          <div class="post-item" v-for="post in filteredPosts" :key="post.id" @click="viewPost(post)">
            <div class="post-header">
              <div class="post-title">{{ post.title }}</div>
              <div class="post-meta">
                <el-tag :type="getCategoryType(post.category)" size="small">
                  {{ getCategoryName(post.category) }}
                </el-tag>
                <span class="post-date">{{ post.date }}</span>
              </div>
            </div>
            <div class="post-content">
              <div class="post-summary">{{ post.summary }}</div>
              <div class="post-stats">
                <span class="author">{{ post.author }}</span>
                <span class="views">{{ post.views }}회</span>
                <span class="comments">{{ post.comments }}개</span>
                <span class="likes">{{ post.likes }}개</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="totalPosts"
            layout="prev, pager, next"
          />
        </div>
      </div>
    </div>

    <!-- 게시글 상세 모달 -->
    <el-dialog
      v-model="showPostDetail"
      title="게시글 상세"
      width="800px"
    >
      <div v-if="selectedPost" class="post-detail">
        <div class="post-header">
          <h2>{{ selectedPost.title }}</h2>
          <div class="post-meta">
            <span class="author">{{ selectedPost.author }}</span>
            <span class="date">{{ selectedPost.date }}</span>
            <span class="views">{{ selectedPost.views }}회 조회</span>
          </div>
        </div>
        
        <div class="post-content">
          <p>{{ selectedPost.content }}</p>
        </div>
        
        <div class="post-actions">
          <el-button @click="likePost(selectedPost)">
            <span class="like-icon" :class="{ 'liked': selectedPost.isLiked }" style="margin-right: 6px;">
              ♥
            </span>
            좋아요 {{ selectedPost.likes }}
          </el-button>
          <el-button @click="sharePost(selectedPost)">
            <el-icon style="margin-right: 6px;"><Share /></el-icon>
            공유
          </el-button>
        </div>
        
        <div class="comments-section">
          <h4>댓글 ({{ selectedPost.comments }})</h4>
          <div class="comment-list">
            <div class="comment-item" v-for="comment in selectedPost.commentList" :key="comment.id">
              <el-avatar :src="comment.avatar" :size="32" />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-date">{{ comment.date }}</span>
                </div>
                <div class="comment-text">{{ comment.text }}</div>
              </div>
            </div>
          </div>
          
          <div class="comment-form">
            <el-input
              v-model="newComment"
              placeholder="댓글을 입력하세요..."
              @keyup.enter="addComment"
            />
            <el-button type="primary" @click="addComment">댓글 작성</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 글쓰기 모달 -->
    <el-dialog
      v-model="showWritePost"
      title="글쓰기"
      width="800px"
    >
      <el-form :model="postForm" label-width="80px">
        <el-form-item label="카테고리">
          <el-select v-model="postForm.category" placeholder="카테고리를 선택하세요">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="제목">
          <el-input v-model="postForm.title" placeholder="제목을 입력하세요" />
        </el-form-item>
        <el-form-item label="내용">
          <el-input
            v-model="postForm.content"
            type="textarea"
            placeholder="내용을 입력하세요"
            :rows="10"
          />
        </el-form-item>
        <el-form-item label="첨부파일">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            multiple
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              파일을 드래그하거나 <em>클릭하여 업로드</em>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showWritePost = false">취소</el-button>
        <el-button type="primary" @click="submitPost">등록</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'
import { 
  Edit, 
  Setting, 
  Document, 
  View, 
  ChatDotRound, 
  User, 
  Bell, 
  Briefcase, 
  QuestionFilled, 
  Folder, 
  Search, 
  Delete,
  Share, 
  UploadFilled,
  Star,
  StarFilled,
} from '@element-plus/icons-vue'

export default {
  name: 'BoardPage',
  components: {
    Edit,
    Setting,
    Document,
    View,
    ChatDotRound,
    User,
    Bell,
    Briefcase,
    QuestionFilled,
    Folder,
    Search,
    Delete,
    Share,
    UploadFilled,
    Star,
    StarFilled,
  },
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      searchQuery: '',
      selectedSort: 'latest',
      selectedCategory: '',
      currentPage: 1,
      pageSize: 10,
      showPostDetail: false,
      showWritePost: false,
      showCategories: false,
      selectedPost: null,
      newComment: '',
      postForm: {
        category: '',
        title: '',
        content: ''
      },
      totalPosts: 156,
      todayViews: 1240,
      totalComments: 89,
      activeUsers: 23,
      categories: [
        { id: 1, name: '공지사항', icon: 'Bell', count: 12 },
        { id: 2, name: '자유게시판', icon: 'ChatDotRound', count: 45 },
        { id: 3, name: '업무게시판', icon: 'Briefcase', count: 38 },
        { id: 4, name: 'Q&A', icon: 'QuestionFilled', count: 21 },
        { id: 5, name: '자료실', icon: 'Folder', count: 40 }
      ],
      posts: [
        {
          id: 1,
          title: '2024년 1월 월간 보고서 공지',
          category: 1,
          author: '김철수',
          date: '2024-01-15',
          views: 156,
          comments: 8,
          likes: 12,
          summary: '1월 월간 보고서 작성 관련 공지사항입니다.',
          content: '1월 월간 보고서 작성 관련 공지사항입니다. 모든 팀은 1월 25일까지 보고서를 제출해주시기 바랍니다.',
          isMine: false,
          isLiked: false,
          commentList: [
            {
              id: 1,
              author: '박민수',
              date: '2024-01-15',
              text: '확인했습니다.',
              avatar: 'https://via.placeholder.com/32'
            },
            {
              id: 2,
              author: '이지은',
              date: '2024-01-15',
              text: '네, 알겠습니다.',
              avatar: 'https://via.placeholder.com/32'
            }
          ]
        },
        {
          id: 2,
          title: '새로운 프로젝트 팀 구성 안내',
          category: 1,
          author: '김영희',
          date: '2024-01-14',
          views: 89,
          comments: 5,
          likes: 7,
          summary: '신규 프로젝트 팀 구성 및 역할 분담 안내입니다.',
          content: '신규 프로젝트 팀 구성 및 역할 분담 안내입니다. 각 팀별 역할과 책임을 확인해주시기 바랍니다.',
          isMine: false,
          isLiked: false,
          commentList: []
        },
        {
          id: 3,
          title: '회의실 예약 시스템 사용법',
          category: 2,
          author: '정수진',
          date: '2024-01-13',
          views: 234,
          comments: 12,
          likes: 18,
          summary: '회의실 예약 시스템 사용법에 대한 안내입니다.',
          content: '회의실 예약 시스템 사용법에 대한 안내입니다. 자세한 사용법은 첨부 파일을 참고해주세요.',
          isMine: true,
          isLiked: false,
          commentList: []
        }
      ],
      popularPosts: [
        { id: 1, title: '회의실 예약 시스템 사용법', views: 234, date: '2024-01-13' },
        { id: 2, title: '2024년 1월 월간 보고서 공지', views: 156, date: '2024-01-15' },
        { id: 3, title: '새로운 프로젝트 팀 구성 안내', views: 89, date: '2024-01-14' }
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
        filtered = filtered.filter(post => 
          post.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          post.summary.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      
      return filtered
    }
  },
  methods: {
    selectCategory(categoryId) {
      this.selectedCategory = categoryId === this.selectedCategory ? '' : categoryId
    },
    getCategoryType(categoryId) {
      const categoryMap = {
        1: 'danger',
        2: 'primary',
        3: 'success',
        4: 'warning',
        5: 'info'
      }
      return categoryMap[categoryId] || 'info'
    },
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId)
      return category ? category.name : '기타'
    },
    viewPost(post) {
      this.selectedPost = post
      this.showPostDetail = true
    },
    editPost() {
      this.info('수정')
    },
    deletePost() {
      this.$confirm('정말로 삭제하시겠습니까?', '확인', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.success('삭제되었습니다.')
      })
    },
    likePost(post) {
      if (post.isLiked) {
        post.likes--
        post.isLiked = false
        this.info('좋아요를 취소했습니다.')
      } else {
        post.likes++
        post.isLiked = true
        this.success('좋아요를 눌렀습니다.')
      }
    },
    sharePost() {
      this.info('공유 기능')
    },
    addComment() {
      if (!this.newComment.trim()) return
      
      const comment = {
        id: Date.now(),
        author: '현재 사용자',
        date: new Date().toISOString().slice(0, 10),
        text: this.newComment,
        avatar: 'https://via.placeholder.com/32'
      }
      
      this.selectedPost.commentList.push(comment)
      this.selectedPost.comments++
      this.newComment = ''
    },
    writePost() {
      this.showWritePost = true
    },
    submitPost() {
      this.success('게시글이 등록되었습니다.')
      this.showWritePost = false
      this.postForm = {
        category: '',
        title: '',
        content: ''
      }
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
