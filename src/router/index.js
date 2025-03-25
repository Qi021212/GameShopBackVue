import { createRouter, createWebHistory } from 'vue-router'

//导入组件
 import MerchantSignupVue from '@/views/usermanagement/MerchantSignup.vue'
 import MerchantLoginVue from '@/views/usermanagement/MerchantLogin.vue'
import LayoutVue from '@/views/Menu.vue'
import MainVue from '@/views/Main.vue'
import OrderListVue from '@/views/order/OrderList.vue'
import UserList from '@/views/usermanagement/UserList.vue'
import MerchantInformation from '@/views/usermanagement/MerchantInformation.vue'

//定义路由
const routes = [
       { path: '/MerchantSignup', component: MerchantSignupVue },
       { path: '/MerchantLogin', component: MerchantLoginVue },
    {
        path: '/', component: LayoutVue, redirect: '/main', children: [
            { path: '/main', component: MainVue },
            { path: '/orderList', component: OrderListVue },
            {path:'/UserList',component:UserList},
            {path:'/MerchantInformation',component:MerchantInformation}
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