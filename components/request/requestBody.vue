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
        <v-switch v-model="_rawInput" :label="$t('raw_input')"></v-switch>
      </v-col>
      <v-col cols="7">
        <div v-if="!rawInput">
          <body-params
            :bodyParams="bodyParams"
            @set_key="event => $emit('set_key', event)"
            @set_value="event => $emit('set_value', event)"
            @delete="index => $emit('delete', index)"
            @add_new="$emit('add_new')"
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
  props: {
    method: String,
    contentType: String,
    rawInput: Boolean,
    rawParams: String,
    bodyParams: Array[Object],
  },
  computed: {
    _rawInput: {
      get() {
        return this.$props.rawInput
      },
      set(value) {
        return this.$emit("raw-input", value)
      },
    },
    _contentType: {
      get() {
        return this.$props.contentType
      },
      set(val) {
        this.$emit("set_content_type", val)
      },
    },
    _rawParams() {
      return this.$props.rawParams
    },
    rawInputEditorLang() {
      return getEditorLangForMimeType(this._contentType)
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
      if (val) {
        this.$emit("raw-params", val)
      }
    },
    changeContentType(val) {
      this._contentType = val
    },
  },
}
</script>
