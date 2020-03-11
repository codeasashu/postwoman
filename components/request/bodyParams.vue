<template>
    <div>
        <div class="v-layout">
            <div class="v-layout-item v-size-100">
                <h3>{{ $t("parameter_list") }}</h3>
            </div>
        </div>
        <!-- <div class="preview">
            <v-textarea
                id="reqParamList"
                readonly
                v-textarea-auto-height="rawRequestBody"
                v-model="rawRequestBody"
                :placeholder="$t('add_one_parameter')"
                rows="1"></v-textarea>
        </div> -->
        <div class="v-layout v-gutter" v-for="(param, index) in bodyParams" :key="index">
            <div class="v-layout-item v-size-40">
                <v-input>
                    <v-text-field
                        :placeholder="'key ' + (index + 1)"
                        :name="'bparam' + index"
                        v-if="param"
                        :value="param.key"
                        @change="$emit('set_key', { index: index, value: $event.target.value })"
                        @keyup.prevent="$emit('set_route_query')"
                        autofocus
                    />
                </v-input>
            </div>
            <div class="v-layout-item v-size-40">
                <v-input>
                    <v-text-field
                        :placeholder="'value ' + (index + 1)"
                        :name="'bvalue' + index"
                        v-if="param"
                        :value="param.value"
                        @change="$emit('set_value', { index: index, value: $event.target.value })"
                        @keyup.prevent="$emit('set_route_query')"
                        autofocus
                    />
                </v-input>
            </div>
            <div class="v-layout-item v-size-20">
                <v-btn
                class="v-raised v-icon-button"
                @click="$emit('delete', index)"
                v-tooltip="$t('delete')"
                ><v-icon>delete</v-icon></v-btn>
            </div>
        </div>
        <div class="v-layout">
            <v-btn class="v-primary v-raised" @click="$emit('add_new')">
                <v-icon>add</v-icon>
                <span>{{ $t("add_new") }}</span>
            </v-btn>
        </div>
    </div>
</template>
<script>
export default {
  props: {
    bodyParams: Array[Object],
  }
}
</script>
