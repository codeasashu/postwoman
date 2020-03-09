<template>
  <div class="wrapper page-container">
    <md-app>
      <md-app-toolbar class="md-primary">
        <md-tabs class="md-primary">
          <md-tab
            id="tab-home"
            md-label="Home"
            :to="localePath('index')"
            v-tooltip.right="$t('home')"
            :aria-label="$t('home')"
            md-icon="home"
          ></md-tab>
          <md-tab
            id="tab-realtime"
            md-label="Realtime"
            :to="localePath('realtime')"
            :class="linkActive('/realtime')"
            v-tooltip.right="$t('realtime')"
            md-icon="settings_input_hdmi"
          ></md-tab>
          <md-tab
            id="tab-settings"
            md-label="Settings"
            :to="localePath('settings')"
            :class="linkActive('/settings')"
            v-tooltip.right="$t('settings')"
            :aria-label="$t('settings')"
            md-icon="settings"
          ></md-tab>
          <md-tab
            id="tab-doc"
            md-label="Documentation"
            :to="localePath('doc')"
            :class="linkActive('/doc')"
            v-tooltip.right="$t('documentation')"
            :aria-label="$t('documentation')"
            md-icon="books"
          ></md-tab>
        </md-tabs>
      </md-app-toolbar>
      <md-app-drawer md-permanent="full">
        <h3>{{ $t("collection") }}</h3>
        <collections />
      </md-app-drawer>
      <md-app-content>
        <div class="content">
          <div class="columns">
            <div class="main" id="main">
              <nuxt />
            </div>
            <aside class="nav-second"></aside>
          </div>
        </div>
      </md-app-content>
    </md-app>
    <modal v-if="showShortcuts" @close="showShortcuts = false">
      <div slot="header">
        <ul>
          <li>
            <div class="flex-wrap">
              <h3 class="title">{{ $t("shortcuts") }}</h3>
              <div>
                <button class="icon" @click="showShortcuts = false">
                  <i class="material-icons">close</i>
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div slot="body">
        <div>
          <label>{{ $t("send_request") }}</label>
          <kbd>{{ getSpecialKey() }} G</kbd>
        </div>
        <div>
          <label>{{ $t("save_to_collections") }}</label>
          <kbd>{{ getSpecialKey() }} S</kbd>
        </div>
        <div>
          <label>{{ $t("copy_request_link") }}</label>
          <kbd>{{ getSpecialKey() }} K</kbd>
        </div>
        <div>
          <label>{{ $t("reset_request") }}</label>
          <kbd>{{ getSpecialKey() }} L</kbd>
        </div>
      </div>
      <div slot="footer"></div>
    </modal>
  </div>
</template>

<style scoped lang="scss">
.footer-link {
  margin: 8px 16px;
}
</style>

<script>
import intializePwa from "../assets/js/pwa"
import * as version from "../.postwoman/version.json"
import { hasExtensionInstalled } from "../functions/strategies/ExtensionStrategy"
import { hasChromeExtensionInstalled } from "../functions/strategies/ChromeStrategy"
import { getPlatformSpecialKey } from "~/functions/platformutils"
import firebase from "firebase/app"
import { fb } from "../functions/fb"

