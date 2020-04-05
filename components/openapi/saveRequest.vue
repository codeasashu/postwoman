<template>
  <modal v-if="show" @close="hideModal">
    <div slot="header">
      <ul>
        <li>
          <div class="flex-wrap">
            <h3 class="title">{{ $t("save_openapi") }}</h3>
            <div>
              <button class="icon" @click="hideModal">
                <i class="material-icons">close</i>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div slot="body">
      <ul>
        <li>
          <label for="selectLabel">{{ $t("label") }}</label>
          <input
            type="text"
            id="selectLabel"
            v-model="requestData.name"
            :placeholder="defaultRequestName"
            @keyup.enter="saveRequestAs"
          />
          <label for="selectSpec">{{ $t("spec") }}</label>
          <span class="select-wrapper">
            <select type="text" id="selectSpec" v-model="requestData.specid">
              <option
                v-for="spec in specs"
                :key="spec['x-internal-id']"
                :value="spec['x-internal-id']"
              >
                {{ spec.info.title }}
              </option>
            </select>
          </span>
        </li>
      </ul>
    </div>
    <div slot="footer">
      <div class="flex-wrap">
        <span></span>
        <span>
          <button class="icon" @click="hideModal">
            {{ $t("cancel") }}
          </button>
          <button class="icon primary" @click="saveRequestAs">
            {{ $t("save") }}
          </button>
        </span>
      </div>
    </div>
  </modal>
</template>
<script>
import { fb } from "../../functions/fb"
import { addRequest } from "../../functions/api"

export default {
  props: {
    show: Boolean,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      defaultRequestName: "My Request",
      requestData: {
        name: undefined,
        specid: undefined,
      },
    }
  },
  computed: {
    specs() {
      return this.$store.state.openapi.specs
    },
  },
  methods: {
    saveRequestAs() {
      const userDidntSpecifySpec = this.$data.requestData.specid === undefined
      if (userDidntSpecifySpec) {
        this.$toast.error(this.$t("select_spec"), {
          icon: "error",
        })
        return
      }

      addRequest(
        this.$data.requestData.specid,
        {
          request: this.$store.state.request,
          response: this.$store.state.openapi.response,
        },
        this.$store
      ).then(
        res => {
          this.$store.commit("openapi/update", {
            id: this.$data.requestData.specid,
            spec: res.data,
          })
          this.hideModal()
        },
        err => console.log(err)
      )
      // this.hideModal()
    },
    hideModal() {
      this.$emit("hide-modal")
      this.$emit("hide-model") // for backward compatibility  // TODO: use fixed event
    },
  },
}
</script>
