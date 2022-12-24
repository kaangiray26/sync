import { createRouter, createWebHistory } from 'vue-router';
import Share from "/components/Share.vue";
import Session from "/components/Session.vue";

const routes = [
    {
        path: "/",
        component: Share,

    },
    {
        path: "/session/:id",
        component: Session,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router