import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

// Public pages
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Features from '../views/Features.vue';
import About from '../views/About.vue';
import Contact from '../views/Contact.vue';

// Admin pages (existing)
import Dashboard from '../views/Dashboard.vue';
import Maintenance from '../views/Maintenance.vue';
import Stock from '../views/Stock.vue';
import Analytics from '../views/Analytics.vue';
import Settings from '../views/Settings.vue';

// Technician pages (new)
import TechDashboard from '../views/TechDashboard.vue';
import TechTicketDetail from '../views/TechTicketDetail.vue';
import TechHistory from '../views/TechHistory.vue';

// Employee pages (new)
import EmployeeDashboard from '../views/EmployeeDashboard.vue';
import EmployeeNewTicket from '../views/EmployeeNewTicket.vue';
import EmployeeTicketDetail from '../views/EmployeeTicketDetail.vue';
import Profile from '../views/Profile.vue';
import Library from '../views/Library.vue';

const routes = [
    // Public
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/fonctionnalites', name: 'Features', component: Features },
    { path: '/about', name: 'About', component: About },
    { path: '/contact', name: 'Contact', component: Contact },

    // Admin
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true, roles: ['ADMIN'] } },
    { path: '/maintenance', name: 'Maintenance', component: Maintenance, meta: { requiresAuth: true, roles: ['ADMIN'] } },
    { path: '/stock', name: 'Stock', component: Stock, meta: { requiresAuth: true, roles: ['ADMIN'] } },
    { path: '/analytics', name: 'Analytics', component: Analytics, meta: { requiresAuth: true, roles: ['ADMIN'] } },
    { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true, roles: ['ADMIN'] } },

    // Technician
    { path: '/mes-tickets', name: 'TechDashboard', component: TechDashboard, meta: { requiresAuth: true, roles: ['TECHNICIAN'] } },
    { path: '/mes-tickets/:id', name: 'TechTicketDetail', component: TechTicketDetail, meta: { requiresAuth: true, roles: ['TECHNICIAN'] } },
    { path: '/historique', name: 'TechHistory', component: TechHistory, meta: { requiresAuth: true, roles: ['TECHNICIAN'] } },

    // Employee
    { path: '/mes-demandes', name: 'EmployeeDashboard', component: EmployeeDashboard, meta: { requiresAuth: true, roles: ['EMPLOYEE'] } },
    { path: '/nouvelle-demande', name: 'EmployeeNewTicket', component: EmployeeNewTicket, meta: { requiresAuth: true, roles: ['EMPLOYEE'] } },
    { path: '/mes-demandes/:id', name: 'EmployeeTicketDetail', component: EmployeeTicketDetail, meta: { requiresAuth: true, roles: ['EMPLOYEE'] } },

    // Common
    { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/library', name: 'Library', component: Library, meta: { requiresAuth: true } },

    // Fallback
    { path: '/:pathMatch(.*)*', redirect: '/login' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    if (to.meta.requiresAuth) {
        if (!auth.isAuthenticated) {
            return next('/login');
        }
        if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
            // Redirect to role home
            if (auth.isAdmin) return next('/dashboard');
            if (auth.isTech) return next('/mes-tickets');
            if (auth.isEmployee) return next('/mes-demandes');
            return next('/login');
        }
    }

    // If already logged in and going to login
    if (to.name === 'Login' && auth.isAuthenticated) {
        if (auth.isAdmin) return next('/dashboard');
        if (auth.isTech) return next('/mes-tickets');
        if (auth.isEmployee) return next('/mes-demandes');
    }

    next();
});

export default router;
