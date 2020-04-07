<template>
  <div>
    <p>Please Select a spec above or</p>
    <button @click="createSpec" id="createSpec">
      {{ $t("create_spec") }}
      <span>
        <i class="material-icons">send</i>
      </span>
    </button>
    <addOpenapi :show="showModalAdd" @hide-modal="showModalAdd = !showModalAdd" />
  </div>
</template>
<script>
export default {
  components: {
    addOpenapi: () => import("../../components/openapi/add"),
  },
  data() {
    return {
      showModalAdd: false,
    }
  },
  methods: {
    createSpec() {
      this.showModalAdd = true
    },
  },
}
</script>
