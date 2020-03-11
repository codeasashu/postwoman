<template>
<div>
  <v-row @click="showChildren = !showChildren">
      <v-col>
        <div class="v-gutter v-layout-item">
          <v-icon v-show="!showChildren">arrow_right</v-icon>
          <v-icon v-show="showChildren">arrow_drop_down</v-icon>
          <v-icon>folder</v-icon>
          <span>{{ collection.name }}</span>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: {
    collectionIndex: Number,
    collection: Object,
  },
  data() {
    return {
      showChildren: false,
      selectedFolder: {},
    }
  }
}
</script>
