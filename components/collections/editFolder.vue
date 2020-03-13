<template>
  <modal :show="show" @close="show = false">
    <div slot="header">
      <h3 class="title">{{ $t("edit_folder") }}</h3>
    </div>
    <div slot="body">
      <v-input v-if="folder">
        <v-text-field
          type="text"
          v-model="name"
          :rules="[v => !!v || 'Name is required']"
          :placeholder="folder.name"
          @keyup.enter="editFolder"
        />
      </v-input>
    </div>
    <div slot="footer">
      <v-btn class="v-primary" @click="hideModal">{{ $t("cancel") }}</v-btn>
      <v-btn class="v-primary" @click="editFolder" v-if="name" :disabled="name.length <= 0">{{
        $t("save")
      }}</v-btn>
    </div>
  </modal>
</template>

<script>
export default {
  props: {
    show: Boolean,
    collection: Object,
    collectionIndex: Number,
    folder: Object,
    folderIndex: Number,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  watch: {
    show(shown) {
      if (shown) {
        this.name = this.$props.folder.name
      }
    },
  },
  data() {
    return {
      valid: false,
      name: undefined,
    }
  },
  methods: {
    editFolder() {
      this.$store.commit("postwoman/editFolder", {
        collectionIndex: this.$props.collectionIndex,
        folder: { ...this.$props.folder, name: this.$data.name },
        folderIndex: this.$props.folderIndex,
      })
      this.hideModal()
    },
    hideModal() {
      this.$emit("hide-modal")
    },
  },
}
</script>
