<script setup>
import { ElMessage} from 'element-plus';
import { ref, nextTick, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProductDetail, updateProduct } from '@/api/product.js';

// 获取路由信息及当前商品 id
const route = useRoute();
const router = useRouter();
const productId = route.params.id; // 路由参数中的商品 id

// 用于保存后端返回的完整商品对象
const product = ref(null);

// 商品详细信息相关数据
const productName = ref('');              // 商品名称
const productCategory = ref('');          // 商品类别
const productType = ref('');     // 商品类型
const productDescription = ref('');       // 商品描述
const productPrice = ref('');   // 当没有分类项时使用
const productStorage = ref(''); // 当没有分类项时使用
// 新增：定义 productPicture 变量，用于存储默认图片或上传图片
const productPicture = ref('/src/assets/default.png');
// 新增变量保存图片文件和预览 URL
const selectedImageFile = ref(null);
const imagePreview = ref('/src/assets/default.png'); // 默认图片

// 商品分类相关数据
const classificationName = ref('');       // 分类名称
const classificationStorage = ref('');      // 分类库存
const classificationPrice = ref('');      // 分类价格
const classificationItems = ref([]);      // 已添加的分类项数组
const currentClassificationId = ref(null); // 当前编辑的分类项ID
// 控制添加分类表单显示及透明度（用于渐变效果）
const isAddClassificationVisible = ref(false);
const formOpacity = ref(0);

// 处理文件输入变化事件
const onImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedImageFile.value = file;
    // 使用 URL.createObjectURL 获取图片预览 URL
    imagePreview.value = URL.createObjectURL(file);
  }
};

// 显示添加分类表单
const showAddClassification = async () => {
  isAddClassificationVisible.value = true;
  await nextTick();
  formOpacity.value = 1;
};

// 取消添加分类
const cancelAddClassification = () => {
  formOpacity.value = 0;
  setTimeout(() => {
    isAddClassificationVisible.value = false;
  }, 500);
};

//信息校验
// 提交分类表单
const submitClassification = () => {
  if (!classificationName.value || !classificationStorage.value || !classificationPrice.value) {
    alert("请填写完整的信息！");
    return;
  }
  if (currentClassificationId.value) {
    // 编辑模式，更新现有分类项
    const index = classificationItems.value.findIndex(item => item.id === currentClassificationId.value);
    if (index !== -1) {
      classificationItems.value[index] = {
        id: currentClassificationId.value,
        name: classificationName.value,
        storage: classificationStorage.value,
        price: classificationPrice.value,
      };
    }
  } else {
    // 新增模式：添加新分类项，使用 Date.now() 生成唯一 ID
    classificationItems.value.push({
      id: Date.now(),
      name: classificationName.value,
      storage: classificationStorage.value,
      price: classificationPrice.value,
    });
  }
  resetClassificationForm();
};

// 重置分类表单
const resetClassificationForm = () => {
  classificationName.value = '';
  classificationStorage.value = '';
  classificationPrice.value = '';
  currentClassificationId.value = null;
};

// 编辑分类项
const editClassification = (item) => {
  classificationName.value = item.name;
  classificationStorage.value = item.storage;
  classificationPrice.value = item.price;
  currentClassificationId.value = item.id;
  if (!isAddClassificationVisible.value) {
    showAddClassification();
  }
};

// 删除分类项
const deleteClassification = (id) => {
  classificationItems.value = classificationItems.value.filter(item => item.id !== id);
};

// 获取商品详情并将数据填入表单
const fetchProductDetail = async () => {
  if (!productId) {
    ElMessage.error('商品 id 缺失');
    return;
  }
  try {
    const data = await getProductDetail(productId);
    console.log('获取到的商品详情数据：', data);
    product.value = data;
    // 将获取的数据填入各个表单字段
    productName.value = data.name;
    productCategory.value = data.category;
    productType.value = data.type;
    productDescription.value = data.description;
    productPrice.value = data.price;    // 注意：如果 price 是数字，可直接赋值
    productStorage.value = data.storage;
    // 如果存在图片，则设置图片预览（注意：根据实际图片访问路径修改）
    imagePreview.value = data.picture ? `http://localhost:8080/images/${data.picture}` : '/src/assets/default.png';

    // 使用商品数据填充商品分类（目前模拟为商品名称、库存和价格）
    classificationName.value = data.name;
    classificationStorage.value = data.storage;
    classificationPrice.value = data.price;
    classificationItems.value = [
      { id: Date.now(), name: classificationName.value, storage: classificationStorage.value, price: classificationPrice.value }
    ];
    currentClassificationId.value = classificationItems.value[0].id;
  } catch (error) {
    ElMessage.error('获取商品详情失败');
  }
};

