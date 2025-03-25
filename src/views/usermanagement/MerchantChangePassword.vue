<script setup>
import { ref } from 'vue'
import {MerchantResetPasswordService } from '@/api/merchant.js'
import { ElMessage } from 'element-plus'
import { useTokenStore } from '@/stores/token.js'
import {useMerchantInfoStore} from '@/stores/MerchantInfo.js'
import { useRouter } from 'vue-router'

const pwdModel = ref({
    old_pwd: '',
    new_pwd: '',
    con_pwd: ''
})
//自定义确认密码的校验函数
const rePasswordValid = (rule, value, callback) => {
    if (value == null || value === '') {
        callback(new Error('请再次确认密码'))
    } else if (value !== pwdModel.value.new_pwd) {
        callback(new Error('两次输入密码不一致'))
    } else {
        callback()
    }
}
const rules = ref({
    old_pwd: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 5, max: 16, message: '密码长度必须为5~16位', trigger: 'blur' }
    ],
    new_pwd: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 8, message: '密码长度不能少于 8 位', trigger: 'blur' },
        { pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: '密码必须包含数字和字母', trigger: 'blur' },
    ],
    con_pwd: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { validator: rePasswordValid, trigger: 'blur' }
    ]
})
const formRef = ref(null)
const router = useRouter()
const submit = () => {
    //1.表单校验
    if (!formRef.value) return
    formRef.value.validate(async (valid) => {
        if (valid) {
            //2.调用更新密码接口
            let result = await MerchantResetPasswordService(pwdModel.value)
            let message = result.message
            if (result.code == 0) {
                if (result.code == 0) {
                    ElMessage.success(message ? message : '密码修改成功!')
                    //3.密码修改成功,清空token和用户信息
                    useTokenStore().removeToken()
                    useMerchantInfoStore().removeInfo()
                    //4.重新登录
                    router.push("/Merchantlogin")//组合式
                }
            } else {
                ElMessage.error(message ? message : '重置失败!')
            }
        }
    })
}
</script>
<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>重置密码</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-form ref="formRef" :model="pwdModel" :rules="rules" label-width="100px" size="large">
                    <el-form-item label="旧密码" prop="old_pwd">
                        <el-input type="password" v-model="pwdModel.old_pwd" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="new_pwd">
                        <el-input type="password" v-model="pwdModel.new_pwd" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码" prop="con_pwd">
                        <el-input type="password" v-model="pwdModel.con_pwd" show-password></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submit">提交修改</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </el-card>
</template>
