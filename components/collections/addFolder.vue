<template>
  <modal :show="show" @close="show = false">
    <div slot="header">
      <h3>{{ $t("new_folder") }}</h3>
    </div>
    <div slot="body">
      <v-input>
        <label>Folder name</label>
        <v-text-field
          :placeholder="$t('my_new_folder')"
          v-model="name"
          @keyup.enter="addNewFolder"
        ></v-text-field>
      </v-input>
    </div>
    <div slot="footer">
      <v-btn class="v-primary" @click="hideModal">{{ $t("cancel") }}</v-btn>
      <v-btn class="v-primary" @click="addNewFolder">{{ $t("save") }}</v-btn>
    </div>
  </modal>
</template>

<script>
export default {
  props: {
    show: Boolean,
    collection: Object,
    collectionIndex: Number,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      name: undefined,
    }
  },
  methods: {
    addNewFolder() {
      this.$store.commit("postwoman/addNewFolder", {
        folder: { name: this.$data.name },
        collectionIndex: this.$props.collectionIndex,
      })
      this.hideModal()
    },
    hideModal() {
      this.name = undefined
      this.$emit("hide-modal")
    },
  },
}
</script>
