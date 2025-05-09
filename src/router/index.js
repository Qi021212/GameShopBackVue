import { createRouter, createWebHistory } from 'vue-router'

//导入组件
import MerchantSignupVue from '@/views/usermanagement/MerchantSignup.vue'
import MerchantLoginVue from '@/views/usermanagement/MerchantLogin.vue'
import LayoutVue from '@/views/Menu.vue'
import MainVue from '@/views/Main.vue'
import OrderListVue from '@/views/order/OrderList.vue'
import StatisticsVue from '@/views/order/Statistics.vue'
import UserListVue from '@/views/usermanagement/UserList.vue'
import MerchantInformationVue from '@/views/usermanagement/MerchantInformation.vue'
import ProductsManageVue from '@/views/products/ProductsManage.vue'
import ProductsDetailVue from '@/views/products/ProductsDetail.vue'
import AddProductsVue from '@/views/products/AddProducts.vue'
import ModifyProductVue from '@/views/products/ModifyProduct.vue'
import MerchantChangePasswordVue from '@/views/usermanagement/MerchantChangePassword.vue'

//定义路由
const routes = [
       { path: '/signup', component: MerchantSignupVue },
       { path: '/login', component: MerchantLoginVue },
    {
        path: '/', component: LayoutVue, redirect: '/main', children: [
            { path: '/main', component: MainVue },
            { path: '/orderList', component: OrderListVue },
            { path: '/statistics', component: StatisticsVue },
            { path: '/userList', component: UserListVue },
            { path: '/merchantInformation', component: MerchantInformationVue },
            { path: '/productsManage', component: ProductsManageVue },
            { path: '/productsDetail/:id', component: ProductsDetailVue },
            { path: '/addProducts', component: AddProductsVue },
            { path: '/modifyProduct/:id', component: ModifyProductVue },
            { path: '/UserList', component: UserListVue },
            { path: '/MerchantInformation', component:MerchantInformationVue }, 
            { path: '/MerchantChangePassword', component: MerchantChangePasswordVue },
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