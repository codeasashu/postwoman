<template>
  <modal :show="show" @close="hideModal">
    <div slot="header">
      <h3 class="title">{{ $t("edit_request") }}</h3>
    </div>
    <div slot="body">
          <v-input v-if="requestUpdateData && request">
            <label for="selectLabel">{{ $t("label") }}</label>
            <v-text-field
              type="text"
              id="selectLabel"
              v-model="requestUpdateData.name"
              @keyup.enter="saveRequest"
              :placeholder="request.name"
            />
          </v-input>
          <v-input>
            <label for="selectCollection">{{ $t("collection") }}</label>
            <span class="select-wrapper">
              <v-select type="text" id="selectCollection" v-model="requestUpdateData.collectionIndex">
                <v-option :key="undefined" :value="undefined" hidden disabled selected>{{
                  $t("current_collection")
                }}</v-option>
                <v-option
                  v-for="(collection, index) in $store.state.postwoman.collections"
                  :key="index"
                  :value="index"
                >
                  {{ collection.name }}
                </v-option>
              </v-select>
            </span>
          </v-input>
          <v-input v-if="requestUpdateData">
          <label for="selectFolder">{{ $t("folder") }}</label>
          <span class="select-wrapper">
            <v-select type="text" id="selectFolder" v-model="requestUpdateData.folderIndex">
              <v-option :key="undefined" :value="undefined">/</v-option>
              <v-option v-for="(folder, index) in folders" :key="index" :value="index">
                {{ folder.name }}
              </v-option>
            </v-select>
          </span>
          </v-input>
    </div>
    <div slot="footer">
      <v-btn class="v-primary" @click="hideModal">{{ $t("cancel") }}</v-btn>
      <v-btn class="v-primary" @click="saveRequest">{{ $t("save") }}</v-btn>
    </div>
  </modal>
</template>

<script>
export default {
  props: {
    show: Boolean,
    collectionIndex: Number,
    folderIndex: Number,
    request: Object,
    requestIndex: Number,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      requestUpdateData: {
        name: undefined,
        collectionIndex: undefined,
        folderIndex: undefined,
      },
    }
  },
  watch: {
    "requestUpdateData.collectionIndex": function resetFolderIndex() {
      // if user choosen some folder, than selected other collection, which doesn't have any folders
      // than `requestUpdateData.folderIndex` won't be reseted
      this.$data.requestUpdateData.folderIndex = undefined
    },
  },
  computed: {
    folders() {
      const userSelectedAnyCollection = this.$data.requestUpdateData.collectionIndex !== undefined
      if (!userSelectedAnyCollection) return []

      return this.$store.state.postwoman.collections[this.$data.requestUpdateData.collectionIndex]
        .folders
    },
  },
  methods: {
    saveRequest() {
      const userSelectedAnyCollection = this.$data.requestUpdateData.collectionIndex !== undefined

      const requestUpdated = {
        ...this.$props.request,
        name: this.$data.requestUpdateData.name || this.$props.request.name,
        collection: userSelectedAnyCollection
          ? this.$data.requestUpdateData.collectionIndex
          : this.$props.collectionIndex,
        folder: this.$data.requestUpdateData.folderIndex,
      }

      // pass data separately to don't depend on request's collection, folder fields
      // probably, they should be deprecated because they don't describe request itself
      this.$store.commit("postwoman/editRequest", {
        requestOldCollectionIndex: this.$props.collectionIndex,
        requestOldFolderIndex: this.$props.folderIndex,
        requestOldIndex: this.$props.requestIndex,
        requestNew: requestUpdated,
        requestNewCollectionIndex: requestUpdated.collection,
        requestNewFolderIndex: requestUpdated.folder,
      })

      this.hideModal()
    },
    hideModal() {
      this.$emit("hide-modal")
    },
  },
}
</script>
