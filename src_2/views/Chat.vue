<template>
  <div class="chat">
    <div class="chat-container">
      <!-- 채팅 목록 사이드바 -->
      <div class="chat-sidebar">
        <div class="sidebar-header">
          <h3>채팅</h3>
          <el-button type="primary" size="small" @click="showNewChat = true">
            <el-icon><Plus /></el-icon>
            <span style="margin-left: 8px;">새 채팅</span>
          </el-button>
        </div>
        
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="채팅 검색..."
            prefix-icon="Search"
            size="small"
          />
        </div>
        
        <div class="chat-list">
          <div 
            class="chat-item" 
            v-for="chat in filteredChats" 
            :key="chat.id"
            :class="{ active: selectedChat?.id === chat.id }"
            @click="selectChat(chat)"
          >
            <el-avatar :src="chat.avatar" :size="40" />
            <div class="chat-info">
              <div class="chat-name">{{ chat.name }}</div>
              <div class="chat-preview">{{ chat.lastMessage }}</div>
            </div>
            <div class="chat-meta">
              <div class="chat-time">{{ chat.lastTime }}</div>
              <el-badge :value="chat.unreadCount" v-if="chat.unreadCount > 0" />
            </div>
          </div>
        </div>
      </div>

      <!-- 채팅 메인 영역 -->
      <div class="chat-main">
        <div v-if="selectedChat" class="chat-window">
          <!-- 채팅 헤더 -->
          <div class="chat-header">
            <div class="header-info">
              <el-avatar :src="selectedChat.avatar" :size="32" />
              <div class="user-info">
                <div class="user-name">{{ selectedChat.name }}</div>
                <div class="user-status" :class="selectedChat.status">
                  {{ selectedChat.status === 'online' ? '온라인' : '오프라인' }}
                </div>
              </div>
            </div>
            <div class="header-actions">
              <el-button type="text" @click="startVideoCall">
                <el-icon><VideoCamera /></el-icon>
              </el-button>
              <el-button type="text" @click="startVoiceCall">
                <el-icon><Phone /></el-icon>
              </el-button>
              <el-button type="text" @click="showChatInfo = true">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
            </div>
          </div>

          <!-- 메시지 영역 -->
          <div class="messages-container" ref="messagesContainer">
            <div class="messages">
              <div 
                class="message" 
                v-for="message in selectedChat.messages" 
                :key="message.id"
                :class="{ 'own-message': message.isOwn }"
              >
                <el-avatar 
                  v-if="!message.isOwn" 
                  :src="selectedChat.avatar" 
                  :size="32" 
                  class="message-avatar"
                />
                <div class="message-content">
                  <div class="message-bubble">
                    <div class="message-text">{{ message.text }}</div>
                    <div class="message-time">{{ message.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 메시지 입력 -->
          <div class="message-input">
            <div class="input-actions">
              <el-button type="text" @click="attachFile">
                <el-icon><Paperclip /></el-icon>
              </el-button>
              <el-button type="text" @click="sendEmoji">
                <el-icon><Smile /></el-icon>
              </el-button>
            </div>
            <el-input
              v-model="newMessage"
              placeholder="메시지를 입력하세요..."
              @keyup.enter="sendMessage"
              class="message-textarea"
            />
            <el-button type="primary" @click="sendMessage" :disabled="!newMessage.trim()">
              <el-icon><Position /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 채팅 선택 안내 -->
        <div v-else class="chat-placeholder">
          <div class="placeholder-content">
            <el-icon class="placeholder-icon"><ChatDotRound /></el-icon>
            <h3>채팅을 선택하세요</h3>
            <p>좌측에서 대화를 선택하여 시작하세요.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 새 채팅 모달 -->
    <el-dialog
      v-model="showNewChat"
      title="새 채팅 시작"
      width="500px"
    >
      <div class="new-chat-content">
        <el-input
          v-model="newChatQuery"
          placeholder="직원명으로 검색..."
          prefix-icon="Search"
          class="search-input"
        />
        <div class="employee-list">
          <div 
            class="employee-item" 
            v-for="employee in filteredEmployees" 
            :key="employee.id"
            @click="startNewChat(employee)"
          >
            <el-avatar :src="employee.avatar" :size="40" />
            <div class="employee-info">
              <div class="employee-name">{{ employee.name }}</div>
              <div class="employee-position">{{ employee.position }} • {{ employee.department }}</div>
            </div>
            <el-tag :type="employee.status === 'online' ? 'success' : 'info'" size="small">
              {{ employee.status === 'online' ? '온라인' : '오프라인' }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 채팅 정보 모달 -->
    <el-dialog
      v-model="showChatInfo"
      title="채팅 정보"
      width="400px"
    >
      <div v-if="selectedChat" class="chat-info">
        <div class="info-header">
          <el-avatar :src="selectedChat.avatar" :size="60" />
          <div class="info-details">
            <h3>{{ selectedChat.name }}</h3>
            <p>{{ selectedChat.position }} • {{ selectedChat.department }}</p>
            <el-tag :type="selectedChat.status === 'online' ? 'success' : 'info'">
              {{ selectedChat.status === 'online' ? '온라인' : '오프라인' }}
            </el-tag>
          </div>
        </div>
        
        <div class="info-stats">
          <div class="stat-item">
            <span class="label">총 메시지</span>
            <span class="value">{{ selectedChat.messages.length }}개</span>
          </div>
          <div class="stat-item">
            <span class="label">마지막 활동</span>
            <span class="value">{{ selectedChat.lastActivity }}</span>
          </div>
        </div>
        
        <div class="info-actions">
          <el-button @click="clearChat">대화 삭제</el-button>
          <el-button type="danger" @click="blockUser">차단</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { useSnackbar } from '@/composables/useSnackbar'

export default {
  name: 'ChatPage',
  setup() {
    const { success, error, warning, info } = useSnackbar()
    return { success, error, warning, info }
  },
  data() {
    return {
      searchQuery: '',
      newChatQuery: '',
      selectedChat: null,
      newMessage: '',
      showNewChat: false,
      showChatInfo: false,
      chats: [
        {
          id: 1,
          name: '김영희',
          position: '팀장',
          department: '디자인팀',
          status: 'online',
          avatar: 'https://via.placeholder.com/40',
          lastMessage: '회의 자료 확인했습니다.',
          lastTime: '10분 전',
          lastActivity: '2시간 전',
          unreadCount: 2,
          messages: [
            {
              id: 1,
              text: '안녕하세요!',
              time: '09:30',
              isOwn: false
            },
            {
              id: 2,
              text: '안녕하세요! 오늘 회의 준비는 어떻게 되고 있나요?',
              time: '09:31',
              isOwn: true
            },
            {
              id: 3,
              text: '회의 자료 확인했습니다. 프레젠테이션 준비 완료입니다.',
              time: '10:15',
              isOwn: false
            }
          ]
        },
        {
          id: 2,
          name: '박민수',
          position: '주임',
          department: '개발팀',
          status: 'online',
          avatar: 'https://via.placeholder.com/40',
          lastMessage: '프로젝트 진행상황 공유드립니다.',
          lastTime: '30분 전',
          lastActivity: '1시간 전',
          unreadCount: 0,
          messages: [
            {
              id: 1,
              text: '프로젝트 진행상황 공유드립니다.',
              time: '14:30',
              isOwn: false
            },
            {
              id: 2,
              text: '네, 확인했습니다. 좋은 진행이네요!',
              time: '14:35',
              isOwn: true
            }
          ]
        },
        {
          id: 3,
          name: '이지은',
          position: '대리',
          department: '개발팀',
          status: 'offline',
          avatar: 'https://via.placeholder.com/40',
          lastMessage: '내일 미팅 시간 조정 가능한지요?',
          lastTime: '1시간 전',
          lastActivity: '3시간 전',
          unreadCount: 1,
          messages: [
            {
              id: 1,
              text: '내일 미팅 시간 조정 가능한지요?',
              time: '13:45',
              isOwn: false
            }
          ]
        }
      ],
      employees: [
        {
          id: 1,
          name: '김철수',
          position: '팀장',
          department: '개발팀',
          status: 'online',
          avatar: 'https://via.placeholder.com/40'
        },
        {
          id: 2,
          name: '정수진',
          position: '주임',
          department: '디자인팀',
          status: 'online',
          avatar: 'https://via.placeholder.com/40'
        },
        {
          id: 3,
          name: '최민호',
          position: '팀장',
          department: '마케팅팀',
          status: 'offline',
          avatar: 'https://via.placeholder.com/40'
        }
      ]
    }
  },
  computed: {
    filteredChats() {
      if (!this.searchQuery) return this.chats
      return this.chats.filter(chat => 
        chat.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
    filteredEmployees() {
      if (!this.newChatQuery) return this.employees
      return this.employees.filter(employee => 
        employee.name.toLowerCase().includes(this.newChatQuery.toLowerCase())
      )
    }
  },
  methods: {
    selectChat(chat) {
      this.selectedChat = chat
      chat.unreadCount = 0
    },
    sendMessage() {
      if (!this.newMessage.trim() || !this.selectedChat) return
      
      const message = {
        id: Date.now(),
        text: this.newMessage,
        time: new Date().toTimeString().slice(0, 5),
        isOwn: true
      }
      
      this.selectedChat.messages.push(message)
      this.selectedChat.lastMessage = this.newMessage
      this.selectedChat.lastTime = '방금 전'
      this.newMessage = ''
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    startNewChat(employee) {
      const newChat = {
        id: Date.now(),
        name: employee.name,
        position: employee.position,
        department: employee.department,
        status: employee.status,
        avatar: employee.avatar,
        lastMessage: '',
        lastTime: '',
        lastActivity: '방금 전',
        unreadCount: 0,
        messages: []
      }
      
      this.chats.unshift(newChat)
      this.selectedChat = newChat
      this.showNewChat = false
      this.newChatQuery = ''
    },
    startVideoCall() {
      this.info('화상 통화를 시작합니다.')
    },
    startVoiceCall() {
      this.info('음성 통화를 시작합니다.')
    },
    attachFile() {
      this.info('파일 첨부 기능')
    },
    sendEmoji() {
      this.info('이모지 선택')
    },
    clearChat() {
      this.$confirm('정말로 대화를 삭제하시겠습니까?', '확인', {
        confirmButtonText: '삭제',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.selectedChat.messages = []
        this.success('대화가 삭제되었습니다.')
        this.showChatInfo = false
      })
    },
    blockUser() {
      this.$confirm('정말로 이 사용자를 차단하시겠습니까?', '확인', {
        confirmButtonText: '차단',
        cancelButtonText: '취소',
        type: 'warning'
      }).then(() => {
        this.success('사용자가 차단되었습니다.')
        this.showChatInfo = false
      })
    }
  }
}
</script>

<style scoped>
.chat {
  height: calc(100vh - 64px);
  background: #f5f7fa;
}

.chat-container {
  display: flex;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-sidebar {
  width: 300px;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.search-box {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #f0f0f0;
}

.chat-item:hover {
  background-color: #f8f9fa;
}

.chat-item.active {
  background-color: #e3f2fd;
  border-left: 3px solid #667eea;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
}

.chat-preview {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.chat-time {
  font-size: 12px;
  color: #909399;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
}

.user-status {
  font-size: 12px;
}

.user-status.online {
  color: #67c23a;
}

.user-status.offline {
  color: #909399;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message.own-message {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  background: white;
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message.own-message .message-bubble {
  background: #667eea;
  color: white;
}

.message-text {
  margin-bottom: 4px;
  line-height: 1.4;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.message-input {
  padding: 16px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
}

.input-actions {
  display: flex;
  gap: 4px;
}

.message-textarea {
  flex: 1;
}

.chat-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
}

.placeholder-content {
  text-align: center;
  color: #909399;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.placeholder-content h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #606266;
}

.new-chat-content {
  max-height: 400px;
}

.search-input {
  margin-bottom: 16px;
}

.employee-list {
  max-height: 300px;
  overflow-y: auto;
}

.employee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.employee-item:hover {
  background-color: #f8f9fa;
}

.employee-info {
  flex: 1;
}

.employee-name {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 2px;
}

.employee-position {
  font-size: 12px;
  color: #606266;
}

.chat-info {
  padding: 20px 0;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.info-details h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.info-details p {
  color: #606266;
  margin-bottom: 8px;
}

.info-stats {
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item .label {
  color: #606266;
}

.stat-item .value {
  color: #2c3e50;
  font-weight: 500;
}

.info-actions {
  display: flex;
  gap: 12px;
}
</style>
