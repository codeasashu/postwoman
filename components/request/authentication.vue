<template>
  <div>
    <div class="md-layout">
      <div class="md-layout-item md-size-80">
        <h3>{{ $t("authentication") }}</h3>
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
    <div class="md-layout md-gutter">
      <div class="md-layout-item md-size-30">
        <span class="select-wrapper">
          <md-field>
            <md-select id="auth" v-model="reauth">
              <md-option value="None">None</md-option>
              <md-option value="Basic Auth">Basic Auth</md-option>
              <md-option value="Bearer Token">Bearer Token</md-option>
              <md-option value="OAuth 2.0">OAuth 2.0</md-option>
            </md-select>
          </md-field>
        </span>
      </div>
      <div class="md-layout-item md-size-70">
        <!-- Basic auth -->
        <div class="basic-auth md-layout" v-if="reauth === 'Basic Auth'">
          <div class="md-layout-item md-size-100">
            <md-field>
              <md-input placeholder="User" name="http_basic_user" v-model="httpUser" />
            </md-field>
          </div>
          <div class="md-layout-item md-size-100">
            <md-field>
              <md-input
                placeholder="Password"
                name="http_basic_passwd"
                :type="passwordFieldType"
                v-model="httpPassword"
              />
            </md-field>
          </div>
        </div>

        <!-- Bearer/OAuth -->
        <div
          class="bearer-auth md-layout"
          v-if="reauth === 'Bearer Token' || reauth === 'OAuth 2.0'"
        >
          <div class="md-layout-item md-size-70">
            <md-field>
              <md-input placeholder="Token" name="bearer_token" v-model="bearerToken" />
            </md-field>
          </div>
          <div class="md-layout-item md-size-30">
            <md-button
              v-if="auth === 'OAuth 2.0'"
              class="md-raised md-icon-button"
              @click="showTokenList = !showTokenList"
              v-tooltip.bottom="$t('use_token')"
            >
              <md-icon>open_in_new</md-icon>
            </md-button>
            <md-button
              v-if="auth === 'OAuth 2.0'"
              class="md-raised md-icon-button"
              @click="showTokenRequest = !showTokenRequest"
              v-tooltip.bottom="$t('get_token')"
            >
              <md-icon>vpn_key</md-icon>
            </md-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    auth: String,
  },
  data() {
    return {
      httpUser: "",
      httpPassword: "",
      passwordFieldType: "password",
      showTokenList: false,
      showTokenRequest: false,
      bearerToken: "",
    }
  },
  computed: {
    reauth: {
      get() {
        return this.$props.auth
      },
      set(val) {
        this.$emit("set_select", val)
      },
    },
  },
}
</script>
