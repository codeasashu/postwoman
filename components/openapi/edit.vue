<template>
  <modal v-if="show" @close="hideModal">
    <div slot="header">
      <ul>
        <li>
          <div class="flex-wrap">
            <h3 class="title">{{ $t("new_spec") }}</h3>
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
          <label for="spectitle">{{ $t("spec_title") }}</label>
          <div>
            <input type="text" id="spectitle" v-model="title" :placeholder="$t('my_new_spec')" />
          </div>
        </li>
      </ul>
      <label for="specservers">{{ $t("spec_servers") }}</label>
      <ul v-for="(server, index) in servers" :key="index">
        <li>
          <input
            :name="'param' + index"
            v-model="server.url"
            placeholder="http://httpbin.org"
            autofocus
          />
        </li>
        <li>
          <button class="icon" @click="removeServer(index)" v-tooltip.bottom="$t('delete')">
            <i class="material-icons">delete</i>
          </button>
        </li>
      </ul>
      <ul>
        <li>
          <button class="icon" @click="addServer">
            <i class="material-icons">add</i>
            <span>{{ $t("add_new") }}</span>
          </button>
        </li>
      </ul>
      <ul>
        <li>
          <textarea v-model="description"></textarea>
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
          <button class="icon primary" @click="editSpec">
            {{ $t("save") }}
          </button>
        </span>
      </div>
    </div>
  </modal>
</template>
<script>
import { cloneDeep } from "lodash"
export default {
  props: {
    show: Boolean,
    specid: String,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      title: undefined,
      description: undefined,
      servers: [],
    }
  },
  computed: {
    spec() {
      let spec = this.$store.state.openapi.specs
        .filter(spec => spec["x-internal-id"] == this.specid)
        .pop()
      return cloneDeep(spec)
    },
    emptyServer() {
      let emptyServers = this.servers.filter(server => !server.url)
      return emptyServers == this.servers.length
    },
  },
  watch: {
    spec(val) {
      if (val) {
        this.title = val.info.title
        this.description = val.info.description
        this.servers = cloneDeep(val.servers)
      }
    },
  },
  mounted() {
    if (this.spec) {
      this.title = this.spec.info.title
      this.description = this.spec.info.description
      this.servers = cloneDeep(this.spec.servers)
    }
    //this.$store.commit('openapi/setInfo', {specid: this.specid, info: {title: val}})
    //this.$store.commit('openapi/setServers', { specid: this.specid, servers: val})
  },
  methods: {
    removeServer(index) {
      if (this.emptyServer || this.servers.length == 1) {
        this.$toast.error("Atleast one server is reqiured", { icon: "error" })
        return
      }
      this.servers.splice(index, 1)
    },
    addServer() {
      this.servers.push({ url: undefined })
    },
    editSpec() {
      this.$toast.clear()
      if (!this.$data.title) {
        this.$toast.error(this.$t("invalid_spec_name"), { icon: "error" })
        return
      }
      if (this.emptyServer) {
        this.$toast.error(this.$t("invalid_spec_url"), { icon: "error" })
        return
      }

      this.$store
        .dispatch("openapi/updateSpec", {
          specid: this.specid,
          data: {
            title: this.$data.title,
            servers: this.$data.servers.map(v => v.url),
            description: this.$data.description || "",
          },
        })
        .then(
          () => this.$toast.success(this.$t("success"), { icon: "done" }),
          err => this.$toast.error(err, { icon: "error" })
        )

      this.$emit("hide-modal")
    },
    hideModal() {
      this.$emit("hide-modal")
    },
  },
}
</script>
