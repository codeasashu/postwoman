<template>
  <v-dialog
    v-model="show"
    width="600"
    :v-click-outside-to-close="false"
    @v-closed="closed"
    :persistent="persistent"
  >
    <v-card>
      <v-card-title class="headline grey lighten-2"><slot name="header"></slot></v-card-title>
      <v-card-text><slot name="body"></slot></v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <slot name="footer"></slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    show: Boolean,
    persistent: Boolean,
  },
  methods: {
    closed() {
      this.$emit("close")
    },
  },
}
</script>
