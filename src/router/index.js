import { createRouter, createWebHistory } from 'vue-router'

//导入组件
// import SignupVue from '@/views/Signup.vue'
// import LoginVue from '@/views/Login.vue'
import LayoutVue from '@/views/Menu.vue'
import MainVue from '@/views/Main.vue'
import OrderListVue from '@/views/order/OrderList.vue'

//定义路由
const routes = [
    //   { path: '/signup', component: SignupVue },
    //   { path: '/login', component: LoginVue },
    {
        path: '/', component: LayoutVue, redirect: '/main', children: [
            { path: '/main', component: MainVue },
            { path: '/orderList', component: OrderListVue },
        ]
    }
]

//创建路由
const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

//导出路由
export default router