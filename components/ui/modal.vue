<template>
  <md-dialog :md-active.sync="show" :md-click-outside-to-close="false" @md-closed="closed">
    <md-dialog-title><slot name="header"></slot></md-dialog-title>
    <md-dialog-content><slot name="body"></slot></md-dialog-content>
    <md-dialog-actions>
      <slot name="footer"></slot>
    </md-dialog-actions>
  </md-dialog>
</template>
<script>
export default {
  props: {
    show: Boolean,
  },
  methods: {
    closed() {
      this.$emit("close")
    },
  },
}
</script>
