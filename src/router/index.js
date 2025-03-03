import { createRouter, createWebHistory } from 'vue-router';
import { useCounterStore } from '@/stores/index';
import { useAuthStore } from '@/stores/auth';
import MenuItem from "@/components/MenuItem.vue";
import ClientsViews from "@/views/lists/ClientsViews.vue";
import CompaniesViews from "@/views/lists/CompaniesViews.vue";
import IncomesView from "@/views/lists/IncomesView.vue";
import ExpensesView from "@/views/lists/ExpensesView.vue";
import UserView from "@/views/UserView.vue";
import DashboardView from "@/views/DashboardView.vue";
import LoginView from "@/views/LoginView.vue";
import ProjectsView from "@/views/lists/ProjectsView.vue";
import ProductsView from "@/views/lists/ProductsView.vue";
import InvoicesView from "@/views/lists/InvoicesView.vue";
import TimesheetView from "@/views/TimesheetView.vue";
import TimesheetCalendarView from "@/views/TimesheetCalendarView.vue";
import EmployeeScheduleView from "@/views/EmployeeScheduleView.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        component: DashboardView,
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView,
        meta: { guestOnly: true }
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true, requiresCompany: true }
    },
    {
        path: '/clientes',
        name: 'clientes',
        component: ClientsViews,
        meta: { requiresAuth: true, requiresCompany: true }
    },
    {
        path: '/proyectos',
        name: 'proyectos',
        component: ProjectsView,
        meta: { requiresAuth: true, requiresCompany: true }
    },
    {
        path: '/facturas',
        name: 'facturas',
        component: InvoicesView,
        meta: { requiresAuth: true, requiresCompany: true }
    },
    {
        path: '/productos',
        name: 'productos',
        component: ProductsView,
        meta: { requiresAuth: true, requiresCompany: true }
    },
    {
        path: '/ingresos',
        name: 'ingresos',
        component: IncomesView,
        meta: { requiresAuth: true, requiresCompany: true }
    },
    {
        path: '/gastos',
        name: 'gastos',
        component: ExpensesView,
        meta: { requiresAuth: true, requiresCompany: true }
    },
    {
        path: '/employees-timesheet',
        name: 'employeesTimesheet',
        component: EmployeeScheduleView,
        meta: { requiresAuth: true, requiresCompany: true }
    },
    {
        path: '/timesheet',
        name: 'timesheet',
        component: TimesheetView,
        meta: { requiresAuth: true }
    },
    {
        path: '/calendar-timesheet',
        name: 'calendar-timesheet',
        component: TimesheetCalendarView,
        meta: { requiresAuth: true }
    },
    {
        path: '/reportes',
        name: 'reportes',
        component: MenuItem,
        meta: { requiresAuth: true, requiresCompany: true }
    },
    {
        path: '/ajustes',
        name: 'ajustes',
        component: CompaniesViews,
        meta: { requiresAuth: true }
    },
    {
        path: '/perfil',
        name: 'perfil',
        component: UserView,
        meta: { requiresAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: { name: 'home' }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const counterStore = useCounterStore();
    const authStore = useAuthStore();

    if (to.name === 'home') {
        next();
    } else if (to.matched.some(record => record.meta.guestOnly)) {
        if (authStore.isAuthenticated) {
            next({ name: 'dashboard' });
        } else {
            next();
        }
    } else if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!authStore.isAuthenticated) {
            next({ name: 'login' });
        } else if (to.matched.some(record => record.meta.requiresCompany) && !counterStore.isSelectedCompany) {
            next({ name: 'ajustes' });
        } else {
            next();
        }
    } else {
        next({ name: 'home' });
    }
})

export default router;