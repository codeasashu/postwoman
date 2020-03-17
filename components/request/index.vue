<template>
  <div>
    <v-row>
      <v-col>
        <v-text-field
          id="label"
          name="label"
          type="text"
          v-model="selectedRequest.name"
          :label="$t('label')"
          :placeholder="$t('optional')"
        />
      </v-col>
      <v-col>
        <slot name="requestHeader"></slot>
      </v-col>
    </v-row>
    <v-row ref="request-input">
      <v-col cols="2">
        <v-input>
          <v-select :label="$t('method')" :items="requestMethods" v-model="method"></v-select>
        </v-input>
      </v-col>
      <v-col cols="6">
        <v-input>
          <v-text-field
            name="url"
            id="url"
            :label="$t('url')"
            :class="{ error: !isValidURL }"
            @keyup.enter="isValidURL ? sendRequest() : null"
            v-model="uri"
            spellcheck="false"
          />
        </v-input>
      </v-col>
      <v-col cols="4">
        <v-btn
          color="primary"
          raised
          :disabled="!isValidURL"
          @click="sendRequest"
          id="send"
          ref="sendButton"
          >{{ $t("send") }}
          <v-icon>send</v-icon>
        </v-btn>
        <v-btn
          class="v-primary v-raised v-icon-button"
          :disabled="!isValidURL"
          @click="copyRequest"
          id="copyRequest"
          ref="copyRequest"
          v-tooltip.bottom="$t('copy')"
        >
          <v-icon>file_copy</v-icon>
        </v-btn>
        <v-btn
          class="v-primary v-raised v-icon-button"
          :disabled="!isValidURL"
          @click="saveRequest"
          id="saveRequest"
          ref="saveRequest"
          v-tooltip.bottom="$t('save_to_collections')"
        >
          <v-icon>save</v-icon>
        </v-btn>
        <v-btn
          class="v-primary v-raised v-icon-button"
          @click="clearContents($event)"
          id="clearAll"
          ref="clearAll"
          v-tooltip.bottom="$t('clear_all')"
        >
          <v-icon>clear_all</v-icon>
        </v-btn>
        <v-menu
          class="v-layout v-alignment-center-right"
          :mdCloseOnClick="true"
          :mdCloseOnSelect="true"
          v-tooltip="$t('more')"
        >
          <v-icon v-menu-trigger>more_vert</v-icon>
          <v-menu-content>
            <v-menu-item>
              <v-btn @click="showModal = true">
                <span><v-icon>import_export</v-icon>{{ $t("import_curl") }}</span>
              </v-btn>
            </v-menu-item>
            <v-menu-item>
              <v-btn @click="showModal = true">
                <span><v-icon>code</v-icon>{{ isHidden ? $t("show_code") : $t("hide_code") }}</span>
              </v-btn>
            </v-menu-item>
            <v-menu-item>
              <v-btn @click="isHidden = !isHidden" :disabled="!isValidURL">
                <span><v-icon>import_export</v-icon>{{ $t("import_curl") }}</span>
              </v-btn>
            </v-menu-item>
          </v-menu-content>
        </v-menu>
      </v-col>
    </v-row>
    <save-request-as
      :show="showRequestModal"
      @hide-model="hideRequestModal"
      :editing-request="editRequest"
    />
  </div>
</template>
<script>
import { basicRequestSchema, httpbinRequest, urlParse } from "../../functions"
export default {
  props: {
    request: Object,
  },
  components: {
    saveRequestAs: () => import("../../components/collections/saveRequestAs"),
  },
  created() {
    document.addEventListener("keydown", this.keyListener)
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.keyListener)
  },
  data() {
    return {
      editRequest: {},
      showRequestModal: false,
      requestMethods: ["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH"],
      isHidden: true,
      copyButton: '<i class="material-icons">file_copy</i>',
    }
  },
  computed: {
    isValidURL() {
      const protocol = "^(https?:\\/\\/)?"
      const validIP = new RegExp(
        `${protocol}(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$`
      )
      const validHostname = new RegExp(
        `${protocol}(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9/])$`
      )
      return validIP.test(this.selectedRequest.url) || validHostname.test(this.selectedRequest.url)
    },
    selectedRequest: {
      get() {
        let _request = Object.assign(
          //  {}, basicRequestSchema, this.$store.state.postwoman.selectedRequest
          {},
          basicRequestSchema,
          this.$props.request
        )
        return _request
      },
      set(val) {
        this.$store.commit("setRequest", val)
      },
    },
    method: {
      get() {
        return this.selectedRequest.method
      },
      set(value) {
        this.$store.commit("setState", { attribute: "method", value })
      },
    },
    uri: {
      get() {
        if (this.selectedRequest.url && this.selectedRequest.path) {
          return this.selectedRequest.url + this.selectedRequest.path
        }
        return this.$store.state.request.uri || this.selectedRequest.url
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "uri" })
        //@TODO replace value with env vars before parsing
        let url = urlParse(value)
        this.$store.commit("setState", { attribute: "url", value: url.origin })
        this.$store.commit("setState", { attribute: "path", value: url.path })
      },
    },
    editingRequest() {
      return this.$store.state.postwoman.editingRequest
    },
  },
  watch: {
    editingRequest(newValue) {
      this.editRequest = newValue
      this.showRequestModal = true
    },
  },
  methods: {
    copyRequest() {
      if (navigator.share) {
        const time = new Date().toLocaleTimeString()
        const date = new Date().toLocaleDateString()
        navigator
          .share({
            title: "Postwoman",
            text: `Postwoman • API request builder at ${time} on ${date}`,
            url: window.location.href,
          })
          .then(() => {})
          .catch(console.error)
      } else {
        const dummy = document.createElement("input")
        document.body.appendChild(dummy)
        dummy.value = window.location.href
        dummy.select()
        document.execCommand("copy")
        document.body.removeChild(dummy)
        this.$refs.copyRequest.innerHTML = this.doneButton
        this.$toast.info(this.$t("copied_to_clipboard"), {
          icon: "done",
        })
        setTimeout(() => (this.$refs.copyRequest.innerHTML = this.copyButton), 1000)
      }
    },
    sendRequest() {
      this.$toast.clear()
      if (!this.isValidURL) {
        this.$toast.error(this.$t("url_invalid_format"), {
          icon: "error",
        })
        return
      }
      //Send emit evt
      this.$emit("send", this.selectedRequest)
    },
    clearContents(event) {
      this.selectedRequest = httpbinRequest
      //Send clr evt
      this.$emit("clear", { target: "", event })
    },
    checkCollections() {
      const checkCollectionAvailability =
        this.$store.state.postwoman.collections &&
        this.$store.state.postwoman.collections.length > 0
      return checkCollectionAvailability
    },
    saveRequest() {
      if (!this.checkCollections()) {
        this.$toast.error(this.$t("create_collection"), {
          icon: "error",
        })
        return
      }
      this.editRequest = Object.assign({}, this.selectedRequest, this.editRequest)
      this.showRequestModal = true
    },
    hideRequestModal() {
      this.showRequestModal = false
      this.editRequest = {}
    },
    keyListener(e) {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.copyRequest()
      } else if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        this.saveRequest()
      }
    },
  },
}
</script>
