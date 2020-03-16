<template>
  <modal :show="show" @close="hideModal">
    <div slot="header">
      <h3 class="title">Import / Export Collections</h3>
    </div>
    <div slot="body">
      <v-input>
        <v-textarea label="Export" v-model="collectionJson"></v-textarea>
      </v-input>
    </div>
    <div slot="footer">
      <v-btn @click="hideModal">{{ $t("cancel") }}</v-btn>
      <v-btn color="primary" @click="exportJSON" v-tooltip="$t('download_file')">{{
        $t("export")
      }}</v-btn>
    </div>
  </modal>
</template>

<script>
import { fb } from "../../functions/fb"

export default {
  data() {
    return {
      fb,
    }
  },
  props: {
    show: Boolean,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  computed: {
    collectionJson() {
      console.log("p", this.$store.state.postwoman.collections)
      return JSON.stringify(this.$store.state.postwoman.collections, null, 2)
    },
  },
  methods: {
    hideModal() {
      this.$emit("hide-modal")
    },
    openDialogChooseFileToReplaceWith() {
      this.$refs.inputChooseFileToReplaceWith.click()
    },
    openDialogChooseFileToImportFrom() {
      this.$refs.inputChooseFileToImportFrom.click()
    },
    replaceWithJSON() {
      let reader = new FileReader()
      reader.onload = event => {
        let content = event.target.result
        let collections = JSON.parse(content)
        if (collections[0]) {
          let [name, folders, requests] = Object.keys(collections[0])
          if (name === "name" && folders === "folders" && requests === "requests") {
            // Do nothing
          }
        } else if (collections.info && collections.info.schema.includes("v2.1.0")) {
          collections = this.parsePostmanCollection(collections)
        } else {
          return this.failedImport()
        }
        this.$store.commit("postwoman/importCollections", collections)
        this.fileImported()
      }
      reader.readAsText(this.$refs.inputChooseFileToReplaceWith.files[0])
    },
    importFromJSON() {
      let reader = new FileReader()
      reader.onload = event => {
        let content = event.target.result
        let collections = JSON.parse(content)
        if (collections[0]) {
          let [name, folders, requests] = Object.keys(collections[0])
          if (name === "name" && folders === "folders" && requests === "requests") {
            // Do nothing
          }
        } else if (collections.info && collections.info.schema.includes("v2.1.0")) {
          collections = this.parsePostmanCollection(collections)
        } else {
          return this.failedImport()
        }
        this.$store.commit("postwoman/importCollections", collections)
        this.fileImported()
      }
      reader.readAsText(this.$refs.inputChooseFileToImportFrom.files[0])
    },
    exportJSON() {
      let text = this.collectionJson
      text = text.replace(/\n/g, "\r\n")
      let blob = new Blob([text], {
        type: "text/json",
      })
      let anchor = document.createElement("a")
      anchor.download = "postwoman-collection.json"
      anchor.href = window.URL.createObjectURL(blob)
      anchor.target = "_blank"
      anchor.style.display = "none"
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      this.$toast.success(this.$t("download_started"), {
        icon: "done",
      })
    },
    syncCollections() {
      this.$store.commit("postwoman/replaceCollections", fb.currentCollections)
      this.fileImported()
    },
    fileImported() {
      this.$toast.info(this.$t("file_imported"), {
        icon: "folder_shared",
      })
    },
    failedImport() {
      this.$toast.error(this.$t("import_failed"), {
        icon: "error",
      })
    },
    parsePostmanCollection(collection, folders = true) {
      let postwomanCollection = folders
        ? [
            {
              name: "",
              folders: [],
              requests: [],
            },
          ]
        : {
            name: "",
            requests: [],
          }
      for (let collectionItem of collection.item) {
        if (collectionItem.request) {
          if (postwomanCollection[0]) {
            postwomanCollection[0].name = collection.info ? collection.info.name : ""
            postwomanCollection[0].requests.push(this.parsePostmanRequest(collectionItem))
          } else {
            postwomanCollection.name = collection.name ? collection.name : ""
            postwomanCollection.requests.push(this.parsePostmanRequest(collectionItem))
          }
        } else if (collectionItem.item) {
          if (collectionItem.item[0]) {
            postwomanCollection[0].folders.push(this.parsePostmanCollection(collectionItem, false))
          }
        }
      }
      return postwomanCollection
    },
    parsePostmanRequest(requestObject) {
      let pwRequest = {
        url: "",
        path: "",
        method: "",
        auth: "",
        httpUser: "",
        httpPassword: "",
        passwordFieldType: "password",
        bearerToken: "",
        headers: [],
        params: [],
        bodyParams: [],
        rawParams: "",
        rawInput: false,
        contentType: "",
        requestType: "",
        name: "",
      }

      pwRequest.name = requestObject.name
      let requestObjectUrl = requestObject.request.url.raw.match(
        /^(.+:\/\/[^\/]+|{[^\/]+})(\/[^\?]+|).*$/
      )
      pwRequest.url = requestObjectUrl[1]
      pwRequest.path = requestObjectUrl[2] ? requestObjectUrl[2] : ""
      pwRequest.method = requestObject.request.method
      let itemAuth = requestObject.request.auth ? requestObject.request.auth : ""
      let authType = itemAuth ? itemAuth.type : ""
      if (authType === "basic") {
        pwRequest.auth = "Basic Auth"
        pwRequest.httpUser =
          itemAuth.basic[0].key === "username" ? itemAuth.basic[0].value : itemAuth.basic[1].value
        pwRequest.httpPassword =
          itemAuth.basic[0].key === "password" ? itemAuth.basic[0].value : itemAuth.basic[1].value
      } else if (authType === "oauth2") {
        pwRequest.auth = "OAuth 2.0"
        pwRequest.bearerToken =
          itemAuth.oauth2[0].key === "accessToken"
            ? itemAuth.oauth2[0].value
            : itemAuth.oauth2[1].value
      } else if (authType === "bearer") {
        pwRequest.auth = "Bearer Token"
        pwRequest.bearerToken = itemAuth.bearer[0].value
      }
      let requestObjectHeaders = requestObject.request.header
      if (requestObjectHeaders) {
        pwRequest.headers = requestObjectHeaders
        for (let header of pwRequest.headers) {
          delete header.name
          delete header.type
        }
      }
      let requestObjectParams = requestObject.request.url.query
      if (requestObjectParams) {
        pwRequest.params = requestObjectParams
        for (let param of pwRequest.params) {
          delete param.disabled
        }
      }
      if (requestObject.request.body) {
        if (requestObject.request.body.mode === "urlencoded") {
          let params = requestObject.request.body.urlencoded
          pwRequest.bodyParams = params ? params : []
          for (let param of pwRequest.bodyParams) {
            delete param.type
          }
        } else if (requestObject.request.body.mode === "raw") {
          pwRequest.rawInput = true
          pwRequest.rawParams = requestObject.request.body.raw
        }
      }
      return pwRequest
    },
  },
}
</script>
