<template>
  <div>
    <div class="flex-wrap">
      <div>
        <button class="icon" @click="toggleShowChildren">
          <i class="material-icons" v-show="!showChildren">arrow_right</i>
          <i class="material-icons" v-show="showChildren">arrow_drop_down</i>
          <i class="material-icons">folder</i>
          <span>{{ request.method }} - {{ request.operation.summary }}</span>
        </button>
      </div>
    </div>
    <div v-show="showChildren">
      <ul>
        <li v-for="(response, index) in responses" :key="index">
          <div>
            <button class="icon">
              <i class="material-icons">insert_drive_file</i>
              <span>{{ response.code }} - {{ response.contentType }}</span>
            </button>
          </div>
        </li>
        <li v-if="responses.length === 0">
          <label>{{ $t("responses_empty") }}</label>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    request: Object,
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
  },
}
</script>
