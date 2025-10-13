<template>
  <div class="meeting-room">
    <!-- 상단 헤더 -->
    <div class="header">
      <div class="header-left">
        <div class="title">{{ title || '회의실' }}</div>
        <div class="subtitle">참가자 {{ participantCount }}명</div>
      </div>
      <div class="header-right">
        <el-button circle @click="toggleChat" :type="isChatOpen ? 'primary' : 'default'" :icon="icons.ChatDotRound" />
        <el-button circle type="danger" @click="leaveSession" :icon="icons.Close" />
      </div>
    </div>

    <div class="content">
      <!-- 비디오 영역 -->
      <div class="stage">
        <div ref="videoContainer" class="videos"></div>
        <!-- 하단 컨트롤 바 -->
        <div class="controls">
          <el-tooltip content="마이크" placement="top">
            <el-button circle :type="audioEnabled ? 'primary' : 'default'" @click="toggleAudio" :icon="icons.Microphone" />
          </el-tooltip>
          <el-tooltip content="카메라" placement="top">
            <el-button circle :type="videoEnabled ? 'primary' : 'default'" @click="toggleVideo" :icon="icons.VideoCameraFilled" />
          </el-tooltip>
          <el-tooltip content="화면 공유" placement="top">
            <el-button circle :type="screenShareActive ? 'primary' : 'default'" @click="toggleScreenShare" :icon="icons.Monitor" />
          </el-tooltip>
          <el-tooltip content="설정" placement="top">
            <el-button circle :icon="icons.Setting" @click="openSettings" />
          </el-tooltip>
          <el-tooltip content="참가자" placement="top">
            <el-button circle :icon="icons.User" />
          </el-tooltip>
          <el-tooltip content="채팅" placement="top">
            <el-button circle :type="isChatOpen ? 'primary' : 'default'" @click="toggleChat" :icon="icons.ChatDotRound" />
          </el-tooltip>
          <el-tooltip content="나가기" placement="top">
            <el-button circle type="danger" :icon="icons.Phone" @click="leaveSession" />
          </el-tooltip>
        </div>
      </div>

      <!-- 채팅 패널 -->
      <div class="chat" v-show="isChatOpen">
        <div class="chat-header">채팅</div>
        <div class="chat-body" ref="chatBody">
          <div class="msg" v-for="(m, i) in messages" :key="i">
            <div class="author">{{ m.author }}</div>
            <div class="text">{{ m.text }}</div>
            <div class="time">{{ m.time }}</div>
          </div>
        </div>
        <div class="chat-input">
          <el-input v-model="chatText" placeholder="메시지를 입력하세요..." @keyup.enter="sendMessage">
            <template #append>
              <el-button type="primary" @click="sendMessage">전송</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>
  </div>
  </template>

<script>
import { OpenVidu } from 'openvidu-browser'
import * as icons from '@element-plus/icons-vue'

