<template>
  <modal v-if="show" @close="hideModal">
    <div slot="header">
      <ul>
        <li>
          <div class="flex-wrap">
            <h3 class="title">{{ $t("new_spec") }}</h3>
            <div>
              <button class="icon" @click="hideModal">
                <i class="material-icons">close</i>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div slot="body">
      <ul>
        <li>
          <input type="text" v-model="title" :placeholder="$t('my_new_spec')" />
        </li>
        <li>
          <input
            type="url"
            v-model="url"
            placeholder="http://httpbin.org"
            @keyup.enter="addNewSpec"
          />
        </li>
        <li>
          <textarea v-model="description"></textarea>
        </li>
      </ul>
    </div>
    <div slot="footer">
      <div class="flex-wrap">
        <span></span>
        <span>
          <button class="icon" @click="hideModal">
            {{ $t("cancel") }}
          </button>
          <button class="icon primary" @click="addNewSpec">
            {{ $t("save") }}
          </button>
        </span>
      </div>
    </div>
  </modal>
</template>
<script>
import { fb } from "../../functions/fb"

export default {
  props: {
    show: Boolean,
  },
  components: {
    modal: () => import("../../components/ui/modal"),
  },
  data() {
    return {
      title: undefined,
      url: undefined,
      description: undefined,
    }
  },
  methods: {
    addNewSpec() {
      if (!this.$data.title) {
        this.$toast.info($t("invalid_spec_name"))
        return
      }
      if (!this.$data.url) {
        this.$toast.info($t("invalid_spec_url"))
        return
      }

      this.$store
        .dispatch("openapi/addSpec", {
          title: this.$data.title,
          url: this.$data.url,
          description: this.$data.description || "",
        })
        .then(
          () =>
            this.$toast.success(this.$t("success"), {
              icon: "done",
            }),
          err => console.error(err)
        )

      this.$emit("hide-modal")
    },
    hideModal() {
      this.$emit("hide-modal")
    },
  },
}
</script>
