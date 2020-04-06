<template>
  <pw-section class="green" icon="response" :label="$t('responses')" ref="response">
    <ul>
      <div class="show-on-large-screen">
        <li id="filter-response">
          <input
            aria-label="Search"
            type="search"
            :placeholder="$t('search')"
            v-model="filterText"
          />
        </li>
        <button class="icon">
          <i class="material-icons">search</i>
        </button>
      </div>
    </ul>
    <virtual-list
      class="virtual-list"
      :class="{ filled: filteredResponse.length }"
      :size="185"
      :remain="Math.min(5, filteredResponse.length)"
    >
      <ul v-for="(entry, index) in filteredResponse" :key="index" class="entry">
        <div class="show-on-large-screen">
          <button
            class="icon"
            :class="{ stared: entry.star }"
            @click="toggleStar(entry)"
            v-tooltip="{
              content: !entry.star ? $t('add_star') : $t('remove_star'),
            }"
          >
            <i class="material-icons">
              {{ entry.star ? "star" : "star_border" }}
            </i>
          </button>
          <li>
            <input
              :aria-label="$t('label')"
              type="text"
              readonly
              :value="entry.label"
              :placeholder="$t('no_label')"
              class="bg-color"
            />
          </li>
          <v-popover>
            <button class="tooltip-target icon" v-tooltip="$t('options')">
              <i class="material-icons">more_vert</i>
            </button>
            <template slot="popover">
              <div>
                <button
                  class="icon"
                  :id="'use-button#' + index"
                  @click="useResponse(entry)"
                  :aria-label="$t('edit')"
                  v-close-popover
                >
                  <i class="material-icons">restore</i>
                  <span>{{ $t("restore") }}</span>
                </button>
              </div>
              <div>
                <button
                  class="icon"
                  :id="'delete-button#' + index"
                  @click="deleteResponse(entry)"
                  :aria-label="$t('delete')"
                  v-close-popover
                >
                  <i class="material-icons">delete</i>
                  <span>{{ $t("delete") }}</span>
                </button>
              </div>
            </template>
          </v-popover>
        </div>
        <div class="show-on-large-screen">
          <li class="method-list-item">
            <input
              :aria-label="$t('content_type')"
              type="text"
              readonly
              :value="entry.headers['content-type']"
              :class="findEntryStatus(entry).className"
              :style="{ '--status-code': entry.status }"
            />
            <span
              class="entry-status-code"
              :class="findEntryStatus(entry).className"
              :style="{ '--status-code': entry.status }"
              >{{ entry.status }}</span
            >
          </li>
        </div>
      </ul>
    </virtual-list>
    <ul :class="{ hidden: filteredResponse.length != 0 || response.length === 0 }">
      <li>
        <label>{{ $t("nothing_found") }} "{{ filterText }}"</label>
      </li>
    </ul>
    <p v-if="response.length === 0" class="info">
      {{ $t("response_empty") }}
    </p>
    <div v-if="response.length !== 0">
      <div class="flex-wrap" v-if="!isClearingresponse">
        <button
          class="icon"
          id="clear-response-button"
          :disabled="response.length === 0"
          @click="enableresponseClearing"
        >
          <i class="material-icons">clear_all</i>
          <span>{{ $t("clear_all") }}</span>
        </button>
        <v-popover>
          <button class="tooltip-target icon" v-tooltip="$t('sort')">
            <i class="material-icons">sort</i>
          </button>
          <template slot="popover">
            <div>
              <button class="icon" @click="sort_by_label()" v-close-popover>
                <i class="material-icons">sort_by_alpha</i>
                <span>{{ $t("label") }}</span>
              </button>
            </div>
            <div>
              <button class="icon" @click="sort_by_time()" v-close-popover>
                <i class="material-icons">access_time</i>
                <span>{{ $t("time") }}</span>
              </button>
            </div>
            <div>
              <button class="icon" @click="sort_by_status_code()" v-close-popover>
                <i class="material-icons">assistant</i>
                <span>{{ $t("status") }}</span>
              </button>
            </div>
            <div>
              <button class="icon" @click="sort_by_content_type()" v-close-popover>
                <i class="material-icons">language</i>
                <span>{{ $t("content_type") }}</span>
              </button>
            </div>
          </template>
        </v-popover>
      </div>
      <div class="flex-wrap" v-else>
        <label for="clear-response-button" class="info">
          {{ $t("are_you_sure") }}
        </label>
        <div>
          <button
            class="icon"
            id="confirm-clear-response-button"
            @click="clearresponse"
            v-tooltip="$t('yes')"
          >
            <i class="material-icons">done</i>
          </button>
          <button
            class="icon"
            id="reject-clear-response-button"
            @click="disableresponseClearing"
            v-tooltip="$t('no')"
          >
            <i class="material-icons">close</i>
          </button>
        </div>
      </div>
    </div>
  </pw-section>
</template>

