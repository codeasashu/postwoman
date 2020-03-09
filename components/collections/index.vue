<!--
TODO:
    - probably refactor and pass event arguments to modals directly without unpacking
-->

<template>
  <div class="md-layout" :label="$t('collections')" ref="collections">
    <addCollection :show="showModalAdd" @hide-modal="displayModalAdd(false)" />
    <editCollection
      :show="showModalEdit"
      :editingCollection="editingCollection"
      :editingCollectionIndex="editingCollectionIndex"
      @hide-modal="displayModalEdit(false)"
    />
    <addFolder
      :show="showModalAddFolder"
      :collection="editingCollection"
      :collectionIndex="editingCollectionIndex"
      @hide-modal="displayModalAddFolder(false)"
    />
    <editFolder
      :show="showModalEditFolder"
      :collection="editingCollection"
      :collectionIndex="editingCollectionIndex"
      :folder="editingFolder"
      :folderIndex="editingFolderIndex"
      @hide-modal="displayModalEditFolder(false)"
    />
    <editRequest
      :show="showModalEditRequest"
      :collectionIndex="editingCollectionIndex"
      :folderIndex="editingFolderIndex"
      :request="editingRequest"
      :requestIndex="editingRequestIndex"
      @hide-modal="displayModalEditRequest(false)"
    />
    <importExportCollections
      :show="showModalImportExport"
      @hide-modal="displayModalImportExport(false)"
    />

    <div class="md-layout-item md-size-100">
      <div class="collection-header md-layout">
        <div class="md-layout md-gutter">
          <div class="md-layout-item md-size-50 center">
            <md-button
              class="md-dense md-raised md-primary md-layout-item md-alignment-center-right"
              @click="displayModalAdd(true)"
            >
              <span>{{ $t("create_collection") }}</span>
            </md-button>
          </div>
          <div class="md-layout-item md-size-50 center">
            <md-button
              class="md-dense md-raised md-primary md-layout-item md-alignment-center-right"
              @click="displayModalImportExport(true)"
            >
              <span>{{ $t("import_export") }}</span>
            </md-button>
          </div>
        </div>
      </div>
      <md-divider></md-divider>
    </div>

    <virtual-list
      class="virtual-list md-layout-item md-size-100"
      :class="{ filled: collections.length }"
      :size="152"
      :remain="Math.min(5, collections.length)"
    >
      <md-list>
        <md-list-item
          class="bordered-bottom"
          v-for="(collection, index) in collections"
          :key="collection.name"
        >
          <div class="md-layout md-size-100">
            <collection
              :collection-index="index"
              :collection="collection"
              @edit-collection="editCollection(collection, index)"
              @add-folder="addFolder(collection, index)"
              @edit-folder="editFolder($event)"
              @edit-request="editRequest($event)"
            />
          </div>
        </md-list-item>
        <md-list-item v-if="collections.length === 0">
          <label>Collections are empty</label>
        </md-list-item>
      </md-list>
    </virtual-list>
    <!-- <nuxt-link :to="localePath('doc')" :aria-label="$t('documentation')">
      <button class="icon">
        <i class="material-icons">books</i>
        <span>{{ $t("generate_docs") }}</span>
      </button>
    </nuxt-link> -->
  </div>
</template>

<style scoped lang="scss">
.virtual-list {
  max-height: calc(100vh - 276px);
}

ul {
  display: flex;
  flex-direction: column;
}

.bordered-bottom {
  border-bottom: 1px #ccc solid;
}
</style>

<script>
import collection from "./collection"
import { fb } from "../../functions/fb"

export default {
  components: {
    collection,
    "pw-section": () => import("../layout/section"),
    addFolder: () => import("./addFolder"),
    addCollection: () => import("./addCollection"),
    editCollection: () => import("./editCollection"),
    editFolder: () => import("./editFolder"),
    editRequest: () => import("./editRequest"),
    importExportCollections: () => import("./importExportCollections"),
    VirtualList: () => import("vue-virtual-scroll-list"),
  },
  data() {
    return {
      showModalAdd: false,
      showModalEdit: false,
      showModalImportExport: false,
      showModalAddFolder: false,
      showModalEditFolder: false,
      showModalEditRequest: false,
      editingCollection: undefined,
      editingCollectionIndex: undefined,
      editingFolder: undefined,
      editingFolderIndex: undefined,
      editingRequest: undefined,
      editingRequestIndex: undefined,
    }
  },
  computed: {
    collections() {
      return this.$store.state.postwoman.collections
    },
  },
  async mounted() {
    this._keyListener = function(e) {
      if (e.key === "Escape") {
        e.preventDefault()
        this.showModalAdd = this.showModalEdit = this.showModalImportExport = this.showModalAddFolder = this.showModalEditFolder = this.showModalEditRequest = false
      }
    }
    document.addEventListener("keydown", this._keyListener.bind(this))
  },
  methods: {
    displayModalAdd(shouldDisplay) {
      this.showModalAdd = shouldDisplay
    },
    displayModalEdit(shouldDisplay) {
      this.showModalEdit = shouldDisplay

      if (!shouldDisplay) this.resetSelectedData()
    },
    displayModalImportExport(shouldDisplay) {
      this.showModalImportExport = shouldDisplay
    },
    displayModalAddFolder(shouldDisplay) {
      this.showModalAddFolder = shouldDisplay

      if (!shouldDisplay) this.resetSelectedData()
    },
    displayModalEditFolder(shouldDisplay) {
      this.showModalEditFolder = shouldDisplay

      if (!shouldDisplay) this.resetSelectedData()
    },
    displayModalEditRequest(shouldDisplay) {
      this.showModalEditRequest = shouldDisplay

      if (!shouldDisplay) this.resetSelectedData()
    },
    editCollection(collection, collectionIndex) {
      this.$data.editingCollection = collection
      this.$data.editingCollectionIndex = collectionIndex
      this.displayModalEdit(true)
      this.syncCollections()
    },
    addFolder(collection, collectionIndex) {
      this.$data.editingCollection = collection
      this.$data.editingCollectionIndex = collectionIndex
      this.displayModalAddFolder(true)
      this.syncCollections()
    },
    editFolder(payload) {
      const { collectionIndex, folder, folderIndex } = payload
      this.$data.editingCollection = collection
      this.$data.editingCollectionIndex = collectionIndex
      this.$data.editingFolder = folder
      this.$data.editingFolderIndex = folderIndex
      this.displayModalEditFolder(true)
      this.syncCollections()
    },
    editRequest(payload) {
      const { request, collectionIndex, folderIndex, requestIndex } = payload
      this.$data.editingCollectionIndex = collectionIndex
      this.$data.editingFolderIndex = folderIndex
      this.$data.editingRequest = request
      this.$data.editingRequestIndex = requestIndex
      this.displayModalEditRequest(true)
      this.syncCollections()
    },
    resetSelectedData() {
      this.$data.editingCollection = undefined
      this.$data.editingCollectionIndex = undefined
      this.$data.editingFolder = undefined
      this.$data.editingFolderIndex = undefined
      this.$data.editingRequest = undefined
      this.$data.editingRequestIndex = undefined
    },
    syncCollections() {
      if (fb.currentUser !== null) {
        if (fb.currentSettings[0].value) {
          fb.writeCollections(JSON.parse(JSON.stringify(this.$store.state.postwoman.collections)))
        }
      }
    },
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener)
  },
}
</script>
