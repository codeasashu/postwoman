<template>
  <div>
    <pw-section :label="$t('gitlab')" ref="gitlab">
      <ul>
        <li>
          <label>{{ $t("select_repo") }}</label>
          <span class="select-wrapper">
            <select id="apiversion" v-model="selectedRepo" :disabled="refreshing || saving">
              <option selected :value="undefined">{{ $t("select_repo") }}</option>
              <option v-for="repo in repositories" :key="repo.id" :value="repo.id">
                {{ repo.name }}
              </option>
            </select>
          </span>
          <div class="content">
            <button
              @click="refresh"
              :disabled="refreshing || saving"
              v-tooltip="$t('refresh_repos')"
            >
              <i class="material-icons">loop</i>
            </button>
            <button @click="changeRepo" :disabled="refreshing || saving">
              {{ $t("change_repo") }}
            </button>
          </div>
        </li>
      </ul>
    </pw-section>
  </div>
</template>
<script>
export default {
  components: {
    "pw-section": () => import("../../components/layout/section"),
  },
  async asyncData({ store, app }) {
    if (store.state.integration.gitlab.repos.length == 0) {
      await store.dispatch("integration/gitlabListRepos")
    }
  },
  data() {
    return {
      selectedRepo: undefined,
      selectedBranch: undefined,
      saving: false,
      refreshing: false,
    }
  },
  computed: {
    repositories() {
      return this.$store.state.integration.gitlab.repos
    },
  },
  mounted() {
    this.selectedRepo = this.$store.state.integration.gitlab.repo
    this.selectedBranch = this.$store.state.integration.gitlab.branch
  },
  methods: {
    async refresh() {
      this.refreshing = true
      this.$toast.clear()
      await this.$store.dispatch("integration/gitlabListRepos").then(
        () => this.$toast.success(this.$t("refreshed"), { icon: "done" }),
        err => this.$toast.error(err, { icon: "error" })
      )
      this.refreshing = false
    },
    async changeRepo() {
      this.$toast.clear()
      this.saving = true
      if (this.selectedRepo) {
        await this.$store
          .dispatch("integration/gitlabChangeRepo", {
            project_id: this.selectedRepo,
            branch: this.selectedBranch,
          })
          .then(
            () => this.$toast.success(this.$t("saved"), { icon: "done" }),
            err => this.$toast.error(err, { icon: "error" })
          )
        this.saving = false
      }
    },
  },
}
</script>
