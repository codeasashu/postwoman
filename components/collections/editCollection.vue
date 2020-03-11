<template>
  <modal :show="show" @close="hideModal">
    <div slot="header">
      <h3 class="title">{{ $t("edit_collection") }}</h3>
    </div>
    <div slot="body">
      <v-input>
        <v-text-field
          v-if="editingCollection"
          :placeholder="editingCollection.name"
          v-model="name"
          @keyup.enter="saveCollection"
        ></v-text-field>
      </v-input>
    </div>
    <div slot="footer">
      <v-btn class="v-primary" @click="hideModal">{{ $t("cancel") }}</v-btn>
      <v-btn class="v-primary" @click="saveCollection">{{ $t("save") }}</v-btn>
    </div>
  </modal>
</template>

<script>
export default {
  props: {
    show: Boolean,
    editingCollection: Object,
    editingCollectionIndex: Number,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      name: undefined,
    }
  },
  watch: {
    show(shown) {
      if (shown) {
        this.name = this.$props.editingCollection.name
      }
    },
  },
  methods: {
    saveCollection() {
      if (!this.$data.name) {
        this.$toast.info($t("invalid_collection_name"))
        return
      }
      const collectionUpdated = {
        ...this.$props.editingCollection,
        name: this.$data.name,
      }
      this.$store.commit("postwoman/editCollection", {
        collection: collectionUpdated,
        collectionIndex: this.$props.editingCollectionIndex,
      })
      this.$emit("hide-modal")
    },
    hideModal() {
      this.name = undefined
      this.$emit("hide-modal")
    },
  },
}
</script>
