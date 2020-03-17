<template>
  <div>
    <v-row v-if="['POST', 'PUT', 'PATCH'].includes(method)">
      <v-col cols="5">
        <h3>{{ $t("request") }}</h3>
        <v-input class="v-layout-item v-size-90">
          <autocomplete
            @input="changeContentType"
            class="v-layout"
            :source="validContentTypes"
            :spellcheck="false"
            >Content Type</autocomplete
          >
        </v-input>
        <v-switch v-model="rawInput" :label="$t('raw_input')"></v-switch>
      </v-col>
      <v-col cols="7">
        <div v-if="!rawInput">
          <body-params
            :bodyParams="bodyParams"
            @set_key="event => $store.commit('setKeyBodyParams', ...event)"
            @set_value="event => $store.commit('setValueBodyParams', ...event)"
            @delete="index => removeRequestBodyParam(index)"
            @add_new="addRequestBodyParam"
          />
        </div>
        <div v-else>
          <label for="rawBody">{{ $t("raw_request_body") }}</label>
          <Editor
            @input="editorLeave"
            :lang="rawInputEditorLang"
            :options="{
              maxLines: '16',
              minLines: '8',
              fontSize: '16px',
              autoScrollEditorIntoView: true,
              showPrintMargin: false,
              useWorker: false,
            }"
          />
        </div>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import AceEditor from "../../components/ui/ace-editor"
import { getEditorLangForMimeType } from "~/functions/editorutils"
export default {
  components: {
    autocomplete: () => import("../../components/ui/autocomplete"),
    Editor: AceEditor,
    bodyParams: () => import("../../components/request/bodyParams"),
  },
  computed: {
    method() {
      return this.$store.state.request.method
    },
    bodyParams: {
      get() {
        return this.$store.state.request.bodyParams
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "bodyParams" })
      },
    },
    rawInput: {
      get() {
        return this.$store.state.request.rawInput
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "rawInput" })
      },
    },
    contentType: {
      get() {
        return this.$store.state.request.contentType
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "contentType" })
      },
    },
    rawParams: {
      get() {
        return this.$store.state.request.rawParams
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "rawParams" })
      },
    },
    rawInputEditorLang() {
      return getEditorLangForMimeType(this.contentType)
    },
  },
  data() {
    return {
      validContentTypes: [
        "application/json",
        "application/hal+json",
        "application/xml",
        "application/x-www-form-urlencoded",
        "text/html",
        "text/plain",
      ],
    }
  },
  methods: {
    editorLeave(val) {
      this.rawParams = val
    },
    changeContentType(val) {
      this.contentType = val
    },
    addRequestBodyParam() {
      this.$store.commit("addBodyParams", { key: "", value: "" })
      return false
    },
    removeRequestBodyParam(index) {
      // .slice() gives us an entirely new array rather than giving us just the reference
      const oldBodyParams = this.bodyParams.slice()
      this.$store.commit("removeBodyParams", index)
      this.$toast.error(this.$t("deleted"), {
        icon: "delete",
        action: {
          text: this.$t("undo"),
          onClick: (e, toastObject) => {
            this.bodyParams = oldBodyParams
            toastObject.remove()
          },
        },
      })
    },
  },
}
</script>
