<template>
  <div>
    <div class="flex-wrap">
      <div>
        <button class="icon" @click="toggleShowChildren">
          <i class="material-icons" v-show="!showChildren">arrow_right</i>
          <i class="material-icons" v-show="showChildren">arrow_drop_down</i>
          <i class="material-icons">folder</i>
          <span>{{ spec.info.title }}</span>
        </button>
      </div>
      <v-popover>
        <button class="tooltip-target icon" v-tooltip="$t('more')">
          <i class="material-icons">more_vert</i>
        </button>
        <template slot="popover">
          <div>
            <button class="icon" @click="$emit('edit-spec')" v-close-popover>
              <i class="material-icons">create</i>
              <span>{{ $t("edit") }}</span>
            </button>
          </div>
          <div>
            <button class="icon" @click="downloadSpec()" ref="downloadSpec" v-close-popover>
              <i class="material-icons">pencil</i>
              <span>{{ $t("export") }}</span>
            </button>
          </div>
          <div>
            <button class="icon" @click="removeSpec" v-close-popover>
              <i class="material-icons">delete</i>
              <span>{{ $t("delete") }}</span>
            </button>
          </div>
        </template>
      </v-popover>
    </div>
    <div v-show="showChildren">
      <ul>
        <li v-for="(request, index) in requests" :key="index">
          <div>
            <button class="icon">
              <i class="material-icons">insert_drive_file</i>
              <span>{{ request.path }} - {{ request.method }}</span>
            </button>
          </div>
        </li>
        <li v-if="spec.paths.length === 0">
          <label>{{ $t("spec_empty") }}</label>
        </li>
      </ul>
    </div>
  </div>
</template>
<style scoped lang="scss">
ul {
  display: flex;
  flex-direction: column;
}
</style>

<script>
export default {
  components: {
    VirtualList: () => import("vue-virtual-scroll-list"),
  },
  props: {
    spec: Object,
  },
  data() {
    return {
      showChildren: false,
      selectedFolder: {},
    }
  },
  computed: {
    requests() {
      let reqs = []
      for (let path in this.spec.paths) {
        for (let method in this.spec.paths[path]) {
          reqs.push({
            path,
            method,
            operation: this.spec.paths[path][method],
          })
        }
      }
      return reqs
    },
  },
  methods: {
    toggleShowChildren() {
      this.showChildren = !this.showChildren
    },
    removeSpec() {
      if (!confirm("Are you sure you want to remove this Spec?")) return
      this.$store.dispatch("openapi/deleteSpec", this.spec["x-internal-id"]).then(
        () => {},
        err => console.error(err)
      )
    },
    editSpec(spec) {
      this.$emit("edit-spec", { spec })
    },
    downloadSpec() {
      const dataToWrite = JSON.stringify(this.spec, null, 2)
      const file = new Blob([dataToWrite], { type: "application/json" })
      const a = document.createElement("a")
      const url = URL.createObjectURL(file)
      a.href = url
      a.download = `${this.spec.info.title} - ${this.spec["x-internal-id"]} on ${Date()}`.replace(
        /\./g,
        "[dot]"
      )
      document.body.appendChild(a)
      a.click()
      //this.$refs.downloadSpec.innerHTML = this.doneButton
      this.$toast.success(this.$t("download_started"), {
        icon: "done",
      })
    },
  },
}
</script>
