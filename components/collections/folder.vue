<template>
  <v-row @click="showChildren = !showChildren">
    <v-col>
      <v-row>
      <div class="v-gutter v-layout-item">
          <v-icon v-show="!showChildren">arrow_right</v-icon>
          <v-icon v-show="showChildren">arrow_drop_down</v-icon>
          <v-icon>folder</v-icon>
          <span>{{ folder.name }}</span>
        </div>
        <div class="v-gutter v-layout-item">
          
        </div>
        </v-row>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    folder: Object,
    collectionIndex: Number,
    folderIndex: Number,
  },
  components: {
    request: () => import("./request"),
  },
  data() {
    return {
      showChildren: false,
    }
  },
  methods: {
    selectRequest(request) {
      this.$store.commit("postwoman/selectRequest", { request })
    },
    removeFolder() {
      if (!confirm("Are you sure you want to remove this folder?")) return
      this.$store.commit("postwoman/removeFolder", {
        collectionIndex: this.collectionIndex,
        folderIndex: this.folderIndex,
      })
    },
    editFolder() {
      this.$emit("edit-folder")
    },
  },
}
</script>
