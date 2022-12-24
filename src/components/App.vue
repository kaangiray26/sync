<template>
    <div class="d-flex flex-column vh-100 vw-100 m-0 p-0">
        <router-view />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

onMounted(() => {
    sessionStorage.clear();
})
</script>