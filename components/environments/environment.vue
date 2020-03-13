<template>
  <v-row @click="$emit('select-environment')">
    <v-col cols="1">
      <v-icon>insert_drive_file</v-icon>
    </v-col>
    <v-col cols="9">
      <span>{{ environment.name }}</span>
    </v-col>
    <v-col cols="2">
      <kebob-menu float="right">
        <template slot="menu">
          <v-list>
            <v-list-item @click="$emit('edit-environment')">
              <v-list-item-title><v-icon>edit</v-icon>{{ $t("edit") }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="removeEnvironment">
              <v-list-item-title><v-icon>delete</v-icon>{{ $t("delete") }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </template>
      </kebob-menu>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    environment: Object,
    environmentIndex: Number,
  },
  components: {
    kebobMenu: () => import("../ui/kebobMenu"),
  },
  methods: {
    removeEnvironment() {
      if (!confirm("Are you sure you want to remove this environment?")) return
      this.$store.commit("postwoman/removeEnvironment", this.environmentIndex)
    },
  },
}
</script>
