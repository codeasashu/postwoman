<template>
  <modal :show="show" @close="hideModal">
    <div slot="header">
      <h3 class="title">{{ $t("save_request_as") }}</h3>
    </div>
    <div slot="body">
      <v-input>
        <v-text-field
          type="text"
          id="selectLabel"
          :label="$t('label')"
          v-model="requestData.name"
          :placeholder="defaultRequestName"
          @keyup.enter="saveRequestAs"
          :rules="[v => !!v || `${$t('label')} is required`]"
        />
      </v-input>
      <span class="select-wrapper">
        <v-select
          v-model="requestData.collectionIndex"
          :label="$t('select_collection')"
          :items="$store.state.postwoman.collections"
          item-text="name"
          item-value="name"
          persistent-hint
          single-line
          clearable
          return-object
        ></v-select>
      </span>
      <span class="select-wrapper">
        <v-select
          v-model="requestData.folderIndex"
          :label="$t('folder')"
          :items="folders"
          item-text="name"
          item-value="index"
          persistent-hint
          single-line
          clearable
        ></v-select>
      </span>
      <span class="select-wrapper">
        <v-select
          v-model="requestData.requestIndex"
          :label="$t('request')"
          :items="requests"
          item-text="name"
          item-value="index"
          persistent-hint
          single-line
          clearable
        ></v-select>
      </span>
    </div>
    <div slot="footer">
      <v-btn class="icon" @click="hideModal">
        {{ $t("cancel") }}
      </v-btn>
      <v-btn
        class="icon primary"
        @click="saveRequestAs"
        :disabled="requestData.name && requestData.name.length == 0"
      >
        {{ $t("save") }}
      </v-btn>
    </div>
  </modal>
</template>

<script>
import { fb } from "../../functions/fb"

export default {
  props: {
    show: Boolean,
    editingRequest: Object,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      defaultRequestName: "My Request",
      requestData: {
        name: undefined,
        collectionIndex: undefined,
        folderIndex: undefined,
        requestIndex: undefined,
      },
    }
  },
  watch: {
    "requestData.collectionIndex": function resetFolderAndRequestIndex() {
      // if user choosen some folder, than selected other collection, which doesn't have any folders
      // than `requestUpdateData.folderIndex` won't be reseted
      this.$data.requestData.folderIndex = undefined
      this.$data.requestData.requestIndex = undefined
    },
    "requestData.folderIndex": function resetRequestIndex() {
      this.$data.requestData.requestIndex = undefined
    },
  },
  computed: {
    folders() {
      const userSelectedAnyCollection = this.$data.requestData.collectionIndex !== undefined
      if (!userSelectedAnyCollection) return []

      return this.$data.requestData.collectionIndex.folders
    },
    requests() {
      const userSelectedAnyCollection = this.$data.requestData.collectionIndex !== undefined
      if (!userSelectedAnyCollection) return []

      const userSelectedAnyFolder = this.$data.requestData.folderIndex !== undefined
      if (userSelectedAnyFolder) {
        const collection = this.$data.requestData.collectionIndex
        const folder = this.$data.requestData.folderIndex
        const requests = folder.requests
        return requests
      } else {
        const collection = this.$data.requestData.collectionIndex
        const requests = collection.requests
        return requests
      }
    },
  },
  methods: {
    syncCollections() {
      if (fb.currentUser !== null) {
        if (fb.currentSettings[0].value) {
          fb.writeCollections(JSON.parse(JSON.stringify(this.$store.state.postwoman.collections)))
        }
      }
    },
    saveRequestAs() {
      const userDidntSpecifyCollection = this.$data.requestData.collectionIndex === undefined
      if (userDidntSpecifyCollection) {
        this.$toast.error(this.$t("select_collection"), {
          icon: "error",
        })
        return
      }

      const requestUpdated = {
        ...this.$props.editingRequest,
        name: this.$data.requestData.name || this.$data.defaultRequestName,
        collection: this.$data.requestData.collectionIndex,
      }

      this.$store.commit("postwoman/saveRequestAs", {
        request: requestUpdated,
        collectionIndex: this.$data.requestData.collectionIndex,
        folderIndex: this.$data.requestData.folderIndex,
        requestIndex: this.$data.requestData.requestIndex,
      })

      this.hideModal()
      this.syncCollections()
    },
    hideModal() {
      this.$emit("hide-modal")
      this.$emit("hide-model") // for backward compatibility  // TODO: use fixed event
    },
  },
}
</script>
