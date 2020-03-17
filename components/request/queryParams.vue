<template>
  <div>
    <v-row>
      <v-col cols="10">
        <v-btn class="v-primary v-raised" @click="addRequestParam">
          <v-icon>add</v-icon>
          <span>{{ $t("add_new") }}</span>
        </v-btn>
      </v-col>
      <v-col cols="2">
        <v-btn
          class="v-icon-button"
          @click="$emit('clear_all', $event)"
          v-tooltip.bottom="$t('clear')"
          ><v-icon>clear_all</v-icon></v-btn
        >
      </v-col>
    </v-row>
    <v-row v-for="(param, index) in params" :key="index">
      <v-col cols="5">
        <v-input>
          <v-text-field
            :placeholder="$t('parameter_count', { count: index + 1 })"
            :name="'param' + index"
            v-if="param"
            :value="param.key"
            @change="$event => $store.commit('setKeyParams', { index, value: $event })"
            autofocus
          />
        </v-input>
      </v-col>
      <v-col cols="5">
        <v-input>
          <v-text-field
            :placeholder="$t('value_count', { count: index + 1 })"
            :name="'value' + index"
            :value="param.value"
            @change="$event => $store.commit('setValueParams', { index, value: $event })"
          />
        </v-input>
      </v-col>
      <v-col cols="2">
        <v-btn
          class="v-raised v-icon-button"
          @click="removeRequestParam(index)"
          v-tooltip="$t('delete')"
          ><v-icon>delete</v-icon></v-btn
        >
      </v-col>
    </v-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
      paramsWatchEnabled: true,
    }
  },
  computed: {
    request() {
      return this.$store.state.request
    },
    params: {
      get() {
        return this.$store.state.request.params
      },
      set(value) {
        this.$store.commit("setState", { value, attribute: "params" })
      },
    },
  },
  watch: {
    params: {
      handler: function(newValue) {
        if (!this.paramsWatchEnabled) {
          this.paramsWatchEnabled = true
          return
        }
        let path = this.request.path
        let queryString = newValue
          .filter(({ key }) => !!key)
          .map(({ key, value }) => `${key}=${value}`)
          .join("&")
        queryString = queryString === "" ? "" : `?${queryString}`
        if (path.includes("?")) {
          path = path.slice(0, path.indexOf("?")) + queryString
        } else {
          path = path + queryString
        }
        this.$store.commit("setState", { value: path, attribute: "path" })
      },
      deep: true,
    },
  },
  methods: {
    addRequestParam() {
      this.$store.commit("addParams", { key: "", value: "" })
      return false
    },
    removeRequestParam(index) {
      // .slice() gives us an entirely new array rather than giving us just the reference
      const oldParams = this.params.slice()
      this.$store.commit("removeParams", index)
      this.$toast.error(this.$t("deleted"), {
        icon: "delete",
        action: {
          text: this.$t("undo"),
          onClick: (e, toastObject) => {
            this.params = oldParams
            toastObject.remove()
          },
        },
      })
    },
  },
}
</script>
