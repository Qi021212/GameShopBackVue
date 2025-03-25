<script>
import {
  addUser,
  getUserById,
  updateUserById,
  removeUserById,
  resetPasswordById
} from '@/api/user';
import { ElMessage } from 'element-plus';
import { Edit, Delete, Setting, Refresh, Search } from '@element-plus/icons-vue';
import { fetchUserList } from '@/api/user';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UserList',
  components: {
    Edit,
    Delete,
    Setting,
    Refresh,
    Search,
  },
  data() {
    // 定义校验规则
    const checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_-]+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error('请输入合法的邮箱'));
    };

    return {
      // 分页及查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      // 用户列表数据及总数
      userlist: [],
      total: 0,

      // 添加用户对话框及表单数据
      addDialogVisible: false,
      addForm: {
        username: '',
        email: '',
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
      },

      // 修改用户对话框及表单数据
      editDialogVisible: false,
      editForm: {},
      isSubmitting: false, // 添加提交状态
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
      },
    };
  },
  created() {
    // 初始化加载用户列表
    this.getUserList();
  },
  methods: {
    // 获取用户列表方法
    async getUserList() {
      try {
        const response = await fetchUserList(this.queryInfo);
        console.log('API 响应:', response);
        const res = response.data;
        console.log('后端返回数据:', res);
        if (!res || !res.meta || typeof res.meta.status !== 'number') {
          ElMessage.error('获取用户列表失败！响应格式不正确');
          return;
        }
        if (res.meta.status !== 200) {
          ElMessage.error('获取用户列表失败！');
          return;
        }
        if (Array.isArray(res.data.users)) {
          this.userlist = res.data.users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
          }));
          this.total = res.data.total;
        } else {
          console.error('用户列表数据格式不正确:', res.data.users);
          ElMessage.error('用户列表数据格式不正确');
        }
      } catch (error) {
        console.error('获取用户列表时出错:', error.message);
        ElMessage.error('服务器异常，请稍后重试！');
      }
    },

    // 当每页显示条数改变时触发
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 当当前页码改变时触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 添加用户对话框关闭时重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加新用户
    async addUser() {
  this.$refs.addFormRef.validate(async (valid) => {
    if (!valid) return;
    try {
      const response = await addUser(this.addForm);
      const res = response.data; // 确保提取 data
      console.log('Response data:', res);
      if (!res.meta || res.meta.status !== 201) { // 添加额外的检查
        console.log('Invalid response format or status not 201:', res);
        return ElMessage.error('添加用户失败！');
      }
      ElMessage.success('添加用户成功！');
      this.addDialogVisible = false;
      this.getUserList();
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error);
      ElMessage.error('添加用户失败！');
    }
  });
},
    // 展示编辑用户对话框
    async openEditDialog(id) {
      console.log('开始获取用户信息，ID:', id);
      this.editDialogVisible = true;
      console.log('设置 editDialogVisible 为 true:', this.editDialogVisible);
      try {
        const { data: res } = await getUserById(id);
        console.log('获取用户信息响应:', res);
        if (res.meta.status !== 200) {
          console.warn('获取用户信息失败，状态码:', res.meta.status, '消息:', res.meta.msg);
          this.editDialogVisible = false;
          console.log('设置 editDialogVisible 为 false:', this.editDialogVisible);
          return ElMessage.error(`查询用户信息失败：${res.meta.msg || '未知错误'}`);
        }
        // 检查 user 是否为空
        if (!res.data.user || Object.keys(res.data.user).length === 0) {
          console.warn('用户信息为空:', res.data.user);
          this.editDialogVisible = false;
          console.log('设置 editDialogVisible 为 false:', this.editDialogVisible);
          return ElMessage.error('用户信息为空，请联系管理员！');
        }
        // 过滤掉 password 字段（如果后端未过滤）
        const { password, ...filteredUser } = res.data.user;
        this.editForm = filteredUser;
        console.log('过滤后的用户信息:', this.editForm);
        console.log('对话框状态:', this.editDialogVisible);
      } catch (error) {
        console.error('查询用户信息时出错:', error);
        this.editDialogVisible = false;
        console.log('设置 editDialogVisible 为 false:', this.editDialogVisible);
        if (error.response && error.response.status === 404) {
          console.log('用户不存在，状态码:', error.response.status);
          ElMessage.error('用户不存在，请刷新列表后重试！');
        } else {
          const errorMessage = error.message || '未知错误';
          console.error('服务器异常:', errorMessage, '错误详情:', error);
          ElMessage.error(`服务器异常: ${errorMessage}，请稍后重试！`);
        }
      }
    },
    // 修改用户对话框关闭时重置表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用户信息
    async editUserInfo() {
    console.log('开始编辑用户信息:', this.editForm);
    this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
            console.warn('表单验证失败');
            return;
        }
        try {
            const { data: res } = await updateUserById(this.editForm.id, {
                email: this.editForm.email,
            });
            console.log('更新用户信息响应:', res);
            console.log('res 类型:', typeof res);

            // 关闭对话框
            this.editDialogVisible = false;
            console.log('更新完成，开始刷新列表');

            // 无论响应格式如何，显示成功提示并刷新页面
            ElMessage.success('更新用户信息成功！');

            // 刷新用户列表
            try {
                await this.getUserList();
            } catch (getError) {
                console.error('刷新用户列表时出错:', getError);
                ElMessage.warning('用户列表刷新失败，将重新加载页面！');
                // 如果 getUserList 失败，直接重新加载页面
                location.reload();
            }
        } catch (error) {
            console.error('更新用户信息时出错:', error);
            const errorMessage = error.response?.data?.meta?.msg || error.message || '未知错误';
            ElMessage.error(`更新用户信息失败：${errorMessage}`);
            // 即使更新失败，也尝试刷新页面
            try {
                await this.getUserList();
            } catch (getError) {
                console.error('刷新用户列表时出错:', getError);
                ElMessage.warning('用户列表刷新失败，将重新加载页面！');
                location.reload();
            }
        }
    });
},
  
    // 删除用户
    async removeUserById(id) {
  try {
    await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const response = await removeUserById(id); // 获取响应
    const res = response.data;
    if (res.meta.status !== 200) {
      return ElMessage.error(`删除用户失败：${res.meta.msg || '未知错误'}`);
    }
    ElMessage.success('删除用户成功！');
    this.getUserList();
  } catch (error) {
    if (error.message === 'cancel') {
      return ElMessage.info('已取消删除');
    }
  }
},
async resetPassword(id) {
    try {
        await this.$confirm('确定要重置该用户的密码为初始密码吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        });
    } catch (error) {
        return ElMessage.info('已取消重置密码');
    }

    try {
        if (!id || id <= 0) {
            return ElMessage.error('用户ID 无效');
        }
        const requestData = { userId: id.toString(), newPassword: '123456' };
        console.log('发送重置密码请求:', requestData);
        const { data: res } = await resetPasswordById(id, requestData);
        if (!res || !res.meta || typeof res.meta.status !== 'number') {
            return ElMessage.error('重置密码失败：响应格式不正确');
        }
        if (res.meta.status === 404) {
            return ElMessage.error('用户不存在，请确认用户ID是否正确');
        }
        if (res.meta.status === 500) {
            return ElMessage.error('服务器内部错误，请联系管理员');
        }
        if (res.meta.status !== 200) {
            return ElMessage.error(`重置密码失败：${res.meta.msg || '未知错误'}`);
        }
        ElMessage.success('密码已重置为初始密码！');
    } catch (error) {
        console.error('重置密码时出错:', error);
        const errorMessage = error.response?.data?.meta?.msg || error.message || '未知错误';
        ElMessage.error(`重置密码失败：${errorMessage}`);
    }
}
  },
});
</script>

<template>
  <div>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <template #header>
        <div class="header">
          <span>用户列表</span>
        </div>
      </template>

      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 使用 el-input 的 append 插槽放置搜索按钮 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <template #append>
              <!-- 使用新图标写法 -->
              <el-button size="small" circle @click="getUserList">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index" />
        <el-table-column label="姓名" prop="username" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="操作">
          <template #default="scope">
            <div style="display: flex; gap: 8px; overflow-x: auto; white-space: nowrap;">
              <el-button type="primary" size="small" @click="openEditDialog(scope.row.id)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="removeUserById(scope.row.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
              <el-button type="info" size="small" @click="resetPassword(scope.row.id)">
                <el-icon><Refresh /></el-icon>
                重置密码
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        v-model:current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        v-model:page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      v-model="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 表单主体 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
      </el-form>

      <!-- 对话框底部操作 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户信息"
      v-model="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 表单主体 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <!-- 对话框底部操作 -->
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.header {
  font-weight: bold;
}
</style>
