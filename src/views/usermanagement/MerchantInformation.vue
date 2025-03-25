<!-- src/views/usermanagement/MerchantInformation.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTokenStore } from '@/stores/token';
import { useMerchantInfoStore } from '@/stores/MerchantInfo';
import { userInfoService, updateUserInfoService } from '@/api/merchant.js';
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton, ElCard, ElRow, ElCol } from 'element-plus';

const router = useRouter();
const tokenStore = useTokenStore();
const merchantInfoStore = useMerchantInfoStore();

const localMerchantInfo = ref({
    id: '',
    merchantname: '',
    email: ''
});

const form = ref(null);

const rules = ref({
    merchantname: [
        { required: true, message: '请输入商家名称', trigger: 'blur' },
        { pattern: /^\S{2,20}$/, message: '商家名称必须是2-20位的非空字符串', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ]
});

const getMerchantInfo = async () => {
    if (!tokenStore.isAuthenticated) {
        ElMessage.error('请先登录');
        router.push('/');
        return;
    }
    try {
        const id = merchantInfoStore.info?.id; // 只使用 merchantInfoStore
        if (!id || isNaN(id)) {
            ElMessage.error('无法获取商家ID，请重新登录');
            router.push('/');
            return;
        }
        await merchantInfoStore.fetchMerchantInfo(id);
        localMerchantInfo.value = JSON.parse(JSON.stringify(merchantInfoStore.info));
    } catch (error) {
        ElMessage.error(error.message || '获取信息失败');
    }
};

onMounted(() => {
    getMerchantInfo();
});

const updateMerchant = async () => {
    try {
        await form.value.validate();
        const result = await updateUserInfoService(localMerchantInfo.value);
        if (result.success) {
            ElMessage.success(result.message || '修改成功');
            merchantInfoStore.setInfo(localMerchantInfo.value);
        } else {
            ElMessage.error(result.message || '修改失败');
        }
    } catch (error) {
        ElMessage.error(error.message || '修改失败');
    }
};
</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>商家资料</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-form :model="localMerchantInfo" :rules="rules" ref="form" label-width="100px" size="large">
                    <el-form-item label="商家ID" prop="id">
                        <el-input v-model="localMerchantInfo.id" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="商家名称" prop="merchantname">
                        <el-input v-model="localMerchantInfo.merchantname"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="localMerchantInfo.email"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updateMerchant">提交修改</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </el-card>
</template>

<style scoped>
.page-container {
    margin: 20px;
}
.header {
    font-size: 18px;
    font-weight: bold;
}
</style>