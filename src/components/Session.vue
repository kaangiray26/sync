<template>
    <div class="under-view">
        <div class="d-flex flex-fill justify-content-between p-1">
            <button class="btn" @click="home">
                <span class="bi bi-moon-stars-fill text-light"></span>
            </button>
            <button class="btn d-flex text-light" @click="copyToClipboard">
                <span class="bi bi-clipboard me-1"></span>
                <span>Share</span>
            </button>
        </div>
    </div>
    <div v-if="!dropped" class="content-view">
        <div v-if="!store.connected" class="loading">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span class="fw-bold">
                Waiting for the connection...
            </span>
        </div>
        <div v-if="(store.connected && !dropped)" class="dropzone" @dragover.prevent="dragover"
            @dragleave.prevent="dragleave" @drop.prevent="drop" @click="upload">
            <div>
                <span class="text-muted">Drop your file or click here to play.</span>
            </div>
        </div>
    </div>
    <P2P ref="p2p" v-if="peer_init" :key="peer_key" />
    <input ref="file_input" class="visually-hidden" type="file" @change="onUpload" />
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

// PeerJS
const peerConfig = {
    iceServers: [
        {
            urls: "turn:standard.relay.metered.ca:80",
            username: "90e794d7186335533be6a215",
            credential: "05ker3YuARTJkdfP",
        },
        {
            urls: "turn:standard.relay.metered.ca:443",
            username: "90e794d7186335533be6a215",
            credential: "05ker3YuARTJkdfP",
        },
    ]
}

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
    // Check if the session is valid
    if (!router.currentRoute.value.params.hasOwnProperty('id')) {
        router.push("/")
        return
    }

    // Get ID
    const id = sessionStorage.getItem('id');

    // Role: Host
    if (id && (id == router.currentRoute.value.params.id)) {
        // Init peer
        store.peer = new Peer([id], {
            config: peerConfig
        });
        store.peer.on('connection', connection => {
            store.conn = connection;
            peer_init.value = true;
        });
        return
    }

    store.peer = new Peer({
        config: peerConfig
    });

    store.peer.on('open', () => {
        store.conn = store.peer.connect(router.currentRoute.value.params.id);
        peer_init.value = true;
        store.conn.on("open", () => {
            store.conn.send({
                type: 'connected'
            });
        });
    })
})
</script>