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
      requestData: {
        name: undefined,
        collection: undefined,
        folder: undefined,
        request: undefined,
      },
    }
  },
  watch: {
    "requestData.collection": function resetFolderAndrequest() {
      // if user choosen some folder, than selected other collection, which doesn't have any folders
      // than `requestUpdateData.folder` won't be reseted
      this.$data.requestData.folder = undefined
      this.$data.requestData.request = undefined
    },
    "requestData.folder": function resetrequest() {
      this.$data.requestData.request = undefined
    },
  },
  computed: {
    folders() {
      const userSelectedAnyCollection = this.$data.requestData.collection !== undefined
      if (!userSelectedAnyCollection) return []

      return this.$data.requestData.collection.folders
    },
    requests() {
      const userSelectedAnyCollection = this.$data.requestData.collection !== undefined
      if (!userSelectedAnyCollection) return []

      const userSelectedAnyFolder = this.$data.requestData.folder !== undefined
      if (userSelectedAnyFolder) {
        const collection = this.$data.requestData.collection
        const folder = this.$data.requestData.folder
        const requests = folder.requests
        return requests
      } else {
        const collection = this.$data.requestData.collection
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
      const userDidntSpecifyCollection = this.$data.requestData.collection === undefined
      if (userDidntSpecifyCollection) {
        this.$toast.error(this.$t("select_collection"), {
          icon: "error",
        })
        return
      }

      let collectionIndex = findIndex(
        this.$store.state.postwoman.collections,
        c => c.id === this.$data.requestData.collection.id
      )

      const requestUpdated = {
        ...this.$props.editingRequest,
        name: this.$data.requestData.name || this.$data.defaultRequestName,
        collection: collectionIndex,
      }

      this.$store.commit("postwoman/saveRequestAs", {
        request: requestUpdated,
        collection: this.$data.requestData.collection,
        folder: this.$data.requestData.folder,
        oldRequest: this.$data.requestData.request,
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