onMounted(fetchProductDetail);


// 提交更新
const submitModifiedProduct = async () => {
  // 基本校验
  if (!productName.value.trim() || !productCategory.value.trim() || parseFloat(productPrice.value) <= 0) {
    ElMessage.error('请填写完整且正确的信息');
    return;
  }
  // 必填项校验
  if (!productName.value.trim()) {
    ElMessage.error('商品名称不能为空');
    return;
  }
  if (!productCategory.value.trim()) {
    ElMessage.error('商品分类不能为空');
    return;
  }

  // 若有分类项，则可根据需要处理，此处略（与添加页面类似）
  let price = 0.0;
  let storage = 0;
  if (classificationItems.value.length > 0) {
    price = parseFloat(classificationItems.value[0].price);
    storage = parseFloat(classificationItems.value[0].storage);
  } else {
    price = parseFloat(productPrice.value || 0);
    storage = parseFloat(productStorage.value || 0);
  }
  

  if (price <= 0) {
    ElMessage.error('商品价格必须大于0');
    return;
  }
  // 构造更新数据对象
  const updatedProduct = {
    name: productName.value,
    category: productCategory.value,
    type: productType.value,
    description: productDescription.value,
    price: parseFloat(productPrice.value),
    storage: parseInt(productStorage.value)
  };
  // 构造 FormData
  const formData = new FormData();
  formData.append('product', new Blob([JSON.stringify(updatedProduct)], { type: 'application/json' }));
  if (selectedImageFile.value) {
    formData.append('image', selectedImageFile.value);
  }
  try {
    const result = await updateProduct(productId, formData);
    console.log('商品更新成功:', result);
    ElMessage.success('商品更新成功！');
    // 跳转回详情页或其他页面
    router.push(`/productsDetail/${productId}`);
  } catch (error) {
    console.error('提交商品更新失败:', error);
    ElMessage.error('提交商品更新失败！');
  }
};
</script>

