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
    <v-row v-for="(param, index) in params" :key="index">
      <v-col cols="5">
        <v-input>
          <v-text-field
            :placeholder="$t('parameter_count', { count: index + 1 })"
            :name="'param' + index"
            v-if="param"
            :value="param.key"
            @change="$emit('set_key', { index: index, value: $event })"
            autofocus
          />
        </v-input>
      </v-col>
      <v-col cols="5">
        <v-input>
          <v-text-field
            :placeholder="$t('value_count', { count: index + 1 })"
            :name="'value' + index"
            :value="param.value"
            @change="$emit('set_value', { index: index, value: $event })"
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
  props: {
    params: Array[Object],
  },
  methods: {
    changeKey(index, event) {
      console.log("index", index, event)
    },
  },
}
</script>
