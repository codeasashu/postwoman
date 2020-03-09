<template>
  <div>
    <div class="md-layout">
      <div class="md-layout-item md-size-80">
        <md-button class="md-primary md-raised" @click="$emit('add_new')">
          <md-icon>add</md-icon>
          <span>{{ $t("add_new") }}</span>
        </md-button>
      </div>
      <div class="md-layout-item md-size-20">
        <md-button
          class="md-icon-button"
          @click="$emit('clear_all', $event)"
          v-tooltip.bottom="$t('clear')"
          ><md-icon>clear_all</md-icon></md-button
        >
      </div>
    </div>
    <div class="md-layout md-gutter" v-for="(header, index) in headers" :key="index">
      <div class="md-layout-item md-size-40">
        <md-field>
          <autocomplete
            :placeholder="$t('header_count', { count: index + 1 })"
            :source="commonHeaders"
            :spellcheck="false"
            :value="header.key"
            @input="$emit('set_key', { index: index, value: $event })"
            @keyup.prevent="$emit('set_route_query')"
            autofocus
          />
        </md-field>
      </div>
      <div class="md-layout-item md-size-40">
        <md-field>
          <md-input
            :placeholder="$t('value_count', { count: index + 1 })"
            :name="'value' + index"
            :value="header.value"
            @change="$emit('set_value', { index: index, value: $event.target.value })"
            @keyup.prevent="$emit('set_route_query')"
          />
        </md-field>
      </div>
      <div class="md-layout-item md-size-20">
        <md-button
          class="md-raised md-icon-button"
          @click="$emit('delete', index)"
          v-tooltip="$t('delete')"
          ><md-icon>delete</md-icon></md-button
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
