<template>
    <div class="row h-100 w-100 gx-0 p-2 justify-content-center align-items-center">
        <div class="col-12 col-lg-6">
            <div class="card">
                <div class="card-body">
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
                        <input type="text" class="form-control" id="floatingInputGroup2" :value="peer_id" readonly>
                    </div>
                    <div class="d-flex flex-column mb-2">
                        <button class="btn btn-dark" @click="enterRoom">Create Room</button>
                    </div>
                    <hr />
                    <div class="d-flex flex-column">
                        <span class="fw-bold">Shhh, do you want to transfer a video?</span>
                        <span class="fw-bold">Use <a class="text-decoration-none" href="https://file.pizza"
                                target="_blank"><mark class="text-danger">file.pizza</mark></a>!</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from 'vue-router';

const router = useRouter();
const peer_id = ref(null);

async function reload() {
    window.location.reload();
    return;
}

async function enterRoom() {
    sessionStorage.setItem('peer', peer_id.value);
    router.push("/session/" + peer_id.value);
}

onMounted(() => {
    sessionStorage.clear();
    peer_id.value = crypto.randomUUID();
})
</script>