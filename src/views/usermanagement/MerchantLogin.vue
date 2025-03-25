<!-- src/views/usermanagement/Login.vue -->
<script setup>
import { ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElRow, ElCol, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores/token';
import { useMerchantInfoStore } from '@/stores/MerchantInfo'; // 修正大小写
import { loginService } from '@/api/merchant.js';

const router = useRouter();
const tokenStore = useTokenStore();
const merchantInfoStore = useMerchantInfoStore();

const loginData = ref({
    merchantname: '',
    password: ''
});

const rules = ref({
    merchantname: [
        { required: true, message: '请输入商家名称', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
});

const form = ref(null);

const login = async () => {
    try {
        await form.value.validate();
        const result = await loginService(loginData.value);
        if (result.code === 200) {
            ElMessage.success('登录成功');
            tokenStore.login(result.token);
            merchantInfoStore.setInfo(result.data);
            router.push('/'); // 直接跳转到 
        } else {
            ElMessage.error(result.message || '登录失败');
        }
    } catch (error) {
        ElMessage.error(error.message || '登录失败');
    }
};
</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="12" class="login-form">
            <h2>登录</h2>
            <el-form :model="loginData" :rules="rules" ref="form">
                <el-form-item prop="merchantname">
                    <el-input v-model="loginData.merchantname" placeholder="请输入商家名称" :prefix-icon="User"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="loginData.password" placeholder="请输入密码" :prefix-icon="Lock"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="login">登录</el-button>
                </el-form-item>
                <el-form-item class="text-center">
                    还没有帐号？<el-link type="primary" :underline="false" @click="router.push('/Merchantsignup')">去注册</el-link>
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
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-form {
    background-color: #fff;
    padding: 20px;
    width: 50%;
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
    height: 100%;
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