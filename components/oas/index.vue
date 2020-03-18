<template>
  <div>
    <addOas :show="showModalAddOas" @hide-modal="displayModalAddOas(false)" />
    <edit-oas
      v-if="editingOas"
      :show="showModalEditOas"
      :oas="editingOas"
      @hide-modal="displayModalEditOas(false)"
    />
    <v-row>
      <v-col class="oas-header" cols="50">
        <v-btn small color="primary" @click="displayModalAddOas(true)">
          <span>{{ $t("create_collection") }}</span>
        </v-btn>
      </v-col>
    </v-row>
    <v-divider></v-divider>
    <virtual-list
      class="virtual-list v-layout-item v-size-100"
      :class="{ filled: oascollection.length }"
      :size="652"
      :remain="Math.min(5, oascollection.length)"
    >
      <v-expansion-panels :accordion="true" focusable tile>
        <v-expansion-panel v-for="oas in oascollection" :key="oas.id" class="v-list-item-expand">
          <v-expansion-panel-header>
            {{ oas.info.title }} ({{ oas.servers[0]["url"] }})
            <template v-slot:actions>
              <kebob-menu>
                <template slot="menu">
                  <v-list>
                    <v-list-item @click="editOas(oas)">
                      <v-list-item-title>{{ $t("edit") }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="removeOas(oas)">
                      <v-list-item-title>{{ $t("delete") }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </template>
              </kebob-menu>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <p>Nothing here</p>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </virtual-list>
  </div>
</template>
<script>
export default {
  components: {
    addOas: () => import("./add"),
    editOas: () => import("./edit"),
    VirtualList: () => import("vue-virtual-scroll-list"),
    kebobMenu: () => import("../../components/ui/kebobMenu"),
  },
  data() {
    return {
      showModalAddOas: false,
      showModalEditOas: false,
      editingOas: undefined,
    }
  },
  computed: {
    oascollection() {
      return this.$store.state.openapispec.openapis
    },
  },
  methods: {
    displayModalAddOas(shouldDisplay) {
      this.showModalAddOas = shouldDisplay
    },
    displayModalEditOas(shouldDisplay) {
      this.showModalEditOas = shouldDisplay
    },
    editOas(oas) {
      this.$data.editingOas = oas
      this.displayModalEditOas(true)
    },
    removeOas(oas) {
      if (!confirm("Are you sure you want to remove this Collection?")) return
      this.$store.commit("openapispec/remove", oas)
    },
  },
}
</script>
