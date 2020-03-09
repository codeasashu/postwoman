<template>
  <div class="md-layout-item">
    <div class="md-layout-item">
      <div @click="toggleShowChildren" class="md-layout">
        <div class="md-gutter md-layout-item">
          <md-icon v-show="!showChildren">arrow_right</md-icon>
          <md-icon v-show="showChildren">arrow_drop_down</md-icon>
          <md-icon>folder</md-icon>
          <span>{{ collection.name }}</span>
        </div>
        <div class="md-gutter md-layout-item">
          <md-menu
            class="md-layout md-alignment-center-right"
            :mdCloseOnClick="true"
            :mdCloseOnSelect="true"
            md-direction="bottom-start"
            v-tooltip="$t('more')"
          >
            <md-icon md-menu-trigger>more_vert</md-icon>
            <!-- <md-button md-menu-trigger>Bottom Start</md-button> -->

            <md-menu-content>
              <md-menu-item>
                <md-button @click="$emit('add-folder')">
                  <span>{{ $t("new_folder") }}</span>
                </md-button>
              </md-menu-item>
              <md-menu-item>
                <md-button @click="$emit('edit-collection')">
                  <span>{{ $t("edit") }}</span>
                </md-button>
              </md-menu-item>
              <md-menu-item>
                <md-button @click="removeCollection">
                  <span>{{ $t("delete") }}</span>
                </md-button>
              </md-menu-item>
            </md-menu-content>
          </md-menu>
        </div>
      </div>
    </div>

    <div v-show="showChildren">
      <ul>
        <li v-for="(folder, index) in collection.folders" :key="folder.name">
          <folder
            :folder="folder"
            :folderIndex="index"
            :collection-index="collectionIndex"
            @edit-folder="editFolder(collectionIndex, folder, index)"
            @edit-request="$emit('edit-request', $event)"
          />
        </li>
        <li v-if="collection.folders.length === 0 && collection.requests.length === 0">
          <label>{{ $t("collection_empty") }}</label>
        </li>
      </ul>
      <ul>
        <li v-for="(request, index) in collection.requests" :key="index">
          <request
            :request="request"
            :collection-index="collectionIndex"
            :folder-index="-1"
            :request-index="index"
            @edit-request="
              $emit('edit-request', {
                request,
                collectionIndex,
                folderIndex: undefined,
                requestIndex: index,
              })
            "
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
ul {
  display: flex;
  flex-direction: column;
}

ul li {
  display: flex;
  margin-left: 32px;
  border-left: 1px solid var(--brd-color);
}
</style>

<script>
export default {
  components: {
    folder: () => import("./folder"),
    request: () => import("./request"),
  },
  props: {
    collectionIndex: Number,
    collection: Object,
  },
  data() {
    return {
      showChildren: false,
      selectedFolder: {},
    }
  },
  methods: {
    toggleShowChildren() {
      this.showChildren = !this.showChildren
    },
    removeCollection() {
      if (!confirm("Are you sure you want to remove this Collection?")) return
      this.$store.commit("postwoman/removeCollection", {
        collectionIndex: this.collectionIndex,
      })
    },
    editFolder(collectionIndex, folder, folderIndex) {
      this.$emit("edit-folder", { collectionIndex, folder, folderIndex })
    },
  },
}
</script>
