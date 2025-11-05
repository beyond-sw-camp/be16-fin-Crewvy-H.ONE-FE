<template>
  <div class="meeting-room">
    <!-- 상단 헤더 -->
    <div class="header">
      <div class="header-left">
        <div class="title">{{ title || '임시 회의' }}</div>
        <div class="subtitle">참가자 {{ participantCount }}명</div>
      </div>
      <div class="header-right">
        <el-button circle @click="toggleParticipantList" :type="isParticipantListOpen ? 'primary' : 'default'" :icon="icons.User" />
        <el-button circle @click="toggleChat" :type="isChatOpen ? 'primary' : 'default'" :icon="icons.ChatDotRound" />
        <el-button circle type="danger" @click="leaveSession" :icon="icons.Close" />
      </div>
    </div>

    <div class="content">
      <!-- 비디오 영역 -->
      <div class="stage">
        <div class="main-video" v-if="mainVideoTrack">
          <video :ref="el => { if (el) mainVideoTrack.attach(el) }" autoplay playsinline
            :muted="mainVideoTrack.isLocal"></video>
          <div class="participant-name">{{ mainVideoTrack.isLocal ? '나' : (mainVideoTrack.participant ?
            mainVideoTrack.participant.identity : '') }}</div>
        </div>
        <div class="screen-share-preview" v-if="screenShareActive && localScreenTrack">
          <video :ref="el => { if (el) localScreenTrack.attach(el) }" autoplay playsinline muted></video>
          <div class="preview-label">내 화면 공유 중</div>
        </div>
        <div class="thumbnail-videos">
          <div v-for="track in thumbnailVideoTracks" :key="track.sid" class="video-item"
            @click="setMainVideoTrack(track)">
            <video :ref="el => { if (el) track.attach(el) }" autoplay playsinline :muted="track.isLocal"></video>
            <div class="participant-name">{{ track.isLocal ? '나' : (track.participant ? track.participant.identity : '')
              }}</div>
          </div>
        </div>
        <!-- 하단 컨트롤 바 -->
        <div class="controls">
          <el-tooltip content="마이크" placement="top">
            <el-button circle :type="audioEnabled ? 'primary' : 'default'" @click="toggleAudio"
              :icon="audioEnabled ? icons.Microphone : icons.Mute" />
          </el-tooltip>
          <el-tooltip content="카메라" placement="top">
            <el-button circle :type="videoEnabled ? 'primary' : 'default'" @click="toggleVideo"
              :icon="videoEnabled ? icons.VideoCameraFilled : icons.VideoPause" />
          </el-tooltip>
          <el-tooltip content="화면 공유" placement="top">
            <el-button circle :type="screenShareActive ? 'primary' : 'default'" @click="toggleScreenShare"
              :icon="screenShareActive ? icons.Monitor : icons.VideoPause" />
          </el-tooltip>
          <el-tooltip content="비밀번호 발급/조회" placement="top">
            <el-button circle :icon="icons.Key" @click="getPassword" />
          </el-tooltip>
          <el-tooltip content="참가자" placement="top">
            <el-button circle :type="isParticipantListOpen ? 'primary' : 'default'" :icon="icons.User" @click="toggleParticipantList" />
          </el-tooltip>
          <el-tooltip content="채팅" placement="top">
            <el-button circle :type="isChatOpen ? 'primary' : 'default'" @click="toggleChat"
              :icon="icons.ChatDotRound" />
          </el-tooltip>
          <el-tooltip content="나가기" placement="top">
            <el-button circle type="danger" :icon="icons.Phone" @click="leaveSession" />
          </el-tooltip>
        </div>
      </div>

      <!-- 참가자 목록 -->
      <ParticipantList v-if="isParticipantListOpen" :participants="allParticipants" />

      <!-- 채팅 패널 -->
      <div class="chat" v-show="isChatOpen">
        <div class="chat-header">채팅</div>
        <div class="chat-body" ref="chatBody">
          <div class="msg" v-for="(m, i) in messages" :key="m.createdAt + i">
            <div class="name">{{ m.name }}</div>
            <div class="content">{{ m.content }}</div>
            <div class="createdAt">{{ m.createdAt }}</div>
          </div>
        </div>
        <div class="chat-input">
          <el-input v-model="chatText" placeholder="메시지를 입력하세요..." @keydown.enter="handleEnter">
            <template #append>
              <el-button type="primary" @click="sendMessage">전송</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 비밀번호 모달 -->
      <el-dialog
        v-model="showPasswordModal"
        title="회의 비밀번호"
        width="400px"
      >
        <p>회의 ID: <strong>{{ meetingCredentials.id }}</strong></p>
        <p>비밀번호: <strong>{{ meetingCredentials.password }}</strong></p>
        <template #footer>
          <el-button @click="copyAllCredentials">모두 복사</el-button>
          <el-button type="primary" @click="showPasswordModal = false">닫기</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>

  import { Room, RoomEvent, Track, TrackEvent, createLocalVideoTrack, createLocalAudioTrack, createLocalScreenTracks } from 'livekit-client'
  import * as icons from '@element-plus/icons-vue'
  import { getChatMessages, sendChatMessage, getVideoConferencePassword } from '@/api/videoConference'
  import ParticipantList from '@/components/meeting/ParticipantList.vue'

  export default {
    name: 'MeetingRoom',
    components: {
      ParticipantList
    },
    // 아이콘은 :icon="icons.*"로 직접 참조하므로 컴포넌트 등록 불필요
    data() {
      return {
        title: '',
        room: null,
        localParticipant: null,
        remoteParticipants: [],
        localVideoTrack: null,
        localAudioTrack: null,
        localScreenTrack: null,
        screenSharePublication: null,
        videoConferenceId: null,
        audioEnabled: true,
        videoEnabled: true,
        screenShareActive: false,
        isChatOpen: true,
        isParticipantListOpen: false,
        messages: [],
        mainVideoTrack: null,
        videoTracks: [],
        chatText: '',
        showPasswordModal: false,
        meetingCredentials: { id: '', password: '' },
        Track,
        icons,
        userInfo: {
          id: localStorage.getItem('memberId'),
          name: localStorage.getItem('userName')
        }
      }
    },
    computed: {
      participantCount() {
        return this.remoteParticipants.length + 1 || 0
      },
      thumbnailVideoTracks() {
        return this.videoTracks.filter(track => track !== this.mainVideoTrack)
      },
      allParticipants() {
        if (!this.localParticipant) return []
        return [this.localParticipant, ...this.remoteParticipants]
      }
    },
    mounted() {
      const q = new URLSearchParams(window.location.search)
      const token = q.get('token')
      this.title = q.get('title') || ''
      this.videoConferenceId = q.get('vcid')
      this.join(this.videoConferenceId, token)
    },
    beforeUnmount() {
      this.leaveSession()
    },
    methods: {
      setMainVideoTrack(track) {
        this.mainVideoTrack = track
      },
      async join(videoConferenceId, token) {
        this.room = new Room()

        this.room.on(RoomEvent.ParticipantConnected, (participant) => {
          this.remoteParticipants.push(participant)
        })
        this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
          this.remoteParticipants = this.remoteParticipants.filter(p => p.identity !== participant.identity)
        })

        this.room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === Track.Kind.Video || track.kind === Track.Kind.ScreenShare) {
            this.videoTracks.push(track)
          }
        })

        this.room.on(RoomEvent.TrackUnsubscribed, (track) => {
          if (track.kind === Track.Kind.Video || track.kind === Track.Kind.ScreenShare) {
            this.videoTracks = this.videoTracks.filter(t => t.sid !== track.sid)
          }
        })

        this.room.on(RoomEvent.DataReceived, (payload) => {
          const decoder = new TextDecoder()
          const chatData = JSON.parse(decoder.decode(payload))
          const now = new Date()
          const isMe = chatData.senderId === this.userInfo.id
          this.messages.push({
            name: isMe ? '나' : chatData.name,
            content: chatData.content,
            createdAt: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
          })
          this.$nextTick(() => {
            const el = this.$refs.chatBody
            if (el) el.scrollTop = el.scrollHeight
          })
        })

        try {
          await this.room.connect(process.env.VUE_APP_LIVEKIT_URL, token).then(() => {
            this.remoteParticipants = [...this.room.remoteParticipants.values()]
          })
          this.localParticipant = this.room.localParticipant

          // Publish local tracks
          this.localAudioTrack = await createLocalAudioTrack()
          await this.localParticipant.publishTrack(this.localAudioTrack)

          this.localVideoTrack = await createLocalVideoTrack()
          await this.localParticipant.publishTrack(this.localVideoTrack)
          this.videoTracks.push(this.localVideoTrack)
          this.setMainVideoTrack(this.localVideoTrack) // 내 비디오를 메인으로 설정

          if (this.videoConferenceId) {
            getChatMessages(this.videoConferenceId)
              .then((messages) => {
                this.messages = messages
                  .map(m => ({ ...m, createdAt: new Date(m.createdAt) }))
                  .sort((a, b) => a.createdAt - b.createdAt)
                  .map(m => ({ ...m, createdAt: m.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }) }));
              })
              .catch((err) => {
                console.error('채팅 기록을 불러오는데 실패했습니다.', err)
                this.$message?.error?.('채팅 기록을 불러오지 못했습니다.')
              })
          }
        } catch (e) {
          this.$message?.error?.('회의 연결에 실패했습니다.')
          console.error(e)
        }
      },
      leaveSession() {
        try {
          if (this.room) {
            this.room.disconnect()
          }
        }
        finally {
          this.room = null
          this.localParticipant = null
          this.remoteParticipants = []
          this.videoTracks = []
          this.localVideoTrack = null
          this.localAudioTrack = null
          this.screenSharePublication = null
          window.close()
        }
      },
      toggleAudio() {
        if (!this.localAudioTrack) return
        this.audioEnabled = !this.audioEnabled
        if (this.audioEnabled) {
          this.localAudioTrack.unmute()
        } else {
          this.localAudioTrack.mute()
        }
      },
      toggleVideo() {
        if (!this.localVideoTrack) return
        this.videoEnabled = !this.videoEnabled
        if (this.videoEnabled) {
          this.localVideoTrack.unmute()
        } else {
          this.localVideoTrack.mute()
        }
      },
      async toggleScreenShare() {
        if (!this.room || !this.localParticipant) return
        if (!this.screenShareActive) {
          try {
            const screenTracks = await createLocalScreenTracks({ audio: true })
            this.screenSharePublication = await this.localParticipant.publishTrack(screenTracks[0])
            this.localScreenTrack = screenTracks[0];
            if (screenTracks.length > 1) {
              await this.localParticipant.publishTrack(screenTracks[1])
            }
            screenTracks[0].on(TrackEvent.Ended, () => {
              this.stopScreenShare()
            })
            this.screenShareActive = true
          } catch (e) {
            if (e.name === 'NotAllowedError') {
              console.log('Screen share cancelled by user');
            } else {
              this.$message?.error?.('화면 공유를 시작하지 못했습니다.');
              console.error(e);
            }
          }
        } else {
          this.stopScreenShare()
        }
      },
      async stopScreenShare() {
        if (!this.room || !this.localParticipant || !this.screenSharePublication) return
        try {
          await this.localParticipant.unpublishTrack(this.screenSharePublication.track)
          this.screenSharePublication = null
          this.localScreenTrack = null;
        } finally {
          this.screenShareActive = false
        }
      },
      toggleParticipantList() {
        this.isParticipantListOpen = !this.isParticipantListOpen
        if (this.isParticipantListOpen) {
          this.isChatOpen = false
        }
      },
      toggleChat() {
        this.isChatOpen = !this.isChatOpen
        if (this.isChatOpen) {
          this.isParticipantListOpen = false
        }
        this.$nextTick(() => {
          const el = this.$refs.chatBody
          if (el) el.scrollTop = el.scrollHeight
        })
      },
      handleEnter(e) {
        if (e.isComposing) return;
        this.sendMessage();
      },
      async sendMessage() {
        const text = (this.chatText || '').trim()
        if (!text) return

        if (!this.room || !this.localParticipant) {
          this.$message?.error?.('회의에 연결되지 않아 메시지를 전송할 수 없습니다.');
          return;
        }

        const message = {
          senderId: this.userInfo.id,
          name: this.userInfo.name,
          content: text
        };

        try {
          // const encoder = new TextEncoder()
          // await this.localParticipant.publishData(encoder.encode(JSON.stringify(message)), 0)

          // Persist message
          if (this.videoConferenceId) {
            await sendChatMessage(this.videoConferenceId, message)
          }

          this.chatText = ''
        } catch (error) {
          this.message?.error?.('메시지 전송에 실패했습니다.');
          console.error(error)
        }
      },
      openSettings() {
        this.$message?.info?.('설정은 추후 제공됩니다.')
      },
      async getPassword() {
        if (!this.videoConferenceId) {
          this.$message?.error?.('회의 ID를 찾을 수 없습니다.');
          return;
        }
        try {
          const res = await getVideoConferencePassword(this.videoConferenceId);
          this.meetingCredentials = res;
          this.showPasswordModal = true;
        } catch (error) {
          this.$message?.error?.('비밀번호를 가져오는데 실패했습니다.');
          console.error(error);
        }
      },
      async copyAllCredentials() {
        const textToCopy = `회의 ID: ${this.meetingCredentials.id}\n비밀번호: ${this.meetingCredentials.password}`;
        if (!this.meetingCredentials.id || !this.meetingCredentials.password) {
          this.$message?.error?.('ID 또는 비밀번호를 찾을 수 없습니다.');
          return;
        }
        try {
          await navigator.clipboard.writeText(textToCopy);
          this.$message?.success?.('ID와 비밀번호가 클립보드에 복사되었습니다.');
        } catch (err) {
          this.$message?.error?.('ID와 비밀번호 복사에 실패했습니다.');
          console.error('Failed to copy: ', err);
        }
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
    grid-template-columns: 1fr auto;
    overflow: hidden;
  }

  .stage {
    position: relative;
    background: #0d0d0e;
    display: flex;
    flex-direction: column;
  }

  .main-video {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    overflow: hidden;
  }

  .main-video video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    /* contain으로 변경하여 전체 비디오가 보이도록 함 */
    background: #000;
    border-radius: 8px;
  }

  .thumbnail-videos {
    display: flex;
    gap: 10px;
    padding: 10px;
    overflow-x: auto;
    background: rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
  }

  .video-item {
    position: relative;
    width: 240px;
    /* 썸네일 너비 고정 */
    height: 135px;
    /* 16:9 비율 */
    flex-shrink: 0;
  }

  .video-item video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000;
    border-radius: 8px;
  }

  .participant-name {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .screen-share-preview {
    position: absolute;
    bottom: 80px; /* 컨트롤 바 위에 위치 */
    right: 20px;
    width: 240px;
    height: 135px;
    border: 2px solid #4f46e5;
    border-radius: 8px;
    overflow: hidden;
    background: #000;
    z-index: 100;
  }

  .screen-share-preview video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .preview-label {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 4px;
    text-align: center;
    font-size: 12px;
  }

  .controls {
    position: fixed;
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
    width: 360px;
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

  .msg .name {
    font-size: 12px;
    color: #93c5fd;
  }

  .msg .content {
    font-size: 13px;
  }

  .msg .createdAt {
    font-size: 11px;
    color: #a3a3a3;
    text-align: right;
  }

  .chat-input {
    padding: 10px;
    border-top: 1px solid #1e1f24;
  }
</style>
