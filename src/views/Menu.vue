<script setup>
import { ElContainer, ElHeader, ElMain, ElMessageBox, ElAside, ElMenu, ElMenuItem, ElSubMenu, ElAvatar, ElLink } from 'element-plus';
import { HomeFilled, GoodsFilled, List, UserFilled, CircleCloseFilled } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const route = router.currentRoute;

// //退出登录
// const handleLogout = () => {
//     ElMessageBox.confirm('确定要退出登录吗？', '提示', {
//         confirmButtonText: '确定',
//         cancelButtonText: '取消',
//         type: 'warning',
//     }).then(() => {
//         // 用户点击确定，执行退出登录操作
//         router.push('/login'); // 退出登录后跳转到登录页面
//     }).catch(() => {
//         // 用户点击取消，不做任何操作
//     });
// };

</script>

<template>
    <el-container class="layout-container">
        <el-header>
            <div class="logo"></div>
            <h3>GameShop·管理员系统</h3>
            <el-avatar :size="60"></el-avatar>
            <el-link :underline="false" :icon="CircleCloseFilled" @click="handleLogout">退出登录</el-link>
        </el-header>

        <el-container>
            <el-aside width="20%">
                <el-menu class="el-menu" active-text-color="#0077FF" @open="handleOpen" @close="handleClose" router :default-active="route.path">
                    <el-sub-menu index="1">
                        <template #title>
                            <el-icon>
                                <HomeFilled />
                            </el-icon>
                            <span>主页</span>
                        </template>
                        <el-menu-item index="/main">概览</el-menu-item>
                    </el-sub-menu>
                    <el-sub-menu index="2">
                        <template #title>
                            <el-icon>
                                <GoodsFilled />
                            </el-icon>
                            <span>商品管理</span>
                        </template>
                        <el-menu-item index="2-1">商品列表</el-menu-item>
                    </el-sub-menu>
                    <el-sub-menu index="3">
                        <template #title>
                            <el-icon>
                                <List />
                            </el-icon>
                            <span>订单管理</span>
                        </template>
                        <el-menu-item index="/orderList">订单列表</el-menu-item>
                        <el-menu-item index="/statistics">数据报表</el-menu-item>
                    </el-sub-menu>
                    <el-sub-menu index="4">
                        <template #title>
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            <span>用户管理</span>
                        </template>
                        <el-menu-item index="/UserList">用户列表</el-menu-item>
                        <el-menu-item index="/MerchantInformation">详情信息</el-menu-item>
                        <el-menu-item index="/MerchantChangePassword">修改密码</el-menu-item>
                    </el-sub-menu>
                </el-menu>
            </el-aside>

            <el-main>
                <router-view></router-view>
            </el-main>

        </el-container>
    </el-container>
</template>

<style scoped>
.layout-container {
    height: 100vh;
}

.el-header {
    height: 80px;
    background-color: #1b2838;
    color: #fff;
    display: flex;
    align-items: center;
}

.el-header .logo {
    height: 70px;
    width: 70px;
    background: url('/src/assets/logo.png') no-repeat center / 70px auto;
}

.el-header h3 {
    margin-left: 10px;
}

.el-header .el-avatar {
    margin-left: auto;
    margin-right: 20px;
}

.el-header .el-link {
    color: #fff;
    font-size: 16px;
}


.el-aside {
    background-color: #fff;
    border-right: 1px solid #ebeef5;
    height: 100%;
}

.el-main {
    background-color: #F7F7F7;
    padding: 20px;
}
</style>