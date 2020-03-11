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
    <div class="v-layout v-gutter" v-for="(param, index) in params" :key="index">
      <div class="v-layout-item v-size-40">
        <v-input>
          <v-text-field
            :placeholder="$t('parameter_count', { count: index + 1 })"
            :name="'param' + index"
            v-if="param"
            :value="param.key"
            @change="$emit('set_key', { index: index, value: $event.target.value })"
            autofocus
          />
        </v-input>
      </div>
      <div class="v-layout-item v-size-40">
        <v-input>
          <v-text-field
            :placeholder="$t('value_count', { count: index + 1 })"
            :name="'value' + index"
            :value="param.value"
            @change="$emit('set_value', { index: index, value: $event.target.value })"
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
  props: {
    params: Array[Object],
  },
}
</script>
