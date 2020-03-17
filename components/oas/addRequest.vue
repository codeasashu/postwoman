<template>
  <modal :show="show" @close="hideModal">
    <v-form v-model="valid">
      <div slot="header">
        <div class="flex-wrap">
          <h3 class="title">{{ $t("new_collection") }}</h3>
        </div>
      </div>
      <div slot="body">
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col>
                <v-text-field
                  :label="$t('collection_name')"
                  :placeholder="$t('my_new_collection')"
                  v-model="name"
                  :rules="v => !!v || 'Name is required'"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  :label="$t('base_url')"
                  placeholder="http://httpbin.org"
                  v-model="baseurl"
                  :rules="v => !!v || 'Name is required'"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-textarea :label="$t('description')" v-model="description"></v-textarea>
            </v-row>
          </v-col>
        </v-row>
      </div>
      <div slot="footer">
        <v-btn @click="hideModal">{{ $t("cancel") }}</v-btn>
        <v-btn color="primary" @click="add">{{ $t("save") }}</v-btn>
      </div>
    </v-form>
  </modal>
</template>
<script>
export default {
  props: {
    show: Boolean,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      valid: false,
      name: undefined,
      baseurl: undefined,
      description: undefined,
    }
  },
  methods: {
    add() {
      //   if (!this.$data.name) {
      //     this.$toast.info($t("invalid_collection_name"))
      //     return
      //   }
      //   this.$store.commit("postwoman/addNewCollection", {
      //     name: this.$data.name,
      //   })
      //   this.$emit("hide-modal")
      //   this.syncCollections()
    },
    reset() {
      this.name = undefined
      this.baseurl = undefined
      this.description = undefined
    },
    hideModal() {
      this.$emit("hide-modal")
    },
  },
}
</script>