export default {
  name: 'MeetingRoom',
  // 아이콘은 :icon="icons.*"로 직접 참조하므로 컴포넌트 등록 불필요
  data() {
    return {
      ov: null,
      session: null,
      publisher: null,
      screenPublisher: null,
      subscribers: [],
      title: '',
      audioEnabled: true,
      videoEnabled: true,
      screenShareActive: false,
      isChatOpen: true,
      messages: [],
      chatText: '',
      icons,
      userInfo: {
        id: '00000000-0000-007b-0000-00000000007b',
        name: '김민수' // 임시 유저명
      }
    }
  },
  computed: {
    participantCount() {
      return (this.publisher ? 1 : 0) + this.subscribers.length
    }
  },
  mounted() {
    // 기대 쿼리: ?sid=<sessionId>&token=<token>&title=<title>
    const q = new URLSearchParams(window.location.search)
    const sessionId = q.get('sid')
    const token = q.get('token')
    this.title = q.get('title') || ''
    if (!sessionId || !token) {
      this.$message?.error?.('세션 정보가 없습니다.')
      return
    }
    this.join(sessionId, token)
  },
  beforeUnmount() {
    this.leaveSession()
  },
  methods: {
    async join(sessionId, token) {
      this.ov = new OpenVidu()
      this.session = this.ov.initSession()

      // 구독 스트림 생성 시 컨테이너에 즉시 부착
      this.session.on('streamCreated', ({ stream }) => {
        const container = this.$refs.videoContainer
        const subscriber = this.session.subscribe(stream, container, { insertMode: 'APPEND' })
        this.subscribers.push(subscriber)
        subscriber.on('videoElementCreated', (event) => {
          const el = event.element
          if (el) {
            el.setAttribute('playsinline', 'true')
            el.autoplay = true
          }
        })
      })

      this.session.on('streamDestroyed', ({ stream }) => {
        this.subscribers = this.subscribers.filter((s) => s.stream.streamId !== stream.streamId)
      })

      try {
        // 사용자 정보를 포함한 연결
        const userName = `${this.userInfo.id}:${this.userInfo.name}`
        await this.session.connect(token, userName)

        // 퍼블리셔를 컨테이너에 직접 생성해 부착
        const container = this.$refs.videoContainer
        this.publisher = await this.ov.initPublisherAsync(container, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: true
        })

        // 자동재생/인라인 재생 보장
        this.publisher.on('videoElementCreated', (event) => {
          const el = event.element
          if (el) {
            el.muted = true
            el.setAttribute('muted', '')
            el.setAttribute('playsinline', 'true')
            el.autoplay = true
          }
        })

        await this.session.publish(this.publisher)
      } catch (e) {
        this.$message?.error?.('회의 연결에 실패했습니다.')
      }
    },
    leaveSession() {
      try {
        if (this.session) this.session.disconnect()
      } finally {
        this.session = null
        this.publisher = null
        this.screenPublisher = null
        this.subscribers = []
        window.close()
      }
    },
    toggleAudio() {
      if (!this.publisher) return
      this.audioEnabled = !this.audioEnabled
      this.publisher.publishAudio(this.audioEnabled)
    },
    toggleVideo() {
      if (!this.publisher) return
      this.videoEnabled = !this.videoEnabled
      this.publisher.publishVideo(this.videoEnabled)
    },
    async toggleScreenShare() {
      if (!this.session) return
      if (!this.screenShareActive) {
        try {
          this.screenPublisher = await this.ov.initPublisherAsync(undefined, {
            videoSource: 'screen',
            publishAudio: false,
            publishVideo: true,
            mirror: false,
            insertMode: 'APPEND'
          })
          this.screenPublisher.once('videoElementCreated', (e) => {
            const el = e.element
            if (el) {
              el.setAttribute('playsinline', 'true')
              el.autoplay = true
            }
          })
          await this.session.publish(this.screenPublisher)
          const track = this.screenPublisher.stream.getMediaStream().getVideoTracks()[0]
          if (track) {
            track.addEventListener('ended', () => {
              this.stopScreenShare()
            })
          }
          this.screenShareActive = true
        } catch (e) {
          this.$message?.error?.('화면 공유를 시작하지 못했습니다.')
        }
      } else {
        this.stopScreenShare()
      }
    },
    stopScreenShare() {
      if (!this.screenPublisher || !this.session) return
      try {
        this.session.unpublish(this.screenPublisher)
        this.screenPublisher = null
      } finally {
        this.screenShareActive = false
      }
    },
    toggleChat() {
      this.isChatOpen = !this.isChatOpen
      this.$nextTick(() => {
        const el = this.$refs.chatBody
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    sendMessage() {
      const text = (this.chatText || '').trim()
      if (!text) return
      const now = new Date()
      this.messages.push({ author: '나', text, time: now.toTimeString().slice(0, 5) })
      this.chatText = ''
      this.$nextTick(() => {
        const el = this.$refs.chatBody
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    openSettings() {
      this.$message?.info?.('설정은 추후 제공됩니다.')
    }
  }
}
  </script>

<style scoped>
.meeting-room {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f0f10;
}
.header {
  height: 64px;
  padding: 0 16px;
  border-bottom: 1px solid #1e1f24;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1a1b20;
  color: #fff;
}
.header-left .title {
  font-size: 16px;
  font-weight: 600;
}
.header-left .subtitle {
  font-size: 12px;
  color: #bbb;
}
.content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 360px;
  overflow: hidden;
}
.stage {
  position: relative;
  background: #0d0d0e;
}
.videos {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 10px;
  padding: 10px;
}
.videos video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
  border-radius: 8px;
}
.controls {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background: rgba(26, 27, 32, 0.9);
  padding: 10px 12px;
  border-radius: 28px;
  backdrop-filter: saturate(120%) blur(6px);
}
.chat {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #1e1f24;
  background: #141519;
  color: #e5e7eb;
}
.chat-header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #1e1f24;
  font-weight: 600;
}
.chat-body {
  flex: 1;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.msg {
  background: #1a1b20;
  border: 1px solid #23242a;
  border-radius: 8px;
  padding: 8px 10px;
}
.msg .author {
  font-size: 12px;
  color: #93c5fd;
}
.msg .text {
  font-size: 13px;
}
.msg .time {
  font-size: 11px;
  color: #a3a3a3;
  text-align: right;
}
.chat-input {
  padding: 10px;
  border-top: 1px solid #1e1f24;
}
</style>

