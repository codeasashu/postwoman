<template>
  <div>
    <modal :show="!isHidden" @close="isHidden = true">
      <div slot="header">
        <h3 class="title">{{ $t("generate_code") }}</h3>
      </div>
      <div slot="body">
        <ul>
          <li>
            <label for="requestType">{{ $t("request_type") }}</label>
            <span class="select-wrapper">
              <select id="requestType" v-model="request.requestType">
                <option>JavaScript XHR</option>
                <option>Fetch</option>
                <option>cURL</option>
              </select>
            </span>
          </li>
        </ul>
        <ul>
          <li>
            <div class="flex-wrap">
              <label for="generatedCode">{{ $t("generated_code") }}</label>
              <div>
                <button
                  class="icon"
                  @click="copyRequestCode"
                  id="copyRequestCode"
                  ref="copyRequestCode"
                  v-tooltip="$t('copy_code')"
                >
                  <i class="material-icons">file_copy</i>
                </button>
              </div>
            </div>
            <textarea
              id="generatedCode"
              ref="generatedCode"
              name="generatedCode"
              rows="8"
              v-model="requestCode"
            ></textarea>
          </li>
        </ul>
      </div>
      <div slot="footer"></div>
    </modal>
  </div>
</template>
<script>
import { PWRequest } from "../../functions/request"
export default {
  data() {
    return {
      copyButton: '<i class="material-icons">file_copy</i>',
      requestcode: null,
      isHidden: false,
    }
  },
  computed: {
    request() {
      return this.$store.state.request
    },
  },
  mounted() {
    let request = new PWRequest(this.request)
    this.requestcode = request.requestCode
  },
  methods: {
    copyRequestCode() {
      this.$refs.copyRequestCode.innerHTML = this.doneButton
      this.$toast.success(this.$t("copied_to_clipboard"), {
        icon: "done",
      })
      this.$refs.generatedCode.select()
      document.execCommand("copy")
      setTimeout(() => (this.$refs.copyRequestCode.innerHTML = this.copyButton), 1000)
    },
  },
}
</script>
