<template>
  <modal :show="show" @close="hideModal">
    <div slot="header">
      <div class="flex-wrap">
        <h3 class="title">Import / Export Environment</h3>
      </div>
    </div>
    <div slot="body">
      <v-row>
        <v-col cols="4">
          <span
            v-tooltip="{
              content: !fb.currentUser ? $t('login_first') : $t('replace_current'),
            }"
          >
            <v-btn
              depressed
              small
              :disabled="!fb.currentUser"
              class="icon"
              @click="syncEnvironments"
            >
              <i class="material-icons">folder_shared</i>
              <span>{{ $t("import_from_sync") }}</span>
            </v-btn>
          </span>
        </v-col>
        <v-col cols="4">
          <v-btn
            depressed
            small
            class="icon"
            @click="openDialogChooseFileToReplaceWith"
            v-tooltip="$t('replace_current')"
          >
            <i class="material-icons">create_new_folder</i>
            <span>{{ $t("replace_json") }}</span>
            <input
              type="file"
              @change="replaceWithJSON"
              style="display: none;"
              ref="inputChooseFileToReplaceWith"
              accept="application/json"
            />
          </v-btn>
        </v-col>
        <v-col cols="4">
          <v-btn
            depressed
            small
            class="icon"
            @click="openDialogChooseFileToImportFrom"
            v-tooltip="$t('preserve_current')"
          >
            <i class="material-icons">folder_special</i>
            <span>{{ $t("import_json") }}</span>
            <input
              type="file"
              @change="importFromJSON"
              style="display: none;"
              ref="inputChooseFileToImportFrom"
              accept="application/json"
            />
          </v-btn>
        </v-col>
      </v-row>
      <v-textarea v-model="environmentJson" rows="8"></v-textarea>
    </div>
    <div slot="footer">
      <div class="flex-wrap">
        <span></span>
        <span>
          <v-btn class="icon" @click="hideModal">
            {{ $t("cancel") }}
          </v-btn>
          <v-btn class="icon primary" @click="exportJSON" v-tooltip="$t('download_file')">
            {{ $t("export") }}
          </v-btn>
        </span>
      </div>
    </div>
  </modal>
</template>

<script>
import { fb } from "../../functions/fb"

export default {
  data() {
    return {
      fb,
    }
  },
  props: {
    show: Boolean,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  computed: {
    environmentJson() {
      return JSON.stringify(this.$store.state.postwoman.environments, null, 2)
    },
  },
  methods: {
    hideModal() {
      this.$emit("hide-modal")
    },
    openDialogChooseFileToReplaceWith() {
      this.$refs.inputChooseFileToReplaceWith.click()
    },
    openDialogChooseFileToImportFrom() {
      this.$refs.inputChooseFileToImportFrom.click()
    },
    replaceWithJSON() {
      let reader = new FileReader()
      reader.onload = event => {
        let content = event.target.result
        let environments = JSON.parse(content)
        this.$store.commit("postwoman/replaceEnvironments", environments)
      }
      reader.readAsText(this.$refs.inputChooseFileToReplaceWith.files[0])
      this.fileImported()
    },
    importFromJSON() {
      let reader = new FileReader()
      reader.onload = event => {
        let content = event.target.result
        let environments = JSON.parse(content)
        let confirmation = this.$t("file_imported")
        this.$store.commit("postwoman/importAddEnvironments", {
          environments,
          confirmation,
        })
      }
      reader.readAsText(this.$refs.inputChooseFileToImportFrom.files[0])
    },
    exportJSON() {
      let text = this.environmentJson
      text = text.replace(/\n/g, "\r\n")
      let blob = new Blob([text], {
        type: "text/json",
      })
      let anchor = document.createElement("a")
      anchor.download = "postwoman-environment.json"
      anchor.href = window.URL.createObjectURL(blob)
      anchor.target = "_blank"
      anchor.style.display = "none"
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      this.$toast.success(this.$t("download_started"), {
        icon: "done",
      })
    },
    syncEnvironments() {
      this.$store.commit("postwoman/replaceEnvironments", fb.currentEnvironments)
      this.fileImported()
    },
    fileImported() {
      this.$toast.info(this.$t("file_imported"), {
        icon: "folder_shared",
      })
    },
  },
}
</script>
