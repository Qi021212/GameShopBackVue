<!-- 注册 -->

<script setup>
import { ref } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElRow, ElCol, ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
const router = useRouter();


// 表单数据模型，用:model绑定表单数据，用V-model绑定表单项元素
const registerData = ref({
    username: '',
    password: '',
    repeatedPassword: '',
    email: '',
});

// 表单验证规则, 用:rules绑定表单验证规则, prop属性指定需要验证的字段
const rules = ref({

    password: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        {
            min: 8,
            message: '密码长度不能少于 8 位',
            trigger: 'blur',
        },
        {
            pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
            message: '密码必须包含数字和字母',
            trigger: 'blur',
        },
    ],
    repeatedPassword: [
        { required: true, message: '请再次输入密码', trigger: 'blur' },
        {
            // 自定义校验规则
            validator: (rule, value, callback) => {
                if (value === registerData.value.password) {//响应式数据先.value
                    callback();
                } else {
                    callback(new Error('两次输入的密码不一致'));
                }
            },
            trigger: 'blur',
        },
    ],
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        {
            max: 8,
            message: '用户名长度不能超过8位',
            trigger: 'blur'
        }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
        }
    ]
});

//表单引用
const form = ref(null);

// 注册表单提交
import { registerService } from '@/api/user.js';
const register = async () => {
    let result = await registerService(registerData.value);
    if (result.code === 200) {
        console.log('表单验证通过，提交数据:', registerData.value);
        ElMessage.success('注册成功！');
        router.push('/');
    } else {
        ElMessage.error(result.message ? result.message : '注册失败');
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
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="registerData.username" placeholder="请输入用户名"></el-input>
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

.register-form {
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
    /* 平分宽度 */
    height: 100%;
    /* 高度为 500px */
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