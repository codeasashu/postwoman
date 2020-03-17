<template>
  <div>
    <modal :show="showTokenList" @close="showTokenList = false">
      <div slot="header">
        <ul>
          <li>
            <div class="flex-wrap">
              <h3 class="title">{{ $t("manage_token") }}</h3>
              <div>
                <button class="icon" @click="showTokenList = false">
                  <i class="material-icons">close</i>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div slot="body">
        <ul>
          <li>
            <div class="flex-wrap">
              <label for="token-list">{{ $t("token_list") }}</label>
              <div v-if="tokens.length != 0">
                <button
                  class="icon"
                  @click="clearContent('tokens', $event)"
                  v-tooltip.bottom="$t('clear')"
                >
                  <i class="material-icons">clear_all</i>
                </button>
              </div>
            </div>
          </li>
        </ul>
        <ul id="token-list" v-for="(token, index) in tokens" :key="index">
          <li>
            <input
              :placeholder="'name ' + (index + 1)"
              :value="token.name"
              @change="
                $store.commit('setOAuthTokenName', {
                  index,
                  value: $event.target.value,
                })
              "
            />
          </li>
          <li>
            <input :value="token.value" readonly />
          </li>
          <div class="flex-wrap">
            <li>
              <button
                class="icon"
                @click="useOAuthToken(token.value)"
                v-tooltip.bottom="$t('use_token')"
              >
                <i class="material-icons">input</i>
              </button>
            </li>
            <li>
              <button class="icon" @click="removeOAuthToken(index)" v-tooltip.bottom="$t('delete')">
                <i class="material-icons">delete</i>
              </button>
            </li>
          </div>
        </ul>
        <p v-if="tokens.length === 0" class="info">
          {{ $t("empty") }}
        </p>
      </div>
      <div slot="footer"></div>
    </modal>
  </div>
</template>
