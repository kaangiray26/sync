<template>
    <div class="container py-4">
        <router-view />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

onMounted(() => {
    sessionStorage.clear();
})
</script>