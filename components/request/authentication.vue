<template>
  <div>
    <div class="v-layout">
      <div class="v-layout-item v-size-80">
        <h3>{{ $t("authentication") }}</h3>
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
    <div class="v-layout v-gutter">
      <div class="v-layout-item v-size-30">
        <span class="select-wrapper">
          <v-input>
            <v-select id="auth" v-model="reauth">
              <v-option value="None">None</v-option>
              <v-option value="Basic Auth">Basic Auth</v-option>
              <v-option value="Bearer Token">Bearer Token</v-option>
              <v-option value="OAuth 2.0">OAuth 2.0</v-option>
            </v-select>
          </v-input>
        </span>
      </div>
      <div class="v-layout-item v-size-70">
        <!-- Basic auth -->
        <div class="basic-auth v-layout" v-if="reauth === 'Basic Auth'">
          <div class="v-layout-item v-size-100">
            <v-input>
              <v-text-field placeholder="User" name="http_basic_user" v-model="httpUser" />
            </v-input>
          </div>
          <div class="v-layout-item v-size-100">
            <v-input>
              <v-text-field
                placeholder="Password"
                name="http_basic_passwd"
                :type="passwordFieldType"
                v-model="httpPassword"
              />
            </v-input>
          </div>
        </div>

        <!-- Bearer/OAuth -->
        <div
          class="bearer-auth v-layout"
          v-if="reauth === 'Bearer Token' || reauth === 'OAuth 2.0'"
        >
          <div class="v-layout-item v-size-70">
            <v-input>
              <v-text-field placeholder="Token" name="bearer_token" v-model="bearerToken" />
            </v-input>
          </div>
          <div class="v-layout-item v-size-30">
            <v-btn
              v-if="auth === 'OAuth 2.0'"
              class="v-raised v-icon-button"
              @click="showTokenList = !showTokenList"
              v-tooltip.bottom="$t('use_token')"
            >
              <v-icon>open_in_new</v-icon>
            </v-btn>
            <v-btn
              v-if="auth === 'OAuth 2.0'"
              class="v-raised v-icon-button"
              @click="showTokenRequest = !showTokenRequest"
              v-tooltip.bottom="$t('get_token')"
            >
              <v-icon>vpn_key</v-icon>
            </v-btn>
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
