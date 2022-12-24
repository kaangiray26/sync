<template></template>

<script setup>
import { ref, onMounted } from "vue"

props.conn.on("data", async function (data) {
    console.log(data);
    if (data.type == 'helo') {
        return;
    }
});

const props = defineProps({
    peer: {
        type: Object,
    },
    conn: {
        type: Object,
    },
    peer_id: {
        type: String,
    },
})

onMounted(() => {
    //
})
</script>