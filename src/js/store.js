// store.js

import { reactive } from 'vue';
const store = reactive({
    connected: false,
    loaded: 0,
});

export { store }