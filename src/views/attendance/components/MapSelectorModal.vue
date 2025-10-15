<template>
  <el-dialog
    :model-value="visible"
    title="지도에서 위치 선택"
    width="60%"
    @update:model-value="$emit('update:visible', $event)"
    @opened="initMap"
    :destroy-on-close="true"
  >
    <div class="map-search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="장소, 주소 검색"
        @keyup.enter="searchLocation"
        clearable
      >
        <template #append>
          <el-button @click="searchLocation"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
    </div>
    <div id="map-container" style="height: 50vh; width: 100%;"></div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">취소</el-button>
        <el-button type="primary" @click="confirmSelection">
          이 위치로 설정
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
/* global L */
import { useSnackbar } from '@/composables/useSnackbar';

export default {
  name: 'MapSelectorModal',
  props: { /* ... */ },
  emits: ['update:visible', 'location-selected'],
  setup() {
    const { warning } = useSnackbar();
    return { warning };
  },
  data() {
    return {
      map: null,
      marker: null,
      selectedLocation: { /* ... */ },
      searchQuery: '',
    };
  },
  methods: {
    async searchLocation() {
      if (!this.searchQuery.trim()) return;

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.searchQuery)}&format=json&limit=1`);
        if (!response.ok) throw new Error('Search API request failed');
        
        const results = await response.json();
        if (results.length > 0) {
          const { lat, lon } = results[0];
          const newLatLng = L.latLng(parseFloat(lat), parseFloat(lon));
          
          this.map.setView(newLatLng, 16);
          this.marker.setLatLng(newLatLng);
          this.selectedLocation.lat = newLatLng.lat;
          this.selectedLocation.lng = newLatLng.lng;
        } else {
          this.warning('검색 결과가 없습니다.');
        }
      } catch (err) {
        this.warning('위치 검색 중 오류가 발생했습니다.');
      }
    },
    initMap() { /* ... */ },
    confirmSelection() { /* ... */ },
  },
};
</script>

<style scoped>
.map-search-bar {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  z-index: 1000; /* Leaflet UI보다 위에 표시 */
}
</style>
