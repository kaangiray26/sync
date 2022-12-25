<template>
    <div :class="{ 'visually-hidden': store.loaded != 2, 'd-flex h-100 w-100': store.loaded == 2 }">
        <div class="h-100 w-100 position-relative" @mouseleave="controls = false" @mousemove="controls = true"
            @dragover.prevent="dragover" @dragleave.prevent="dragleave" @drop.prevent="drop">
            <video id="player" class="video-js" @click="play_pause" crossorigin="anonymous"></video>
            <div class="w-100 d-flex bg-dark flex-fill flex-row align-items-center position-absolute bottom-0"
                :class="{ 'invisible': !controls }">
                <div class="btn-toolbar m-1" role="toolbar" aria-label="Toolbar with button groups">
                    <div class="btn-group" role="group" aria-label="First group">
                        <button type="button" class="btn btn-sm btn-light bi"
                            :class="{ 'bi-play-fill': !is_playing, 'bi-pause-fill': is_playing }" @click="play_pause">
                        </button>
                    </div>
                </div>
                <div class="progress flex-fill clickable" @click="seekProgress($event)">
                    <div class="progress-bar progress-bar-striped" :class="{ 'progress-bar-animated': is_playing }"
                        role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
                        :style="{ 'width': progress + '%' }">
                    </div>
                </div>
                <div class="m-1">
                    <span class="text-white font-monospace">-{{ formatDuration(remainingTime) }}</span>
                </div>
                <div class="btn-toolbar m-1" role="toolbar" aria-label="Toolbar with button groups">
                    <div class="btn-group" role="group" aria-label="First group">
                        <button type="button" class="btn btn-sm btn-light bi bi-collection-play-fill"
                            @click="upload"></button>
                        <button type="button" class="btn btn-sm btn-light bi bi-fullscreen" @click="fullscreen">
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <input ref="file_input" class="visually-hidden" type="file" @change="onUpload" />
</template>

<script setup>
import { ref, onMounted } from "vue"
import { store } from "/js/store.js"
import videojs from "video.js"
import { handle_subtitle } from "/js/converter.js"

const player = ref(null);
const is_playing = ref(false);
const controls = ref(false);

const file_input = ref(null);

const progress = ref(0);
const remainingTime = ref(0);

function formatDuration(time) {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time - (hours * 3600)) / 60);
    let seconds = Math.floor(time - (hours * 3600) - (minutes * 60));

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    if (hours) { hours = "00"; }
    return hours + ':' + minutes + ':' + seconds;
}

async function upload() {
    file_input.value.click();
}

async function drop(ev) {
    let f = ev.dataTransfer.files[0];
    console.log(f.type);
    if (f.type.startsWith("video")) {
        changeMedia(f);
    } else if (f.type == "text/vtt") {
        addVTTSubtitle(f);
    } else if (f.type == "application/x-subrip") {
        addSRTSubtitle(f);
    }
}

async function onUpload(ev) {
    let f = ev.target.files[0];
    console.log(f.type);
    if (f.type.startsWith("video")) {
        changeMedia(f);
    } else if (f.type == "text/vtt") {
        addVTTSubtitle(f);
    } else if (f.type == "application/x-subrip") {
        addSRTSubtitle(f);
    }
}

async function addVTTSubtitle(f) {
    let track = document.createElement("track");

    track.kind = "captions";
    track.src = URL.createObjectURL(f);
    track.label = "English";
    track.srclang = "en";
    track.default = true;
    document.getElementById("player_html5_api").appendChild(track);
}

async function addSRTSubtitle(f) {
    let blob = await handle_subtitle(f);
    let track = document.createElement("track");

    track.kind = "captions";
    track.src = URL.createObjectURL(blob);
    track.label = "English";
    track.srclang = "en";
    track.default = true;
    document.getElementById("player_html5_api").appendChild(track);
}

async function changeMedia(file) {
    let src = URL.createObjectURL(file);
    let type = file.type;

    player.value.src({
        src: src,
        type: type
    });

    props.conn.send({
        type: "pause"
    })

    player.value.pause();
    is_playing.value = false;
    return;
}

async function _loadMedia(file) {
    let src = URL.createObjectURL(file);
    let type = file.type;

    console.log(type);

    player.value.src({
        src: src,
        type: type
    });

    store.loaded += 1;
    props.conn.send({
        type: "ready"
    })
}

async function get_progress() {
    remainingTime.value = player.value.remainingTime();
    progress.value = (player.value.currentTime() / player.value.duration()) * 100;
}

async function seekProgress(ev) {
    let src = null;

    if (ev.target.classList.contains('progress')) {
        src = ev.target;
    } else {
        src = ev.target.parentElement;
    }

    const rect = src.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const percent = x / rect.width;

    let t = player.value.duration() * percent;
    props.conn.send({
        type: "seek",
        value: t
    });
    player.value.currentTime(t);
}

async function fullscreen() {
    player.value.requestFullscreen();
}

async function play_pause() {
    if (is_playing.value) {
        props.conn.send({
            type: "pause"
        })
        player.value.pause();
        is_playing.value = false;
        return;
    }

    props.conn.send({
        type: "play"
    })
    player.value.play();
    is_playing.value = true;
}

props.conn.on("data", async function (data) {
    console.log(data);
    if (data.type == "play") {
        player.value.play();
        is_playing.value = true;
        return;
    }

    if (data.type == "pause") {
        player.value.pause();
        is_playing.value = false;
        return;
    }

    if (data.type == "seek") {
        player.value.currentTime(data.value);
        return;
    }

    if (data.type == "connected") {
        if (!store.connected) {
            store.connected = true;
            props.conn.send({
                type: "connected"
            })
            return;
        }
    }

    if (data.type == "ready") {
        store.loaded += 1;
        return;
    }
});

props.conn.on('close', () => {
    window.location.href = "/"
});

async function keyPress(event) {
    console.log(event);
    if (event.code == 'Space') {
        event.preventDefault();
        play_pause();
        return
    }

    if (event.key == 'ArrowLeft') {
        let t = player.value.currentTime() - 5;
        props.conn.send({
            type: "seek",
            value: t
        });
        player.value.currentTime(t);
        return
    }

    if (event.key == 'ArrowRight') {
        let t = player.value.currentTime() + 5;
        props.conn.send({
            type: "seek",
            value: t
        });
        player.value.currentTime(t);
        return
    }
}

const props = defineProps({
    peer: {
        type: Object,
    },
    conn: {
        type: Object,
    },
})

defineExpose({
    loadMedia: _loadMedia,
})

onMounted(() => {
    player.value = videojs('#player', {
        controls: false,
        fill: true,
        preload: "auto",
    });

    player.value.on('timeupdate', function () {
        get_progress();
    });

    window.focus();
    window.addEventListener('keydown', keyPress);
})
</script>