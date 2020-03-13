<template>
  <modal :show="show" @close="hideModal">
    <div slot="header">
      <div class="flex-wrap">
        <h3 class="title">{{ $t("new_environment") }}</h3>
      </div>
    </div>
    <div slot="body">
      <v-text-field
        type="text"
        v-model="name"
        :placeholder="$t('my_new_environment')"
        @keyup.enter="addNewEnvironment"
      />
    </div>
    <div slot="footer">
      <div class="flex-wrap">
        <span></span>
        <span>
          <v-btn class="icon" @click="hideModal">
            {{ $t("cancel") }}
          </v-btn>
          <v-btn class="icon primary" @click="addNewEnvironment">
            {{ $t("save") }}
          </v-btn>
        </span>
      </div>
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
    syncEnvironments() {
      if (fb.currentUser !== null) {
        if (fb.currentSettings[1].value) {
          fb.writeEnvironments(JSON.parse(JSON.stringify(this.$store.state.postwoman.environments)))
        }
      }
    },
    addNewEnvironment() {
      if (!this.$data.name) {
        this.$toast.info(this.$t("invalid_environment_name"))
        return
      }
      let newEnvironment = [
        {
          name: this.$data.name,
          variables: [],
        },
      ]
      this.$store.commit("postwoman/importAddEnvironments", {
        environments: newEnvironment,
        confirmation: "Environment added",
      })
      this.$emit("hide-modal")
      this.syncEnvironments()
    },
    hideModal() {
      this.$data.name = undefined
      this.$emit("hide-modal")
    },
  },
}
</script>
