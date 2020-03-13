<!--
TODO:
    - probably refactor and pass event arguments to modals directly without unpacking
-->

<template>
  <div class="v-layout" :label="$t('collections')" ref="collections">
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

    <v-row>
      <v-col class="collection-header">
        <div class="v-layout-item v-size-50 center">
          <v-btn small color="primary" @click="displayModalAdd(true)">
            <span>{{ $t("create_collection") }}</span>
          </v-btn>
        </div>
      </v-col>
      <v-col>
        <div class="v-layout-item v-size-50 center">
          <v-btn small color="primary" @click="displayModalImportExport(true)">
            <span>{{ $t("import_export") }}</span>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-divider></v-divider>

    <virtual-list
      class="virtual-list v-layout-item v-size-100"
      :class="{ filled: collections.length }"
      :size="652"
      :remain="Math.min(5, collections.length)"
    >
      <v-expansion-panels :accordion="true" focusable tile>
        <v-expansion-panel
          v-for="(collection, index) in collections"
          :key="collection.name"
          class="v-list-item-expand"
        >
          <v-expansion-panel-header disable-icon-rotate>
            <collection :collection-index="index" :collection="collection" />
            <template v-slot:actions>
              <kebob-menu>
                <template slot="menu">
                  <v-list>
                    <v-list-item @click="addFolder(collection, index)">
                      <v-list-item-title>{{ $t("new_folder") }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editCollection(collection, index)">
                      <v-list-item-title>{{ $t("edit") }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="removeCollection(index)">
                      <v-list-item-title>{{ $t("delete") }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </template>
              </kebob-menu>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <p v-if="collection.folders.length === 0 && collection.requests.length === 0">
              <label>{{ $t("collection_empty") }}</label>
            </p>
            <!-- <v-subheader>Folders</v-subheader> -->
            <v-expansion-panels flat :focusable="false">
              <v-expansion-panel
                v-for="(folder, folderIndex) in collection.folders"
                :key="folder.name"
              >
                <v-expansion-panel-header disable-icon-rotate>
                  <folder
                    :folder="folder"
                    :folderIndex="folderIndex"
                    :collection-index="index"
                    @edit-request="$emit('edit-request', $event)"
                  />
                  <template v-slot:actions>
                    <kebob-menu>
                      <template slot="menu">
                        <v-list>
                          <v-list-item
                            @click="editFolder({ collectionIndex: index, folder, folderIndex })"
                          >
                            <v-list-item-title>{{ $t("edit") }}</v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="removeFolder(index, folderIndex)">
                            <v-list-item-title>{{ $t("delete") }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </template>
                    </kebob-menu>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-list shaped two-line>
                    <v-list-item
                      v-for="(request, requestIndex) in folder.requests"
                      :key="request.name"
                    >
                      <request
                        :request="request"
                        :collection-index="index"
                        :folder-index="-1"
                        :request-index="requestIndex"
                        @edit-request="
                          $emit('edit-request', {
                            request,
                            index,
                            folderIndex: folderIndex,
                            requestIndex: requestIndex,
                          })
                        "
                      />
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <!-- <v-subheader>Requests</v-subheader> -->
            <v-list shaped two-line>
              <v-list-item
                v-for="(request, requestIndex) in collection.requests"
                :key="request.name"
              >
                <request
                  :request="request"
                  :collection-index="index"
                  :folder-index="-1"
                  :request-index="requestIndex"
                  @edit-request="
                    $emit('edit-request', {
                      request,
                      index,
                      folderIndex: undefined,
                      requestIndex: requestIndex,
                    })
                  "
                />
              </v-list-item>
            </v-list>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </virtual-list>
    <v-btn
      v-if="collections.length == 0"
      class="v-primary v-raised"
      @click.prevent="displayModalAdd(true)"
      >Create first collection</v-btn
    >
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
    folder: () => import("./folder"),
    request: () => import("./request"),
    kebobMenu: () => import("../../components/ui/kebobMenu"),
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
    removeCollection(collectionIndex) {
      if (!confirm("Are you sure you want to remove this Collection?")) return
      this.$store.commit("postwoman/removeCollection", {
        collectionIndex,
      })
    },
    removeFolder(collectionIndex, folderIndex) {
      if (!confirm("Are you sure you want to remove this folder?")) return
      this.$store.commit("postwoman/removeFolder", {
        collectionIndex,
        folderIndex,
      })
    },
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
      console.log(payload, collectionIndex, "b")
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
