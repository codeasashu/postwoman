<template>
  <div>
    <v-row>
      <v-col cols="10">
        <v-btn class="v-primary v-raised" @click="$emit('add_new')">
          <v-icon>add</v-icon>
          <span>{{ $t("add_new") }}</span>
        </v-btn>
      </v-col>
      <v-col cols="2">
        <v-btn
          class="v-icon-button"
          @click="$emit('clear_all', $event)"
          v-tooltip.bottom="$t('clear')"
          ><v-icon>clear_all</v-icon></v-btn
        >
      </v-col>
    </v-row>
    <v-row v-for="(header, index) in headers" :key="index">
      <v-col cols="5">
        <v-input>
          <autocomplete
            :placeholder="$t('header_count', { count: index + 1 })"
            :source="commonHeaders"
            :spellcheck="false"
            :value="header.key"
            @input="setHeaderKey(index, $event)"
            @keyup.prevent="$emit('set_route_query')"
            autofocus
          />
        </v-input>
      </v-col>
      <v-col cols="5">
        <v-input>
          <v-text-field
            :placeholder="$t('value_count', { count: index + 1 })"
            :name="'value' + index"
            :value="header.value"
            @change="setHeaderValue(index, $event)"
            @keyup.prevent="$emit('set_route_query')"
          />
        </v-input>
      </v-col>
      <v-col cols="2">
        <v-btn
          class="v-raised v-icon-button"
          @click="$emit('delete', index)"
          v-tooltip="$t('delete')"
          ><v-icon>delete</v-icon></v-btn
        >
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  components: {
    autocomplete: () => import("../../components/ui/autocomplete"),
  },
  props: {
    commonHeaders: Array[String],
    headers: Array[Object],
  },
  methods: {
    setHeaderKey(index, event) {
      this.$store.commit("setKeyHeader", { index: index, value: event })
    },
    setHeaderValue(index, event) {
      this.$store.commit("setValueHeader", { index: index, value: event })
    },
  },
}
</script>
