<template>
  <div>
    <addOas :show="showModalAddOas" @hide-modal="displayModalAddOas(false)" />
    <!-- <editOas
            :show="showModalEdit"
            :oas="editingOas"
            @hide-modal="displayModalEditOas(false)"
        />
        <addOasRequest
            :show="showModalEdit"
            :oas="editingOas"
            @hide-modal="displayModalAddOasRequest(false)"
        />
        <editOasRequest
            :show="showModalEdit"
            :oas="editingOas"
            :request="editingRequest"
            @hide-modal="displayModalEditOasRequest(false)"
        /> -->
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
    addOasRequest: () => import("./addRequest"),
    editOasRequest: () => import("./editRequest"),
    VirtualList: () => import("vue-virtual-scroll-list"),
  },
  data() {
    return {
      showModalAddOas: false,
      showModalEditOas: false,
      showModalAddOasRequest: false,
      showModalEditOasRequest: false,
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
    displayModalAddOasRequest(shouldDisplay) {
      this.showModalAddOasRequest = shouldDisplay
    },
    displayModalEditOasRequest(shouldDisplay) {
      this.showModalEditOasRequest = shouldDisplay
    },
  },
}
</script>
