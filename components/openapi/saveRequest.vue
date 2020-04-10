<template>
  <modal v-if="show" @close="hideModal">
    <div slot="header">
      <ul>
        <li>
          <div class="flex-wrap">
            <h3 class="title">{{ $t("save_openapi") }}</h3>
            <div>
              <button class="icon" @click="hideModal">
                <i class="material-icons">close</i>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div slot="body">
      <ul>
        <li>
          <label for="selectLabel">{{ $t("label") }}</label>
          <input
            type="text"
            id="selectLabel"
            v-model="requestData.name"
            :placeholder="defaultRequestName"
            @keyup.enter="saveRequestAs"
          />
          <label for="selectSpec">{{ $t("spec") }}</label>
          <span class="select-wrapper">
            <select type="text" id="selectSpec" v-model="requestData.specid">
              <option
                v-for="spec in specs"
                :key="spec['x-internal-id']"
                :value="spec['x-internal-id']"
              >
                {{ spec.info.title }}
              </option>
            </select>
          </span>
        </li>
      </ul>
      <ul>
        <li>
          <label for="editLabel">{{ $t("edit_response_before_oas") }}</label>
          <Editor
            style="height: 300px; width: 100%; display: block"
            v-if="shown"
            v-model="requestData.responseBody"
            :lang="responseBodyType"
            :options="{
              maxLines: Infinity,
              minLines: '16',
              fontSize: '16px',
              autoScrollEditorIntoView: true,
              readOnly: false,
              showPrintMargin: false,
              useWorker: false,
            }"
          />
        </li>
      </ul>
    </div>
    <div slot="footer">
      <div class="flex-wrap">
        <span></span>
        <span>
          <button class="icon" @click="hideModal">
            {{ $t("cancel") }}
          </button>
          <button class="icon primary" @click="saveRequestAs">
            {{ $t("save") }}
          </button>
        </span>
      </div>
    </div>
  </modal>
</template>
<script>
import { fb } from "../../functions/fb"
import AceEditor from "../../components/ui/ace-editor"

export default {
  props: {
    show: Boolean,
  },
  components: {
    Editor: AceEditor,
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      defaultRequestName: "My Request",
      requestData: {
        name: undefined,
        specid: undefined,
        openresponse: undefined,
        responseBody: undefined,
      },
      shown: false,
    }
  },
  mounted() {
    setTimeout(() => {
      this.$data.shown = true
      this.requestData.responseBody = this.responseBodyText
    }, 1000)
  },
  watch: {
    responseBodyText(val) {
      this.requestData.responseBody = val
    },
  },
  computed: {
    specs() {
      return this.$store.state.openapi.specs
    },
    response() {
      return this.$store.state.openapi.response
    },
    responseType() {
      return (this.response.headers["content-type"] || "").split(";")[0].toLowerCase()
    },
    responseBodyType() {
      if (this.response) {
        if (
          this.responseType === "application/json" ||
          this.responseType === "application/hal+json"
        ) {
          return "json"
        } else if (this.responseType === "text/html") {
          return "html"
        } else {
          return "text"
        }
      }
      return undefined
    },
    responseBodyText() {
      if (this.response) {
        if (
          this.responseType === "application/json" ||
          this.responseType === "application/hal+json"
        ) {
          return JSON.stringify(this.response.body, null, 2)
        } else {
          return this.response.body
        }
      }
      return undefined
    },
  },
  methods: {
    saveRequestAs() {
      const userDidntSpecifySpec = this.$data.requestData.specid === undefined
      if (userDidntSpecifySpec) {
        this.$toast.error(this.$t("select_spec"), {
          icon: "error",
        })
        return
      }

      this.$store
        .dispatch("openapi/addRequest", {
          specid: this.$data.requestData.specid,
          data: {
            title: this.$data.requestData.name || this.$store.state.request.label,
            request: this.$store.state.request,
            response: this.$store.state.openapi.response,
          },
        })
        .then(
          () => this.hideModal(),
          err => console.error(err)
        )
      // this.hideModal()
    },
    hideModal() {
      this.$emit("hide-modal")
      this.$emit("hide-model") // for backward compatibility  // TODO: use fixed event
    },
  },
}
</script>
