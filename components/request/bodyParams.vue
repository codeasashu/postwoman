<template>
  <div>
    <v-row>
      <v-col>
        <h3>{{ $t("parameter_list") }}</h3>
      </v-col>
    </v-row>
    <!-- <div class="preview">
            <v-textarea
                id="reqParamList"
                readonly
                v-textarea-auto-height="rawRequestBody"
                v-model="rawRequestBody"
                :placeholder="$t('add_one_parameter')"
                rows="1"></v-textarea>
        </div> -->
    <v-row v-for="(param, index) in bodyParams" :key="index">
      <v-col cols="5">
        <v-input>
          <v-text-field
            :placeholder="'key ' + (index + 1)"
            :name="'bparam' + index"
            v-if="param"
            :value="param.key"
            @change="$emit('set_key', { index: index, value: $event })"
            @keyup.prevent="$emit('set_route_query')"
            autofocus
          />
        </v-input>
      </v-col>
      <v-col cols="5">
        <v-input>
          <v-text-field
            :placeholder="'value ' + (index + 1)"
            :name="'bvalue' + index"
            v-if="param"
            :value="param.value"
            @change="$emit('set_value', { index: index, value: $event })"
            @keyup.prevent="$emit('set_route_query')"
            autofocus
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
    <v-row>
      <v-btn class="v-primary v-raised" @click="$emit('add_new')">
        <v-icon>add</v-icon>
        <span>{{ $t("add_new") }}</span>
      </v-btn>
    </v-row>
  </div>
</template>
<script>
export default {
  props: {
    bodyParams: Array[Object],
  },
}
</script>
