<!-- 登录 -->

<script setup>
import { ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElRow, ElCol, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';//引入路由
const router = useRouter();//实例化路由


// 表单数据模型，用:model绑定表单数据，用V-model绑定表单元素
const loginData = ref({
    username: '',
    password: '',
});

// 表单验证规则, 用:rules绑定表单验证规则, 用prop绑定表单元素
const rules = ref({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
    ],
});

//表单引用
const form = ref(null);

// 登录验证
import {loginService} from '@/api/user.js';
const login = () => {
    let result=loginService(loginData.value);
    if(result.code===200){
        ElMessage.success('登录成功');
        //跳转到首页
        router.push('/');
    }else{
        ElMessage.error(result.message?result.message:'登录失败');
    }

};


</script>

<template>
    <el-row class="login-page">
        <!-- 背景区域 -->
        <el-col :span="12" class="bg"></el-col>

        <!-- 表单区域 -->
        <el-col :span="12" class="login-form">
            <h2>登录</h2>
            <!-- 登录表单 -->
            <el-form :model="loginData" :rules="rules" ref="form">
                <el-form-item prop="username">
                    <el-input v-model="loginData.username" placeholder="请输入用户名/手机号" :prefix-icon="User"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="loginData.password" placeholder="请输入密码"
                        :prefix-icon="Lock"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="login">登录</el-button>
                </el-form-item>
                <el-form-item class="text-center">
                    还没有帐号？<el-link type="primary" :underline="false" @click="router.push('/signup')">去注册</el-link>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style scoped>
.login-page {
    width: 600px;
    height: 400px;
    margin: 150px auto;
    /* 水平居中 */
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    /* 水平居中 */
    border-radius: 15px;
    overflow: hidden;
    /* 隐藏超出部分 */
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-form {
    background-color: #fff;
    padding: 20px;
    width: 50%;
    /* 平分宽度 */
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

h2 {
    text-align: center;
    font-size: 28px;
    margin-bottom: 20px;
}

.el-form-item {
    margin-bottom: 20px;
}

.el-button {
    width: 135px;
    margin-bottom: 0;
    margin-left: 60px;

}

.text-center {
    margin-top: -10px;
    margin-left: 60px;
}

.bg {
    background: url('@/assets/login-bg.png') no-repeat center / cover;
    width: 50%;
    /* 平分宽度 */
    height: 100%;
    /* 高度为 500px */
}

@media screen and (max-width: 768px) {
    .login-page {
        width: 100%;
        height: 100%;
        margin: 0;
    }

    .login-form {
        width: 100%;
    }

    .bg {
        display: none;
    }
}
</style>