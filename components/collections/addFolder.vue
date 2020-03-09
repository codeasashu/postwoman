<template>
  <modal :show="show" @close="show = false">
    <div slot="header">
      <h3>{{ $t("new_folder") }}</h3>
    </div>
    <div slot="body">
      <md-field>
        <label>Folder name</label>
        <md-input
          :placeholder="$t('my_new_folder')"
          v-model="name"
          @keyup.enter="addNewFolder"
        ></md-input>
      </md-field>
    </div>
    <div slot="footer">
      <md-button class="md-primary" @click="hideModal">{{ $t("cancel") }}</md-button>
      <md-button class="md-primary" @click="addNewFolder">{{ $t("save") }}</md-button>
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