<template>
  <div class="wrapper">
    <!-- Main Content -->
    <div class="main">
      <h1 class="h3 mb-3">Add Product</h1>

      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-xl-7 col-xxl-6">
              <!-- Image Selection -->
              <div>
                <div class="row">
                  <div class="col-4 col-md-3 col-xxl-3">
                    <div class="nav flex-column nav-outline">
                      <a class="nav-link active mb-2" data-bs-toggle="pill" href="#product-1" role="tab">
                        <img src="../../assets/ProductsManage/img/001.png" class="img-fluid rounded mh-75px" />
                      </a>
                      <a class="nav-link mb-2" data-bs-toggle="pill" href="#product-2" role="tab">
                        <img src="../../assets/ProductsManage/img/002.png" class="img-fluid rounded mh-75px" />
                      </a>
                      <a class="nav-link mb-2" data-bs-toggle="pill" href="#product-3" role="tab">
                        <img src="../../assets/ProductsManage/img/003.png" class="img-fluid rounded mh-75px" />
                      </a>
                    </div>
                  </div>
                  <div class="col-8 col-md-1 col-xxl-7">
                  <div class="tab-content p-3">
                    <div class="tab-pane fade active show" id="product-1" role="tabpanel">
                      <div>
                        <!-- 当选择文件后显示预览 -->
                        <img :src="imagePreview" class="img-fluid mb-3" alt="预览图片" />
                        <input class="form-control form-control-lg mb-3" type="file" placeholder="添加图片" @change="onImageChange" />
                      </div>
                    </div>
                  </div>
                </div>
                    <!-- 显示已添加的商品种类 -->
                    <div>
                      <h5>Classification商品分类:</h5>
                      <div id="classificationList" class="col-8 col-md-1 col-xxl-10">
                        <!-- 使用 v-for 循环展示每个商品种类 -->
                        <div
                          v-for="item in classificationItems"
                          :key="item.id"
                          class="input-group mb-3 classification-item"
                        >
                          <span class="input-group-text form-control-lg price">￥{{ item.price }}</span>
                          <span class="form-control form-control-lg name">{{ item.name }}</span>
                          <span class="input-group-text form-control-lg storage me-2">{{ item.storage }}件</span>
                          <button class="btn btn-warning btn-sm editBtn badge-subtle-warning rounded-1" @click="editClassification(item)">修改</button>
                          <button class="btn btn-danger btn-sm deleteBtn badge-subtle-danger rounded-1" @click="deleteClassification(item.id)">删除</button>
                        </div>
                      </div>
                    </div>
                    <div class="col-8 col-md-1 col-xxl-10">
                    <!-- 添加商品种类功能子框，带渐变过渡效果 -->
                    <div v-if="isAddClassificationVisible" class="card" id="classificationForm" :style="{ opacity: formOpacity }">
                          <div class="card-body">
                            <form @submit.prevent="submitClassification">
                              <h5 class="card-title md-6">添加商品种类</h5>
                              <div class="mb-3 row">
                                <div class="col-md col-xxl-2">
                                  <label class="col-form-label text-sm-right">Name</label>
                                </div>
                                <div class="col-md col-xxl-10">
                                  <div class="input-group">
                                    <span class="input-group-text">@</span>
                                    <input type="text" class="form-control" placeholder="Name" v-model="classificationName" />
                                  </div>
                                </div>
                              </div>
                              <div class="mb-3 row">
                                <div class="col-md col-xxl-2">
                                  <label class="col-form-label text-sm-right">Storage</label>
                                </div>
                                <div class="col-md col-xxl-10">
                                  <div class="input-group">
                                    <span class="input-group-text">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="database" class="lucide lucide-database align-middle">
                                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                        <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                                        <path d="M3 12A9 3 0 0 0 21 12"></path>
                                      </svg>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Storage" v-model="classificationStorage" />
                                  </div>
                                </div>
                              </div>
                              <div class="mb-3 row">
                                <div class="col-md col-xxl-2">
                                  <label class="col-form-label text-sm-right">Price</label>
                                </div>
                                <div class="col-md col-xxl-10">
                                  <div class="input-group">
                                    <span class="input-group-text">@</span>
                                    <input type="text" class="form-control" placeholder="Price" v-model="classificationPrice" />
                                  </div>
                                </div>
                              </div>
                              <div class="row">
                                <div class="col-sm-10 ml-sm-auto">
                                  <button type="submit" class="btn btn-primary">提交</button>
                                  <button type="button" class="btn btn-light" @click="cancelAddClassification">取消</button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                    </div>

                </div>
              </div>
            </div>

            <!--商品详细信息-->
            <div class="col-xl-5 col-xxl-6">
									<div class="mt-3">
										<h4 class="mt-1">商品详细信息</h4>
										<div class="col-4 col-md-3 col-xxl-10">
											<div class="mt-3">
												<div class="row g-2">
													<div class="col-md col-xxl-8">
														<div class="input-group mb-3">
															<span class="input-group-text form-control-lg">@</span>
															<input type="text" class="form-control" placeholder="游戏名称" v-model="productName">
														</div>
													</div>
													<div class="col-md col-xxl-4">
														<div class="input-group ">
															<select class="form-select form-control-lg" v-model="productCategory">
															<option>category</option>
                              <option class="badge-subtle-primary">action</option>
                                <option class="badge-subtle-secondary">adventure</option>
                                <option class="badge-subtle-success">casul</option>
                                <option class="badge-subtle-danger">role</option>
                                <option class="badge-subtle-warning">simulation</option>
                                <option class="badge-subtle-info">sports</option>
														  </select>
														</div>
													</div>
												</div>
											</div>
										</div>

										<div class="row mb-3 mt-3">
											<div class="col-md-10">
                        <div class="input-group mb-3">
															<span class="input-group-text form-control-lg">
															  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="tag" class="lucide lucide-tag align-middle"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>
                              </span>
															<input type="text" class="form-control" placeholder="游戏类型Type" v-model="productType">
										    </div>
												<div class="mt-2 mb-3">
													<div class="form-floating">
														<textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea1" style="height: 200px" v-model="productDescription"></textarea>
														<label for="floatingTextarea1">
															游戏介绍
														</label>
													</div>
												</div>
												<div class="mt-2 mb-3">
                          <!-- 添加商品种类按钮 -->
                          <div>
                            <a class="btn btn-primary mb-3 me-1" v-if="!isAddClassificationVisible" @click="showAddClassification">
                              <span class="align-middle">添加商品种类</span>
                            </a>
                            <button type="button" class="btn btn-primary mb-3 me-1" @click="submitModifiedProduct">
                              <i class="align-middle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="edit" class="lucide lucide-edit align-middle me-2"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                              </i>
                              <span class="align-middle">提交商品信息</span>
                            </button>
                          </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../assets/ProductsManage/app.css";
@import "../../assets/ProductsManage/AddProductBar.css";
</style>