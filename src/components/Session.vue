<template>
    <div class="h-100 w-100">
        <div class="d-flex flex-column h-100 w-100">
            <div v-if="!dropped"
                class="d-flex justify-content-center align-items-center h-100 w-100 clickable dropzone bg-light p-2 "
                @dragover.prevent="dragover" @dragleave.prevent="dragleave" @drop.prevent="drop" @click="upload">
                <div>
                    <span class="text-muted">Drop your file or click here to play.</span>
                </div>
            </div>
            <video id="player" class="video-js" :class="{ 'invisible': !dropped }" preload="auto"></video>
            <div class="d-flex flex-column p-2 mx-2">
                <div class="progress flex-fill mb-2">
                    <div class="progress-bar" role="progressbar" aria-label="Basic example" aria-valuenow="50"
                        aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
                <div class="d-flex justify-content-between">
                    <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                        <div class="btn-group me-2" role="group" aria-label="Basic example">
                            <button type="button"
                                class="btn btn-outline-light btn-sm bi bi-skip-backward-fill"></button>
                            <button type="button" class="btn btn-outline-light btn-sm bi"
                                :class="{ 'bi-play-fill': !is_playing, 'bi-pause-fill': is_playing }"
                                @click="play"></button>
                            <button type="button" class="btn btn-outline-light btn-sm bi bi-skip-forward-fill"></button>
                        </div>
                    </div>
                    <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                        <div class="btn-group" role="group" aria-label="Basic example">
                            <button class="btn btn-outline-light btn-sm" @click="copyToClipboard">Share</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <input ref="file_input" class="visually-hidden" type="file" @change="onUpload" />
    <P2P v-if="peer_init" :peer="peer" :conn="conn" :key="peer_key" />
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue"
import { useRouter } from 'vue-router';
import { Peer } from "peerjs"
import videojs from "video.js";
import P2P from "./P2P.vue";

const router = useRouter();

const file_input = ref(null);
const player = ref(null);
const is_playing = ref(false);

const dropped = ref(null);
const loaded = ref(null);

const peer = ref(null);
const conn = ref(null);
const peer_id = ref(null);
const peer_key = ref(0);
const peer_init = ref(false);

async function drop(ev) {
    dropped.value = true;
    await nextTick();
    loadMedia(ev.dataTransfer.files[0]);
}

async function onUpload(ev) {
    dropped.value = true;
    await nextTick();
    loadMedia(ev.target.files[0]);
}

async function upload() {
    file_input.value.click();
}

async function loadMedia(file) {
    let src = URL.createObjectURL(file);

    player.value = videojs('player', {
        fill: true
    });

    player.value.src({
        src: src,
        type: file.type
    });

    player.value.on('ready', function () {
        loaded.value = true;
    })
}

async function copyToClipboard() {
    await navigator.clipboard.writeText(window.location);
}

async function play() {
    if (is_playing.value) {
        player.value.pause();
        is_playing.value = false;
    } else {
        player.value.play();
        is_playing.value = true;
    }
}

async function create_connection() {
    peer.value = new Peer([peer_id.value]);
    peer.value.on('connection', connection => {
        conn.value = connection;
        peer_init.value = true;
    });
}

onMounted(() => {
    if (!router.currentRoute.value.params.hasOwnProperty('id')) {
        router.push("/")
        return
    }

    let id = localStorage.getItem('peer');
    if (id && (id == router.currentRoute.value.params.id)) {
        peer_id.value = id;
        create_connection();
        return
    }

    peer_id.value = crypto.randomUUID();
    peer.value = new Peer([peer_id.value]);

    peer.value.on('open', () => {
        conn.value = peer.value.connect(router.currentRoute.value.params.id);
        conn.value.on("open", () => {
            conn.value.send({
                type: 'helo',
                peer_id: peer_id.value,
                desc: navigator.userAgent,
            });
        });
    })
})
</script>