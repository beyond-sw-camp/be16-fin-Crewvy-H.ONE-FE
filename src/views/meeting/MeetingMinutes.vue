<template>
  <div class="meeting-minutes">
    <div class="page-header">
      <div>
        <h1 class="title">{{ meeting.title }}</h1>
        <p class="subtitle">{{ formattedDate }}</p>
      </div>
      <div class="actions">
        <el-button @click="downloadMinutes">
          <el-icon><Download /></el-icon>
          <span>다운로드</span>
        </el-button>
        <!-- <el-button @click="downloadAsPdf">
          <el-icon><Download /></el-icon>
          <span>PDF로 다운로드</span>
        </el-button> -->
        <el-button type="primary">
          <el-icon><Share /></el-icon>
          <span>공유</span>
        </el-button>
      </div>
    </div>

    <el-row :gutter="24">
      <el-col :lg="16" :md="24">
        <el-card class="box-card transcript-card">
          <template #header>
            <div class="card-header">
              <span>전체 스크립트</span>
            </div>
          </template>
          <div class="transcript-body">
            <div v-for="(item, index) in meeting.transcript" :key="index" class="transcript-item" :class="{'highlight': item.highlight}">
              <span class="timestamp">{{ item.time }}</span>
              <p class="transcript-text">{{ item.text }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="8" :md="24">
        <el-card class="box-card summary-card">
          <template #header>
            <div class="card-header">
              <span>회의 요약</span>
            </div>
          </template>
          <div class="summary-body" v-html="formattedSummary"></div>
        </el-card>

        <el-card class="box-card participants-card">
          <template #header>
            <div class="card-header">
              <span>참석자 ({{ meeting.participants.length }})</span>
            </div>
          </template>
          <div class="participants-body">
            <div v-for="(participant, index) in meeting.participants" :key="index" class="participant-item">
              <el-avatar :style="{ backgroundColor: participant.avatarColor, color: '#fff' }">{{ participant.name.charAt(0) }}</el-avatar>
              <div class="participant-info">
                <p class="name">{{ participant.name }}</p>
                <p class="team">{{ participant.team }}</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getVideoConferenceMinutes } from '@/api/videoConference';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
  name: 'MeetingMinutes',
  data() {
    return {
      meeting: {
        title: '',
        actualStartTime: null,
        transcript: [],
        summary: '',
        participants: [
          {
            name: '김민준',
            team: '기획팀',
            avatarColor: '#409EFF',
          },
          {
            name: '이수진',
            team: '인사팀',
            avatarColor: '#67C23A',
          },
          {
            name: '박서준',
            team: '개발팀',
            avatarColor: '#E6A23C',
          },
        ],
      },
    };
  },
  computed: {
    formattedSummary() {
      if (!this.meeting.summary) return '';
      return this.meeting.summary
        .replace(/\*{2}([^*]+)\*{2}/g, '<b>$1</b>')
        .replace(/\n/g, '<br>');
    },
    formattedDate() {
      if (!this.meeting.actualStartTime) return this.meeting.date;
      const date = new Date(this.meeting.actualStartTime);
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      return new Intl.DateTimeFormat('ko-KR', options).format(date);
    },
  },
  async created() {
    const videoConferenceId = this.$route.params.id;
    if (videoConferenceId) {
      try {
        const response = await getVideoConferenceMinutes(videoConferenceId);
        if (response.data && response.data.transcript && response.data.summary) {
          const parsedTranscript = JSON.parse(response.data.transcript);
          this.meeting.transcript = parsedTranscript.map(item => {
            const hours = Math.floor(item.start / 3600);
            const minutes = Math.floor((item.start % 3600) / 60);
            const seconds = Math.floor(item.start % 60);

            let formattedTime = '';
            if (hours > 0) {
              formattedTime += `${hours.toString().padStart(2, '0')}:`;
            }
            formattedTime += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            return {
              time: formattedTime,
              text: item.text,
              highlight: false,
            };
          });

          this.meeting.summary = response.data.summary;
          this.meeting.title = response.data.videoConferenceTitle;
          this.meeting.actualStartTime = response.data.actualStartTime;
        }
      } catch (error) {
        console.error('Failed to fetch meeting minutes:', error);
      }
    }
  },
  methods: {
    downloadMinutes() {
      const { title, transcript, summary } = this.meeting;
      const formattedDate = this.formattedDate;

      let content = `회의 제목: ${title}\n`;
      content += `날짜: ${formattedDate}\n\n`;
      content += `회의 요약:\n${summary}\n\n`;
      content += `전체 스크립트:\n`;

      transcript.forEach(item => {
        content += `[${item.time}] ${item.text}\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}_회의록.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    async downloadAsPdf() {
      const element = this.$el;
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${this.meeting.title}_회의록.pdf`);
    },
  },
};
</script>

<style scoped>
.meeting-minutes {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  font-size: 16px;
  color: #909399;
  margin-top: 8px;
}

.actions .el-button .el-icon {
  margin-right: 8px;
}

.box-card {
  margin-bottom: 24px;
}

.card-header {
  font-size: 18px;
  font-weight: 500;
}

.transcript-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.transcript-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.transcript-item.highlight {
  background-color: #ecf5ff;
  border-left: 4px solid #409EFF;
}

.timestamp {
  font-family: monospace;
  color: #409EFF;
  padding-top: 2px;
}

.transcript-text {
  color: #606266;
  line-height: 1.6;
}

.transcript-item.highlight .transcript-text {
  color: #303133;
}

.summary-list {
  list-style-type: disc;
  padding-left: 20px;
  color: #606266;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.participants-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.participant-info .name {
  font-weight: 500;
  color: #303133;
}

.participant-info .team {
  font-size: 14px;
  color: #909399;
}
</style>
