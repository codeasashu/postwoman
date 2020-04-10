<template>
  <div>
    <button class="icon" @click="logout" v-close-popover>
      <i class="material-icons">exit_to_app</i>
      <span>{{ $t("logout") }}</span>
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      const self = this
      console.log("logging ")
      this.$auth.logout().then(
        () =>
          self.$toast.info(this.$t("logged_out"), {
            icon: "vpn_key",
          }),
        err =>
          self.$toast.show(err.message || err, {
            icon: "error",
          })
      )
    },
  },
}
</script>
