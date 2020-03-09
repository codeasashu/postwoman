<template>
    <div>
        <div class="md-layout">
            <div class="md-layout-item md-size-100">
                <h3>{{ $t("parameter_list") }}</h3>
            </div>
        </div>
        <!-- <div class="preview">
            <md-textarea
                id="reqParamList"
                readonly
                v-textarea-auto-height="rawRequestBody"
                v-model="rawRequestBody"
                :placeholder="$t('add_one_parameter')"
                rows="1"></md-textarea>
        </div> -->
        <div class="md-layout md-gutter" v-for="(param, index) in bodyParams" :key="index">
            <div class="md-layout-item md-size-40">
                <md-field>
                    <md-input
                        :placeholder="'key ' + (index + 1)"
                        :name="'bparam' + index"
                        v-if="param"
                        :value="param.key"
                        @change="$emit('set_key', { index: index, value: $event.target.value })"
                        @keyup.prevent="$emit('set_route_query')"
                        autofocus
                    />
                </md-field>
            </div>
            <div class="md-layout-item md-size-40">
                <md-field>
                    <md-input
                        :placeholder="'value ' + (index + 1)"
                        :name="'bvalue' + index"
                        v-if="param"
                        :value="param.value"
                        @change="$emit('set_value', { index: index, value: $event.target.value })"
                        @keyup.prevent="$emit('set_route_query')"
                        autofocus
                    />
                </md-field>
            </div>
            <div class="md-layout-item md-size-20">
                <md-button
                class="md-raised md-icon-button"
                @click="$emit('delete', index)"
                v-tooltip="$t('delete')"
                ><md-icon>delete</md-icon></md-button>
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
    bodyParams: Array[Object],
  }
}
</script>
