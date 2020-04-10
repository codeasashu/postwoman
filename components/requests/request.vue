<template>
  <div>
    <div class="flex-wrap">
      <div class="two-line" v-tooltip="`${request.method} - ${request.path}`">
        <button class="icon" @click="toggleShowChildren">
          <i class="material-icons" v-show="!showChildren">arrow_right</i>
          <i class="material-icons" v-show="showChildren">arrow_drop_down</i>
          <i class="material-icons">folder</i>
          <span>{{ request.operation.summary }}</span>
        </button>
      </div>
      <v-popover>
        <button class="tooltip-target icon" v-tooltip="$t('more')">
          <i class="material-icons">more_vert</i>
        </button>
        <template slot="popover">
          <div>
            <button class="icon" @click="selectRequest(request.operation)" v-close-popover>
              <i class="material-icons">tab</i>
              <span>{{ $t("use") }}</span>
            </button>
          </div>
          <div>
            <button class="icon" @click="removeOperation(request.operation)" v-close-popover>
              <i class="material-icons">delete</i>
              <span>{{ $t("delete") }}</span>
            </button>
          </div>
        </template>
      </v-popover>
    </div>
    <div v-show="showChildren">
      <ul>
        <li v-for="(response, index) in responses" :key="index">
          <div class="flex-wrap">
            <div>
              <button class="icon" @click="selectResponse(request.operation, response.code)">
                <i class="material-icons">insert_drive_file</i>
                <span>{{ response.code }} - {{ response.contentType }}</span>
              </button>
            </div>
            <v-popover>
              <button class="tooltip-target icon" v-tooltip="$t('more')">
                <i class="material-icons">more_vert</i>
              </button>
              <template slot="popover">
                <div>
                  <button
                    class="icon"
                    @click="selectResponse(request.operation, response.code)"
                    v-close-popover
                  >
                    <i class="material-icons">tab</i>
                    <span>{{ $t("use") }}</span>
                  </button>
                </div>
                <div>
                  <button class="icon" @click="removeResponse(response)" v-close-popover>
                    <i class="material-icons">delete</i>
                    <span>{{ $t("delete") }}</span>
                  </button>
                </div>
              </template>
            </v-popover>
          </div>
        </li>
        <li v-if="responses.length === 0">
          <label>{{ $t("responses_empty") }}</label>
        </li>
      </ul>
    </div>
  </div>
</template>
<style scoped lang="scss">
.two-line {
  span,
  small {
    display: flex;
    flex-direction: column;
  }
}
ul {
  display: flex;
  flex-direction: column;
}

ul li {
  display: flex;
  margin-left: 32px;
  border-left: 1px solid var(--brd-color);
}
</style>
<script>
export default {
  props: {
    request: Object,
    specid: String,
  },
  data() {
    return {
      showChildren: false,
    }
  },
  computed: {
    responses() {
      let resps = []
      const responses = this.request.operation.responses
      for (let code in responses) {
        for (let contentType in responses[code]["content"]) {
          resps.push({
            code,
            contentType,
            example: responses[code]["content"][contentType].example,
          })
        }
      }
      return resps
    },
  },
  methods: {
    toggleShowChildren() {
      this.showChildren = !this.showChildren
    },
    getDefaultResponse(operation, code) {
      const responseCodes = Object.keys(operation["x-originator"].responses)
      if (responseCodes.indexOf(code) > -1) return operation["x-originator"].responses[code]
      const selectedResponseCode =
        responseCodes.indexOf(200) > -1 ? 200 : responseCodes.length ? responseCodes[0] : undefined
      return selectedResponseCode
        ? operation["x-originator"].responses[operation["x-originator"].responses]
        : undefined
    },
    selectRequest(operation) {
      let request = Object.assign(
        {
          label: operation.summary,
        },
        operation["x-originator"].request
      )
      this.$store.commit("design/selectRequest", request)
    },
    selectResponse(operation, code) {
      this.selectRequest(operation)
      let response = this.getDefaultResponse(operation, code)
      if (response) this.$store.commit("design/selectResponse", response)
      else this.$store.commit("design/resetResponses")
    },
    removeResponse(response) {
      if (!confirm("You sure to delete this response?")) {
        return
      }
      this.$store
        .dispatch("openapi/deleteResponse", {
          specid: this.specid,
          operationid: this.request.operation["x-op-id"],
          data: { code: response.code, contentType: response.contentType },
        })
        .then(res => {
          this.$toast.success(this.$t("deleted"), {
            icon: "done",
          })
        })
    },
    removeOperation(operation) {
      if (!confirm("You sure to delete this request?")) {
        return
      }
      this.$store
        .dispatch("openapi/deleteOperation", {
          specid: this.specid,
          operationid: operation["x-op-id"],
        })
        .then(() =>
          this.$toast.success(this.$t("deleted"), {
            icon: "done",
          })
        )
    },
  },
}
</script>
