<template>
  <div>
    <modal :show="showTokenRequestList" @close="showTokenRequestList = false">
      <div slot="header">
        <ul>
          <li>
            <div class="flex-wrap">
              <h3 class="title">{{ $t("manage_token_req") }}</h3>
              <div>
                <button class="icon" @click="showTokenRequestList = false">
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
              <label for="token-req-list">{{ $t("token_req_list") }}</label>
              <div>
                <button
                  :disabled="this.tokenReqs.length === 0"
                  class="icon"
                  @click="showTokenRequestList = false"
                  v-tooltip.bottom="$t('use_token_req')"
                >
                  <i class="material-icons">input</i>
                </button>
                <button
                  :disabled="this.tokenReqs.length === 0"
                  class="icon"
                  @click="removeOAuthTokenReq"
                  v-tooltip.bottom="$t('delete')"
                >
                  <i class="material-icons">delete</i>
                </button>
              </div>
            </div>
            <span class="select-wrapper">
              <select
                id="token-req-list"
                v-model="tokenReqSelect"
                :disabled="this.tokenReqs.length === 0"
                @change="tokenReqChange($event)"
              >
                <option v-for="(req, index) in tokenReqs" :key="index" :value="req.name">
                  {{ req.name }}
                </option>
              </select>
            </span>
          </li>
        </ul>
        <ul>
          <li>
            <label for="token-req-name">{{ $t("token_req_name") }}</label>
            <input v-model="tokenReqName" />
          </li>
        </ul>
        <ul>
          <li>
            <label for="token-req-details">
              {{ $t("token_req_details") }}
            </label>
            <textarea id="token-req-details" readonly rows="7" v-model="tokenReqDetails"></textarea>
          </li>
        </ul>
      </div>
      <div slot="footer">
        <div class="flex-wrap">
          <span></span>
          <span>
            <button class="icon primary" @click="addOAuthTokenReq">
              {{ $t("save_token_req") }}
            </button>
          </span>
        </div>
      </div>
    </modal>
  </div>
</template>
