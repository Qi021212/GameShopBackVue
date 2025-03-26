<!-- src/views/MerchantSignup.vue -->
<script setup>
import { ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElRow, ElCol, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
const router = useRouter();

// 表单数据模型
const registerData = ref({
    merchantname: '', // 改为 merchantname，与数据库字段一致
    password: '',
    repeatedPassword: '',
    email: '',
});

// 表单验证规则
const rules = ref({
    merchantname: [ // 改为 merchantname
        { required: true, message: '请输入商家名称', trigger: 'blur' },
        { max: 8, message: '商家名称长度不能超过8位', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 8, message: '密码长度不能少于 8 位', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: '密码必须包含数字和字母', trigger: 'blur' },
    ],
    repeatedPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value === registerData.value.password) {
                    callback();
                } else {
                    callback(new Error('两次输入的密码不一致'));
                }
            },
            trigger: 'blur',
        },
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ]
});

// 表单引用
const form = ref(null);

// 注册表单提交
import { BusinessRegisterService } from '@/api/merchant.js'; // 修正导入路径和方法名
const register = async () => {
    try {
        await form.value.validate();
        const result = await BusinessRegisterService(registerData.value);
        if (result.success) { // 后端返回 { message: "注册成功", success: true }
            ElMessage.success('注册成功！');
            router.push('/login'); // 注册成功后跳转到登录页
        } else {
            ElMessage.error(result.message || '注册失败');
        }
    } catch (error) {
        ElMessage.error(error.message || '注册失败');
    }
};
</script>

<template>
    <el-row class="signup-page">
        <!-- 表单区域 -->
        <el-col :span="12" class="register-form">
            <h2>注册</h2>
            <!-- 注册表单 -->
            <el-form :model="registerData" :rules="rules" ref="form" label-width="100px">
                <el-form-item label="商家名称" prop="merchantname">
                    <el-input v-model="registerData.merchantname" placeholder="请输入商家名称"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="registerData.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="registerData.password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="repeatedPassword">
                    <el-input type="password" v-model="registerData.repeatedPassword" placeholder="请再次输入密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="register">注册</el-button>
                </el-form-item>
                <el-form-item class="text-center">
                    已有帐号？<el-link type="primary" :underline="false" @click="router.push('/login')">返回登录</el-link>
                </el-form-item>
            </el-form>
        </el-col>
        <!-- 背景区域 -->
        <el-col :span="12" class="bg"></el-col>
    </el-row>
</template>

<style scoped>
.signup-page {
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

.register-form {
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

.el-form-item__label {
    font-size: 20px;
}

.el-button {
    width: 135px;
    margin-bottom: 0;
    margin-left: -30px;
}

.text-center {
    margin-left: -30px;
    margin-top: -10px;
}

.bg {
    background: url('@/assets/login-bg.png') no-repeat center / cover;
    width: 50%;
    height: 100%;
}

@media screen and (max-width: 768px) {
    .signup-page {
        width: 100%;
        height: 100%;
        margin: 0;
    }

    .register-form {
        width: 100%;
    }

    .bg {
        display: none;
    }
}
</style>