<template>
  <div class="participant-list">
    <div class="header">참가자 ({{ participants.length }})</div>
    <div class="list">
      <div v-for="p in participants" :key="p.sid" class="participant-item">
        <span class="name">{{ p.name }}</span>
        <span v-if="p.isLocal" class="local-tag">(나)</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ParticipantList',
    props: {
      participants: {
        type: Array,
        default: () => []
      }
    },
  }
</script>

<style scoped>
  .participant-list {
    display: flex;
    flex-direction: column;
    border-left: 1px solid #1e1f24;
    background: #141519;
    color: #e5e7eb;
    width: 360px;
  }

  .header {
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    border-bottom: 1px solid #1e1f24;
    font-weight: 600;
  }

  .list {
    flex: 1;
    overflow: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .participant-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #1a1b20;
    border: 1px solid #23242a;
    border-radius: 8px;
  }

  .name {
    font-size: 13px;
  }

  .local-tag {
    font-size: 12px;
    color: #93c5fd;
  }
</style>
