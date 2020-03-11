<template>
  <div>
    <div class="v-layout">
      <div class="v-layout-item v-size-80">
        <v-btn class="v-primary v-raised" @click="$emit('add_new')">
          <v-icon>add</v-icon>
          <span>{{ $t("add_new") }}</span>
        </v-btn>
      </div>
      <div class="v-layout-item v-size-20">
        <v-btn
          class="v-icon-button"
          @click="$emit('clear_all', $event)"
          v-tooltip.bottom="$t('clear')"
          ><v-icon>clear_all</v-icon></v-btn
        >
      </div>
    </div>
    <div class="v-layout v-gutter" v-for="(header, index) in headers" :key="index">
      <div class="v-layout-item v-size-40">
        <v-input>
          <autocomplete
            :placeholder="$t('header_count', { count: index + 1 })"
            :source="commonHeaders"
            :spellcheck="false"
            :value="header.key"
            @input="$emit('set_key', { index: index, value: $event })"
            @keyup.prevent="$emit('set_route_query')"
            autofocus
          />
        </v-input>
      </div>
      <div class="v-layout-item v-size-40">
        <v-input>
          <v-text-field
            :placeholder="$t('value_count', { count: index + 1 })"
            :name="'value' + index"
            :value="header.value"
            @change="$emit('set_value', { index: index, value: $event.target.value })"
            @keyup.prevent="$emit('set_route_query')"
          />
        </v-input>
      </div>
      <div class="v-layout-item v-size-20">
        <v-btn
          class="v-raised v-icon-button"
          @click="$emit('delete', index)"
          v-tooltip="$t('delete')"
          ><v-icon>delete</v-icon></v-btn
        >
      </div>
    </div>
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
}
</script>