<style scoped lang="scss">
.virtual-list {
  max-height: calc(100vh - 294px);

  [readonly] {
    cursor: default;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.stared {
  color: #f8e81c !important;
}

ul,
ol {
  flex-direction: column;
}

.method-list-item {
  position: relative;

  span {
    position: absolute;
    top: 10px;
    right: 10px;
    font-family: "Roboto Mono", monospace;
    font-weight: 400;
    background-color: transparent;
    padding: 2px 6px;
    border-radius: 8px;
  }
}

.entry {
  border-bottom: 1px dashed var(--brd-color);
  padding: 0 0 8px;
}

@media (max-width: 720px) {
  .virtual-list.filled {
    min-height: 320px;
  }

  .labels {
    display: none;
  }
}
</style>

<script>
import { findStatusGroup } from "../../pages/index"
import { fb } from "../../functions/fb"

const updateOnLocalStorage = (propertyName, property) =>
  window.localStorage.setItem(propertyName, JSON.stringify(property))

export default {
  components: {
    "pw-section": () => import("../layout/section"),
    VirtualList: () => import("vue-virtual-scroll-list"),
  },
  data() {
    return {
      response:
        fb.currentUser !== null
          ? fb.currentresponse
          : JSON.parse(window.localStorage.getItem("response")) || [],
      filterText: "",
      showFilter: false,
      isClearingresponse: false,
      reverse_sort_label: false,
      reverse_sort_time: false,
      reverse_sort_status_code: false,
      reverse_sort_content_type: false,
      reverse_sort_path: false,
      showMore: false,
    }
  },
  computed: {
    currentResponses() {
      return this.$store.state.design.responses
    },
    filteredResponse() {
      this.response = this.currentResponses || []
      return this.response.filter(entry => {
        const filterText = this.filterText.toLowerCase()
        return Object.keys(entry).some(key => {
          let value = entry[key]
          value = typeof value !== "string" ? value.toString() : value
          return value.toLowerCase().includes(filterText)
        })
      })
    },
  },
  methods: {
    clearresponse() {
      this.$store.commit("design/clearResponse")
      //this.response = []
      this.filterText = ""
      this.disableresponseClearing()
      //updateOnLocalStorage("response", this.response)
      this.$toast.error(this.$t("responses_deleted"), {
        icon: "delete",
      })
    },
    useResponse(entry) {
      //this.$emit("useResponse", entry)
      // maybe use this later
      this.$store.commit("design/selectResponse", entry)
    },
    findEntryStatus(entry) {
      const foundStatusGroup = findStatusGroup(entry.status)
      return (
        foundStatusGroup || {
          className: "",
        }
      )
    },
    deleteresponse(entry) {
      this.$store.commit("design/deleteResponse", entry)
      //this.response.splice(this.response.indexOf(entry), 1)
      if (this.response.length === 0) {
        this.filterText = ""
      }
      //updateOnLocalStorage("response", this.response)
      this.$toast.error(this.$t("deleted"), {
        icon: "delete",
      })
    },
    addEntry(entry) {
      this.$store.commit("design/addResponse", entry)
      //   this.response.push(entry)
      //   updateOnLocalStorage("response", this.response)
    },
    enableresponseClearing() {
      if (!this.response || !this.response.length) return
      this.isClearingresponse = true
    },
    disableresponseClearing() {
      this.isClearingresponse = false
    },
    sort_by_time() {
      let byDate = this.response.slice(0)
      byDate.sort((a, b) => {
        let date_a = a.date.split("/")
        let date_b = b.date.split("/")
        let time_a = a.time.split(":")
        let time_b = b.time.split(":")
        let final_a = new Date(date_a[2], date_a[1], date_a[0], time_a[0], time_a[1], time_a[2])
        let final_b = new Date(date_b[2], date_b[1], date_b[0], time_b[0], time_b[1], time_b[2])
        if (this.reverse_sort_time) return final_b - final_a
        else return final_a - final_b
      })
      this.response = byDate
      this.reverse_sort_time = !this.reverse_sort_time
    },
    sort_by_status_code() {
      let byCode = this.response.slice(0)
      byCode.sort((a, b) => {
        if (this.reverse_sort_status_code) return b.status - a.status
        else return a.status - b.status
      })
      this.response = byCode
      this.reverse_sort_status_code = !this.reverse_sort_status_code
    },
    sort_by_content_type() {
      let byConType = this.response.slice(0)
      byConType.sort((a, b) => {
        if (this.reverse_sort_content_type)
          return a.content_type === b.content_type ? 0 : +(a.content_type < b.content_type) || -1
        else return a.content_type === b.content_type ? 0 : +(a.content_type > b.content_type) || -1
      })
      this.response = byConType
      this.reverse_sort_content_type = !this.reverse_sort_content_type
    },
    sort_by_label() {
      let byLabel = this.response.slice(0)
      byLabel.sort((a, b) => {
        if (this.reverse_sort_label) return a.label === b.label ? 0 : +(a.label < b.label) || -1
        else return a.label === b.label ? 0 : +(a.label > b.label) || -1
      })
      this.response = byLabel
      this.reverse_sort_label = !this.reverse_sort_label
    },
    toggleCollapse() {
      this.showMore = !this.showMore
    },
    toggleStar(entry) {
      //entry.star = !entry.star
      this.$store.commit("design/starResponse", entry)
      //updateOnLocalStorage("response", this.response)
    },
  },
}
</script>
