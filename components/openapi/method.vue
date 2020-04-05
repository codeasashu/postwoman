<template>
  <div>
    <div class="flex-wrap">
      <div>
        <button class="icon" @click="toggleShowChildren">
          <i class="material-icons" v-show="!showChildren">arrow_right</i>
          <i class="material-icons" v-show="showChildren">arrow_drop_down</i>
          <i class="material-icons">folder</i>
          <span>{{ label }}</span>
        </button>
      </div>
    </div>

    <div v-show="showChildren">
      <ul>
        <li v-for="(path, url) in spec.paths" :key="url">
          <p>{{ url }}</p>
          <!-- <folder
            :folder="folder"
            :folderIndex="index"
            :collection-index="collectionIndex"
            @edit-folder="editFolder(collectionIndex, folder, index)"
            @edit-request="$emit('edit-request', $event)"
          /> -->
        </li>
        <li v-if="spec.paths.length === 0">
          <label>{{ $t("spec_empty") }}</label>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    method: Object,
    label: String,
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
      this.spec.paths.forEach(path => {
        path
      })
    },
  },
  methods: {
    toggleShowChildren() {
      this.showChildren = !this.showChildren
    },
    removeSpec() {
      if (!confirm("Are you sure you want to remove this Spec?")) return
      this.$store.commit("openapi/remove", {
        id: this.spec["x-internal-id"],
      })
    },
    editSpec(spec) {
      this.$emit("edit-spec", { spec })
    },
  },
}
</script>
