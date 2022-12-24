<template>
    <div class="under-view bg-dark">
        <div class="d-flex justify-content-between p-1">
            <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button class="btn btn-outline-light btn-sm bi bi-moon-stars-fill" @click="home"></button>
                </div>
            </div>
            <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button class="btn btn-sm bi bi-plugin disabled"
                        :class="{ 'btn-danger': !store.connected, 'btn-success': store.connected }"></button>
                    <button class="btn btn-outline-light btn-sm" @click="copyToClipboard">Share</button>
                </div>
            </div>
        </div>
    </div>
    <div class="content-view">
        <div v-show="!store.connected">
            <div class="d-flex flex-column justify-content-center align-items-center mt-4">
                <div class="spinner-border text-light" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <span class="fw-bold text-white">
                    Waiting for the connection...
                </span>
            </div>
        </div>
        <div v-if="(store.connected && !dropped)"
            class="d-flex justify-content-center align-items-center h-100 w-100 clickable dropzone bg-light"
            @dragover.prevent="dragover" @dragleave.prevent="dragleave" @drop.prevent="drop" @click="upload">
            <div>
                <span class="text-muted">Drop your file or click here to play.</span>
            </div>
        </div>
        <P2P ref="p2p" v-if="peer_init" :key="peer_key" :peer="peer" :conn="conn" />
        <input ref="file_input" class="visually-hidden" type="file" @change="onUpload" />
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue"
import { useRouter } from 'vue-router';
import { Peer } from "peerjs"
import { store } from "/js/store.js"
import P2P from "./P2P.vue";

const router = useRouter();

const p2p = ref(null);
const dropped = ref(null);
const file_input = ref(null);

const peer = ref(null);
const conn = ref(null);
const peer_id = ref(null);
const peer_key = ref(0);
const peer_init = ref(false);

async function home() {
    window.location.href = "/";
    return;
}

async function drop(ev) {
    dropped.value = true;
    await nextTick();
    p2p.value.loadMedia(ev.dataTransfer.files[0]);
}

async function onUpload(ev) {
    dropped.value = true;
    await nextTick();
    p2p.value.loadMedia(ev.target.files[0]);
}

async function upload() {
    file_input.value.click();
}

async function copyToClipboard() {
    await navigator.clipboard.writeText(window.location);
}

onMounted(() => {
    if (!router.currentRoute.value.params.hasOwnProperty('id')) {
        router.push("/")
        return
    }

    let id = sessionStorage.getItem('peer');
    if (id && (id == router.currentRoute.value.params.id)) {
        peer_id.value = id;
        peer.value = new Peer([peer_id.value]);
        peer.value.on('connection', connection => {
            conn.value = connection;
            peer_init.value = true;
        });
        return
    }

    peer_id.value = crypto.randomUUID();
    peer.value = new Peer([peer_id.value]);

    peer.value.on('open', () => {
        conn.value = peer.value.connect(router.currentRoute.value.params.id);
        peer_init.value = true;
        conn.value.on("open", () => {
            conn.value.send({
                type: 'connected'
            });
        });
    })
})
</script>