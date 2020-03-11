<template>
  <modal :show="show" @close="hideModal">
    <div slot="header">
      <div class="flex-wrap">
        <h3 class="title">{{ $t("new_collection") }}</h3>
      </div>
    </div>
    <div slot="body">
      <v-row>
        <v-col cols="12">
        <v-input>
          <v-text-field
            :label='$t("collection_name")'
            :placeholder="$t('my_new_collection')"
            v-model="name"
            @keyup.enter="addNewCollection"
          ></v-text-field>
        </v-input>
        </v-col>
      </v-row>
    </div>
    <div slot="footer">
      <v-btn @click="hideModal">{{ $t("cancel") }}</v-btn>
      <v-btn color="primary" @click="addNewCollection">{{ $t("save") }}</v-btn>
    </div>
  </modal>
</template>

<script>
import { fb } from "../../functions/fb"

export default {
  props: {
    show: Boolean,
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
    syncCollections() {
      if (fb.currentUser !== null) {
        if (fb.currentSettings[0].value) {
          fb.writeCollections(JSON.parse(JSON.stringify(this.$store.state.postwoman.collections)))
        }
      }
    },
    addNewCollection() {
      if (!this.$data.name) {
        this.$toast.info($t("invalid_collection_name"))
        return
      }
      this.$store.commit("postwoman/addNewCollection", {
        name: this.$data.name,
      })
      this.$emit("hide-modal")
      this.syncCollections()
    },
    hideModal() {
      this.name = undefined
      this.$emit("hide-modal")
    },
  },
}
</script>
