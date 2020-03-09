<template>
  <div>
    <div class="md-layout">
      <div class="md-layout-item md-size-80">
        <h3>{{ $t("parameters") }}</h3>
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
    <div class="md-layout md-gutter" v-for="(param, index) in params" :key="index">
      <div class="md-layout-item md-size-40">
        <md-field>
          <md-input
            :placeholder="$t('parameter_count', { count: index + 1 })"
            :name="'param' + index"
            v-if="param"
            :value="param.key"
            @change="$emit('set_key', { index: index, value: $event.target.value })"
            autofocus
          />
        </md-field>
      </div>
      <div class="md-layout-item md-size-40">
        <md-field>
          <md-input
            :placeholder="$t('value_count', { count: index + 1 })"
            :name="'value' + index"
            :value="param.value"
            @change="$emit('set_value', { index: index, value: $event.target.value })"
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
    <div class="md-layout">
      <md-button class="md-primary md-raised" @click="$emit('add_new')">
        <md-icon>add</md-icon>
        <span>{{ $t("add_new") }}</span>
      </md-button>
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