export default {
  components: {
    logo: () => import("../components/layout/logo"),
    modal: () => import("../components/ui/modal"),
    login: () => import("../components/firebase/login"),
    contributors: () => import("../components/layout/contributors"),
    collections: () => import("../components/collections"),
  },

  methods: {
    getSpecialKey: getPlatformSpecialKey,
    linkActive(path) {
      return {
        "nuxt-link-exact-active": this.$route.path === path,
        "nuxt-link-active": this.$route.path === path,
      }
    },
    logout() {
      fb.currentUser = null
      firebase
        .auth()
        .signOut()
        .catch(err => {
          this.$toast.show(err.message || err, {
            icon: "error",
          })
        })
      this.$toast.info(this.$t("logged_out"), {
        icon: "vpn_key",
      })
    },
    nativeShare() {
      if (navigator.share) {
        navigator
          .share({
            title: "Postwoman",
            text:
              "Postwoman • A free, fast and beautiful API request builder - Web alternative to Postman - Helps you create requests faster, saving precious time on development.",
            url: "https://postwoman.io/",
          })
          .then(() => {})
          .catch(console.error)
      } else {
        // fallback
      }
    },
  },

  data() {
    return {
      // Once the PWA code is initialized, this holds a method
      // that can be called to show the user the installation
      // prompt.
      showInstallPrompt: null,
      version: {},
      showExtensions: false,
      showShortcuts: false,
      showSupport: false,
      fb,
      navigatorShare: navigator.share,
    }
  },

  beforeMount() {
    // Set version data
    this.version = version.default

    // Load theme settings
    ;(() => {
      // Apply theme from settings.
      document.documentElement.className = this.$store.state.postwoman.settings.THEME_CLASS || ""
      // Load theme color data from settings, or use default color.
      let color = this.$store.state.postwoman.settings.THEME_COLOR || "#50fa7b"
      let vibrant = this.$store.state.postwoman.settings.THEME_COLOR_VIBRANT || true
      document.documentElement.style.setProperty("--ac-color", color)
      document.documentElement.style.setProperty(
        "--act-color",
        vibrant ? "rgba(32, 33, 36, 1)" : "rgba(255, 255, 255, 1)"
      )
    })()
  },

  mounted() {
    if (process.client) {
      document.body.classList.add("afterLoad")
    }

    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", this.$store.state.postwoman.settings.THEME_TAB_COLOR || "#202124")

    // Initializes the PWA code - checks if the app is installed,
    // etc.
    ;(async () => {
      this.showInstallPrompt = await intializePwa()
      let cookiesAllowed = localStorage.getItem("cookiesAllowed") === "yes"
      if (!cookiesAllowed) {
        this.$toast.show(this.$t("we_use_cookies"), {
          icon: "info",
          duration: 5000,
          theme: "toasted-primary",
          action: [
            {
              text: this.$t("dismiss"),
              onClick: (e, toastObject) => {
                localStorage.setItem("cookiesAllowed", "yes")
                toastObject.goAway(0)
              },
            },
          ],
        })
      }
      let showExtensionsToast = localStorage.getItem("showExtensionsToast") === "yes"

      // Just return if showExtensionsToast is "no"
      if (!showExtensionsToast) return

      setTimeout(() => {
        if (!(hasExtensionInstalled() || hasChromeExtensionInstalled())) {
          this.$toast.show(this.$t("extensions_info2"), {
            icon: "extension",
            duration: 5000,
            theme: "toasted-primary",
            action: [
              {
                text: this.$t("yes"),
                onClick: (e, toastObject) => {
                  this.showExtensions = true
                  localStorage.setItem("showExtensionsToast", "yes")
                  toastObject.goAway(0)
                },
              },
              {
                text: this.$t("no"),
                onClick: (e, toastObject) => {
                  this.$store.commit("setMiscState", {
                    value: false,
                    attribute: "showExtensionsToast",
                  })
                  localStorage.setItem("showExtensionsToast", "no")
                  toastObject.goAway(0)
                },
              },
            ],
          })
        }
      }, 15000)

      this._keyListener = function(e) {
        if (e.key === "Escape") {
          e.preventDefault()
          this.showExtensions = this.showShortcuts = this.showSupport = false
        }
      }
      document.addEventListener("keydown", this._keyListener.bind(this))
    })()

    window.addEventListener("scroll", event => {
      let mainNavLinks = document.querySelectorAll("nav ul li a")
      let fromTop = window.scrollY
      mainNavLinks.forEach(link => {
        let section = document.querySelector(link.hash)

        if (
          section &&
          section.offsetTop <= fromTop &&
          section.offsetTop + section.offsetHeight > fromTop
        ) {
          link.classList.add("current")
        } else {
          link.classList.remove("current")
        }
      })
    })
  },

  watch: {
    $route() {
      // this.$toast.clear();
    },
  },

  computed: {
    availableLocales() {
      return this.$i18n.locales.filter(i => i.code !== this.$i18n.locale)
    },
  },

  beforeDestroy() {
    document.removeEventListener("keydown", this._keyListener)
  },
}
</script>
