<template>
  <v-row @click="selectRequest()">
    <v-col>
      <v-row>
        <v-col cols="2">
          <v-icon>insert_drive_file</v-icon>
        </v-col>
        <v-col cols="9">
          <!-- <v-btn class="icon"  v-tooltip="$t('use_request')"> -->
            
            <span>{{ request.name }}</span>
          <!-- </v-btn> -->
        </v-col>
        <v-col cols="1">
          <v-menu bottom left>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click="$emit('edit-request')">
                <v-list-item-title>{{ $t("edit") }}</v-list-item-title>
              </v-list-item>
              <v-list-item @click="removeRequest">
                <v-list-item-title>{{ $t("delete") }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <!-- <v-menu
              v-tooltip="$t('more')">
              <v-menu-content>
                <v-menu-item>
                  <v-btn @click="$emit('edit-request')">
                    <span>{{ $t("edit") }}</span>
                  </v-btn>
                </v-menu-item>
                <v-menu-item>
                  <v-btn @click="removeRequest">
                    <span>{{ $t("delete") }}</span>
                  </v-btn>
                </v-menu-item>
              </v-menu-content>
          </v-menu> -->
        </v-col>
    
      </v-row>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss">
ul {
  display: flex;
  flex-direction: column;
}

ul li {
  display: flex;
  padding-left: 16px;
  border-left: 1px solid var(--brd-color);
}
</style>

<script>
export default {
  props: {
    request: Object,
    collectionIndex: Number,
    folderIndex: Number,
    requestIndex: Number,
  },
  methods: {
    selectRequest() {
      this.$store.commit("postwoman/selectRequest", { request: this.request })
    },
    removeRequest() {
      if (!confirm("Are you sure you want to remove this request?")) return
      this.$store.commit("postwoman/removeRequest", {
        collectionIndex: this.collectionIndex,
        folderIndex: this.folderIndex,
        requestIndex: this.requestIndex,
      })
    },
  },
}
</script>
