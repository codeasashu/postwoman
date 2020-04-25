const DEFAULT_BRANCH = "develop"

export const state = () => ({
  gitlab: {
    repo: undefined,
    commit: undefined,
    branch: DEFAULT_BRANCH,
    repos: [],
  },
})

export const mutations = {
  setRepos(state, { item, repos }) {
    state[item].repos = repos
  },

  setRepo(state, { item, repo }) {
    state[item].repo = repo
  },

  setBranch(state, { item, branch }) {
    state[item].branch = branch || DEFAULT_BRANCH
  },

  lastCommit(state, { item, commit }) {
    state[item].commit = commit
  },
}

export const actions = {
  async gitlabListRepos({ commit }) {
    return await this.$api.gitlab.listRepos().then(
      ({ data }) => commit("setRepos", { item: "gitlab", repos: data }),
      err => console.error("[API ERROR]", err)
    )
  },

  async gitlabChangeRepo({ state, commit }, { project_id, branch }) {
    branch = branch || DEFAULT_BRANCH
    return await this.$api.gitlab.setRepo(project_id, branch).then(
      ({ data }) => {
        commit("setRepo", { item: "gitlab", repo: data.repo })
        commit("setBranch", { item: "gitlab", branch: data.branch })
        return data
      },
      err => {
        console.error("[API ERROR]", err)
        return err
      }
    )
  },

  async commitSpecGitlab({ commit }, { specid, version }) {
    return await this.$api.gitlab.commitSpec(specid, version).then(
      ({ data }) => commit("lastCommit", { item: "gitlab", commit: data }),
      err => console.error("[API ERROR]", err)
    )
  },
}
