<template>
  <div>
    <modal :show="showModal" @close="showModal = false">
      <div slot="header">
        <h3 class="title">{{ $t("import_curl") }}</h3>
      </div>
      <div slot="body">
        <v-textarea
          id="import-text"
          autofocus
          rows="8"
          :placeholder="$t('enter_curl')"
        ></v-textarea>
      </div>
      <div slot="footer">
        <div class="flex-wrap">
          <span></span>
          <span>
            <v-btn class="icon" @click="showModal = false">
              {{ $t("cancel") }}
            </v-btn>
            <v-btn class="icon primary" @click="handleImport">
              {{ $t("import") }}
            </v-btn>
          </span>
        </div>
      </div>
    </modal>
  </div>
</template>
<script>
import parseCurlCommand from "../../assets/js/curlparser.js"
export default {
  props: {
    show: Boolean,
  },
  data() {
    return {
      showModal: false,
    }
  },
  watch: {
    show(val) {
      this.showModal = val
    },
  },
  methods: {
    handleImport() {
      const { value: text } = document.getElementById("import-text")
      try {
        const parsedCurl = parseCurlCommand(text)
        const { origin, pathname } = new URL(parsedCurl.url.replace(/"/g, "").replace(/'/g, ""))

        let method = parsedCurl.method.toUpperCase()

        let request = Object.assign({}, this.$store.state.request, {
          url: origin,
          path: pathname,
          headers: [],
          method,
        })
        this.$store.commit("setRequest", request)
        if (parsedCurl.headers) {
          for (const key of Object.keys(parsedCurl.headers)) {
            this.$store.commit("addHeaders", {
              key,
              value: parsedCurl.headers[key],
            })
          }
        }
        if (parsedCurl["data"]) {
          this.$store.commit("setState", { value: true, attribute: "rawInput" })
          this.$store.commit("setState", { value: parsedCurl["data"], attribute: "rawParams" })
        }

        this.showModal = false
      } catch (error) {
        this.showModal = false
        this.$toast.error(this.$t("curl_invalid_format"), {
          icon: "error",
        })
      }
    },
  },
}
</script>
