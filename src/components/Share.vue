<template>
    <div class="container py-4">
        <div class="bz-card">
            <div class="d-flex align-items-center">
                <img class="img-thumbnail img-fluid clickable m-2" src="/favicon.svg" width="64" height="64"
                    @click="reload">
                <h1>Sync</h1>
            </div>
            <div class="mb-2">
                <span class="fw-bold">Connect with your friends and start playing media.</span>
            </div>
            <div class="input-group mb-2">
                <span class="input-group-text bi bi-door-open-fill" id="basic-addon1"></span>
                <input type="text" class="form-control" id="floatingInputGroup2" :value="id" readonly>
            </div>
            <div class="d-flex flex-column mb-2">
                <button class="btn btn-dark" @click="enterRoom">Create Room</button>
            </div>
            <hr />
            <div class="d-flex flex-column">
                <span class="fw-bold">Shhh, do you want to transfer a video?</span>
                <span class="fw-bold">Use <a class="text-decoration-none" href="https://share.buzl.uk"
                        target="_blank"><mark class="text-danger">share</mark></a>!</span>
                <div class="d-flex justify-content-end">
                    <a href="https://github.com/kaangiray26/sync" class="bi bi-github"></a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onBeforeMount } from "vue"
import { useRouter } from 'vue-router';

const router = useRouter();

const id = ref('');

async function reload() {
    window.location.reload();
    return;
}

async function enterRoom() {
    router.push("/session/" + id.value);
}

onBeforeMount(() => {
    id.value = crypto.randomUUID();
    sessionStorage.setItem('id', id.value);
})
</script>