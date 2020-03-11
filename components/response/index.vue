<template>
    <v-row>
        <v-col>
            <h3>{{ $t("response") }}</h3>
            <v-toolbar>
                <v-col cols=8>
                    <v-tabs v-model="tab">
                        <v-tab id="tab-response-body">{{ $t('body') }}</v-tab>
                        <v-tab id="tab-response-headers">{{ $t('headers') }}</v-tab>
                    </v-tabs>
                </v-col>
                
                <v-col cols=2>
                    <p>{{ getStatusCode }}</p>
                </v-col>
                <v-col cols=2>
                    <v-btn
                        class="v-icon-button"
                        @click="downloadResponse"
                        ref="downloadResponse"
                        v-if="response.body"
                        v-tooltip="$t('download_file')"
                    >
                        <v-icon>get_app</v-icon>
                    </v-btn>
                    <v-btn
                        class="v-icon-button"
                        @click="copyResponse"
                        ref="copyResponse"
                        v-if="response.body"
                        v-tooltip="$t('copy_response')"
                    >
                        <v-icon>file_copy</v-icon>
                    </v-btn>
                </v-col>
            </v-toolbar>
            
            <v-row>
                <v-col col=12>
                    <v-tabs-items v-model="tab">
                        <v-tab-item>
                            <div id="response-details-wrapper">
                                <Editor
                                :value="responseBodyText"
                                :lang="responseBodyType"
                                :options="{
                                    maxLines: responseBodyMaxLines,
                                    minLines: '16',
                                    fontSize: '16px',
                                    autoScrollEditorIntoView: true,
                                    readOnly: true,
                                    showPrintMargin: false,
                                    useWorker: false,
                                }"
                                />
                                <iframe
                                v-show="previewEnabled"
                                class="covers-response"
                                ref="previewFrame"
                                src="about:blank"
                                ></iframe>
                            </div>
                            <div class="align-right"
                                v-if="response.body && responseType === 'text/html'">
                                <v-btn class="v-raised" @click.prevent="togglePreview">
                                    <v-icon>
                                        {{ !previewEnabled ? "visibility" : "visibility_off" }}
                                    </v-icon>
                                    <span>
                                        {{ previewEnabled ? $t("hide_preview") : $t("preview_html") }}
                                    </span>
                                </v-btn>
                            </div>
                        </v-tab-item>
                        <v-tab-item>
                            <v-simple-table v-if="response.headers">
                                <template v-slot:default>
                                <thead>
                                    <tr>
                                    <th>{{ $t('key') }}</th>
                                    <th>{{ $t('value') }}</th>
                                    </tr>
                                </thead>
                                <tr v-for="(value, key) in response.headers" :key="key">
                                    <td>{{ key }}</td>
                                    <td>{{ value }}</td>
                                </tr>
                                </template>
                            </v-simple-table>
                        </v-tab-item>
                    </v-tabs-items>
                </v-col>
            </v-row>
        </v-col>
    </v-row>
</template>
<script>
import AceEditor from "../../components/ui/ace-editor"
export default {
    components: {
        Editor: AceEditor,
    },
    props: {
        response: Object
    },
    watch: {
        "response.body": function(val) {
            if (
                this.response.body === this.$t("waiting_send_req") ||
                this.response.body === this.$t("loading")
            ) {
                this.responseBodyText = this.response.body
                this.responseBodyType = "text"
            } else {
                if (
                this.responseType === "application/json" ||
                this.responseType === "application/hal+json"
                ) {
                this.responseBodyText = JSON.stringify(this.response.body, null, 2)
                this.responseBodyType = "json"
                } else if (this.responseType === "text/html") {
                this.responseBodyText = this.response.body
                this.responseBodyType = "html"
                } else {
                this.responseBodyText = this.response.body
                this.responseBodyType = "text"
                }
            }
        },
    },
    data () {
        return {
            currentTabId: 'tab-response-body',
            responseBodyMaxLines: 16,
            previewEnabled: false,
            responseBodyText: null,
            responseBodyType: null,
            tab: null
        }
    },
    computed: {
        getStatusCode () {
            return `${this.$t('status')} : ${this.response.status}`
        },
        responseType() {
            return (this.response.headers["content-type"] || "").split(";")[0].toLowerCase()
        },
    },
    methods: {
        changeTab(tabId) {
            this.currentTabId = tabId
        },
        togglePreview() {
            this.previewEnabled = !this.previewEnabled
            if (this.previewEnabled) {
                // If you want to add 'preview' support for other response types,
                // just add them here.
                if (this.responseType === "text/html") {
                // If the preview already has that URL loaded, let's not bother re-loading it all.
                if (this.$refs.previewFrame.getAttribute("data-previewing-url") === this.url) return
                // Use DOMParser to parse document HTML.
                const previewDocument = new DOMParser().parseFromString(
                    this.response.body,
                    this.responseType
                )
                // Inject <base href="..."> tag to head, to fix relative CSS/HTML paths.
                previewDocument.head.innerHTML =
                    `<base href="${this.url}">` + previewDocument.head.innerHTML
                // Finally, set the iframe source to the resulting HTML.
                this.$refs.previewFrame.srcdoc = previewDocument.documentElement.outerHTML
                this.$refs.previewFrame.setAttribute("data-previewing-url", this.url)
                }
            }
        },
        copyResponse() {
            this.$refs.copyResponse.innerHTML = this.doneButton
            this.$toast.success(this.$t("copied_to_clipboard"), {
                icon: "done",
            })
            const aux = document.createElement("textarea")
            const copy =
                this.responseType === "application/json"
                ? JSON.stringify(this.response.body, null, 2)
                : this.response.body
            aux.innerText = copy
            document.body.appendChild(aux)
            aux.select()
            document.execCommand("copy")
            document.body.removeChild(aux)
            setTimeout(() => (this.$refs.copyResponse.innerHTML = this.copyButton), 1000)
        },
        downloadResponse() {
            const dataToWrite = JSON.stringify(this.response.body, null, 2)
            const file = new Blob([dataToWrite], { type: this.responseType })
            const a = document.createElement("a")
            const url = URL.createObjectURL(file)
            a.href = url
            a.download = `${this.url + this.path} [${this.method}] on ${Date()}`.replace(/\./g, "[dot]")
            document.body.appendChild(a)
            a.click()
            this.$refs.downloadResponse.innerHTML = this.doneButton
            this.$toast.success(this.$t("download_started"), {
                icon: "done",
            })
            setTimeout(() => {
                document.body.removeChild(a)
                window.URL.revokeObjectURL(url)
                this.$refs.downloadResponse.innerHTML = this.downloadButton
            }, 1000)
        },
    }
}
</script>
