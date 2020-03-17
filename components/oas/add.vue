<template>
  <modal :show="show" @close="hideModal" :persistent="true">
    <div slot="header">
      <div class="flex-wrap">
        <h3 class="title">{{ $t("new_collection") }}</h3>
      </div>
    </div>
    <div slot="body">
      <v-form ref="form" v-model="valid">
        <v-row>
          <v-col cols="12">
            <v-row>
              <v-col>
                <v-text-field
                  :label="$t('collection_name')"
                  :placeholder="$t('my_new_collection')"
                  v-model="name"
                  :rules="[v => !!v || 'Name is required']"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  :label="$t('base_url')"
                  placeholder="http://httpbin.org"
                  v-model="baseurl"
                  type="url"
                  :rules="[
                    v => !!v || 'URL is required',
                    v => isURL(v) || 'URL should be a valid url',
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-textarea :label="$t('description')" v-model="description"></v-textarea>
            </v-row>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn @click="hideModal">{{ $t("cancel") }}</v-btn>
            <v-btn color="primary" @click="add" :disabled="!valid">{{ $t("save") }}</v-btn>
          </v-col>
        </v-row>
      </v-form>
    </div>
    <!-- <div slot="footer">
      <v-btn @click="hideModal">{{ $t("cancel") }}</v-btn>
      <v-btn color="primary" @click="add">{{ $t("save") }}</v-btn>
    </div> -->
  </modal>
</template>
<script>
import isURL from "validator/lib/isURL"
export default {
  props: {
    show: Boolean,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      valid: true,
      name: undefined,
      baseurl: undefined,
      description: undefined,
    }
  },
  methods: {
    isURL(val) {
      return val && isURL(val)
    },
    add() {
      if (this.$refs.form.validate()) {
        // Add openapi spec
        this.$store.commit("openapispec/addOas", {
          name: this.$data.name,
          baseurl: this.$data.baseurl,
          description: this.$data.description,
        })
        this.hideModal()
      }
    },
    hideModal() {
      this.$refs.form.reset()
      this.$refs.form.resetValidation()
      this.$emit("hide-modal")
    },
  },
}
</script>
