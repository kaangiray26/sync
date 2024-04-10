// store.js

import { reactive } from 'vue';
const store = reactive({
    peer: null,
    conn: null,
    loaded: 0,
    connected: false,
});

export { store }