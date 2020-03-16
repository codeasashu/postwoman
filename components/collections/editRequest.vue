<template>
  <modal :show="show" @close="hideModal">
    <div slot="header">
      <h3 class="title">{{ $t("edit_request") }}</h3>
    </div>
    <div slot="body">
      <v-input v-if="requestUpdateData && request">
        <v-text-field
          type="text"
          id="selectLabel"
          v-model="requestUpdateData.name"
          @keyup.enter="saveRequest"
          :placeholder="request.name"
          :label="$t('label')"
        />
      </v-input>
      <v-input>
        <span class="select-wrapper">
          <v-select
            v-model="requestUpdateData.collection"
            :label="$t('current_collection')"
            :items="$store.state.postwoman.collections"
            item-text="name"
            item-value="index"
            persistent-hint
            single-line
            clearable
            return-object
          ></v-select>
        </span>
      </v-input>
      <v-input v-if="requestUpdateData">
        <span class="select-wrapper">
          <v-select
            v-model="requestUpdateData.folder"
            :label="$t('folder')"
            :items="folders"
            item-text="name"
            item-value="index"
            persistent-hint
            single-line
            clearable
            return-object
          ></v-select>
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
        collection: undefined,
        folder: undefined,
        collectionIndex: undefined,
        folderIndex: undefined,
      },
    }
  },
  watch: {
    "requestUpdateData.collection": function resetFolderIndex() {
      // if user choosen some folder, than selected other collection, which doesn't have any folders
      // than `requestUpdateData.folderIndex` won't be reseted
      this.$data.requestUpdateData.folderIndex = undefined
    },
  },
  computed: {
    folders() {
      const userSelectedAnyCollection = this.$data.requestUpdateData.collection !== undefined
      if (!userSelectedAnyCollection) return []
      return this.$data.requestUpdateData.collection.folders
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
