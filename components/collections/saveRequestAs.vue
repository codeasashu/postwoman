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
          v-model="requestData.collection"
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
          v-model="requestData.folder"
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
          v-model="requestData.request"
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
import { findIndex } from "lodash"

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
    }
  },
  watch: {
    "requestData.collection": function resetFolderAndrequest() {
      // if user choosen some folder, than selected other collection, which doesn't have any folders
      // than `requestUpdateData.folder` won't be reseted
      this.requestData.folder = undefined
      this.requestData.request = undefined
    },
    "requestData.folder": function resetrequest() {
      this.requestData.request = undefined
    },
  },
  computed: {
    requestData() {
      return {
        name: this.$props.editingRequest.name,
        collection: undefined,
        folder: undefined,
        request: undefined,
      }
    },
    folders() {
      const userSelectedAnyCollection = this.requestData.collection !== undefined
      if (!userSelectedAnyCollection) return []

      return this.requestData.collection.folders
    },
    requests() {
      const userSelectedAnyCollection = this.requestData.collection !== undefined
      if (!userSelectedAnyCollection) return []

      const userSelectedAnyFolder = this.requestData.folder !== undefined
      if (userSelectedAnyFolder) {
        const collection = this.requestData.collection
        const folder = this.requestData.folder
        const requests = folder.requests
        return requests
      } else {
        const collection = this.requestData.collection
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
      const userDidntSpecifyCollection = this.requestData.collection === undefined
      if (userDidntSpecifyCollection) {
        this.$toast.error(this.$t("select_collection"), {
          icon: "error",
        })
        return
      }

      let collectionIndex = findIndex(
        this.$store.state.postwoman.collections,
        c => c.id === this.requestData.collection.id
      )

      const requestUpdated = {
        ...this.$props.editingRequest,
        name: this.requestData.name || this.$data.defaultRequestName,
        collection: collectionIndex,
      }

      this.$store.commit("postwoman/saveRequestAs", {
        request: requestUpdated,
        collection: this.requestData.collection,
        folder: this.requestData.folder,
        oldRequest: this.requestData.request,
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
