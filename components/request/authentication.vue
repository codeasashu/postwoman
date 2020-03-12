<template>
  <div>
    <v-row>
      <v-col cols="10">
        <h3>{{ $t("authentication") }}</h3>
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
    <v-row>
      <v-col cols="3">
        <span class="select-wrapper">
          <v-input>
            <v-select id="auth" v-model="reauth" :items="auths"> </v-select>
          </v-input>
        </span>
      </v-col>
      <v-col cols="9">
        <!-- Basic auth -->
        <v-row class="basic-auth" v-if="reauth === 'Basic Auth'">
          <v-col cols="6">
            <v-input>
              <v-text-field placeholder="User" name="http_basic_user" v-model="httpUser" />
            </v-input>
          </v-col>
          <v-col cols="6">
            <v-input>
              <v-text-field
                placeholder="Password"
                name="http_basic_passwd"
                :type="passwordFieldType"
                v-model="httpPassword"
              />
            </v-input>
          </v-col>
        </v-row>

        <!-- Bearer/OAuth -->
        <v-row class="bearer-auth" v-if="reauth === 'Bearer Token' || reauth === 'OAuth 2.0'">
          <v-col cols="9">
            <v-input>
              <v-text-field placeholder="Token" name="bearer_token" v-model="bearerToken" />
            </v-input>
          </v-col>
          <v-col cols="3">
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
          </v-col>
        </v-row>
      </v-col>
    </v-row>
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
      auths: ["None", "Basic Auth", "Bearer Token", "OAuth 2.0"],
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
