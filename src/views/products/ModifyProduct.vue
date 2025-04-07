<script setup>
import { ElMessage} from 'element-plus';
import { ref, nextTick, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getProductDetail, updateProduct } from '@/api/product.js';
import defaultImage from '@/assets/ProductsManage/img/loading.png';

// 获取路由信息及当前商品 id
const route = useRoute();
const router = useRouter();
const productId = route.params.id; // 路由参数中的商品 id

// 用于保存后端返回的完整商品对象
const product = ref(null);

// 存储初始加载的图片 URL，固定长度为5
const originalImageList = ref(new Array(5).fill(null));
// 存储初始加载时的图片 URL 顺序，固定长度为5
const initialImageOrder = ref(new Array(5).fill(null));
// 新增：构造当前图片顺序的数组，长度固定为 5，空槽以 "" 表示
// 构造当前图片顺序的数组，固定长度为5，空槽以""表示
const newImageOrder = computed(() => {
  // 取出所有非空图片的 preview 字符串
  const nonNull = imageList.value
    .filter(item => item !== null && item.preview)
    .map(item => item.preview);
  // 补齐空槽到 5 个
  while (nonNull.length < 5) {
    nonNull.push("");
  }
  return nonNull;
});

// 商品详细信息相关数据
const productName = ref('');              // 商品名称
const productCategory = ref('');          // 商品类别
const productType = ref('');     // 商品类型
const productDescription = ref('');       // 商品描述
const productPrice = ref('');   // 当没有分类项时使用
const productStorage = ref(''); // 当没有分类项时使用

// 图片相关：采用 imageList 数组存储已添加的图片数据，每项 { file, preview }
const imageList = ref([]);
// 当前选中图片槽（下标），以及鼠标悬停时临时展示的下标
const selectedIndex = ref(0);
const activeImageIndex = ref(0);

// computed：构造缩略图列表，如果 imageList 数量不足 5，则最后补一个空槽
const thumbnailList = computed(() => {
  return imageList.value;
});

// computed：主展示区 URL，使用 activeImageIndex（悬停效果）
const mainImageUrl = computed(() => {
  if (imageList.value[activeImageIndex.value]) {
    return imageList.value[activeImageIndex.value].preview;
  } else {
    return '/src/assets/ProductsManage/img/loading.png';
  }
});

// 鼠标悬停：临时更新 activeImageIndex
const handleThumbnailMouseOver = (index) => {
  activeImageIndex.value = index;
};
// 鼠标离开：恢复为选中项
const handleThumbnailMouseLeave = () => {
  activeImageIndex.value = selectedIndex.value;
};
// 点击缩略图：设为选中项
const onThumbnailClick = (index) => {
  selectedIndex.value = index;
  activeImageIndex.value = index;
};

const onImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const preview = URL.createObjectURL(file);
    // 直接更新对应槽
    imageList.value[selectedIndex.value] = { file, preview };
  }
};

const deleteImage = () => {
  if (selectedIndex.value < imageList.value.length) {
    // 过滤掉被删除的那个元素
    let newList = imageList.value.filter((item, index) => index !== selectedIndex.value);
    // 补齐空槽到 5 个
    while (newList.length < 5) {
      newList.push(null);
    }
    // 将新数组赋值给 imageList 以触发响应更新
    imageList.value = newList;
    // 重新计算选中下标：选中最后一个非空图片，如果没有则为0
    const nonNullCount = newList.filter(item => item !== null).length;
    selectedIndex.value = nonNullCount > 0 ? Math.min(selectedIndex.value, nonNullCount - 1) : 0;
    activeImageIndex.value = selectedIndex.value;
  }
};

// 商品分类相关数据
const classificationName = ref('');       // 分类名称
const classificationStorage = ref('');      // 分类库存
const classificationPrice = ref('');      // 分类价格
const classificationItems = ref([]);      // 已添加的分类项数组
const currentClassificationId = ref(null); // 当前编辑的分类项ID
// 控制添加分类表单显示及透明度（用于渐变效果）
const isAddClassificationVisible = ref(false);
const formOpacity = ref(0);

// 显示添加子种类表单
const showAddClassification = async () => {
  // 清空表单字段，确保进入新增模式
  resetClassificationForm();
  isAddClassificationVisible.value = true;
  await nextTick();
  formOpacity.value = 1;
};

// 取消添加子种类
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

// 重置子种类表单
const resetClassificationForm = () => {
  classificationName.value = '';
  classificationStorage.value = '';
  classificationPrice.value = '';
  currentClassificationId.value = null;
};

// 编辑子种类项
const editClassification = (item) => {
  classificationName.value = item.name;
  classificationStorage.value = item.storage;
  classificationPrice.value = item.price;
  currentClassificationId.value = item.id;
  if (!isAddClassificationVisible.value) {
    showAddClassification();
  }
};

// 删除子种类项
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
    productPrice.value = data.price;   
    productStorage.value = data.storage;
    // 固定构造 imageList 数组（长度为5），并保存原始图片 URL
    imageList.value = new Array(5).fill(null);
    originalImageList.value = new Array(5).fill(null);
    for (let i = 1; i <= 5; i++) {
      const pic = data[`picture${i}`];
      if (pic && pic.trim() !== "") {
        const url = `http://localhost:8080/images/${pic}`;
        imageList.value[i - 1] = { file: null, preview: url };
        originalImageList.value[i - 1] = url;
      } else {
        imageList.value[i - 1] = null;
        originalImageList.value[i - 1] = null;
      }
    }
    // 保存初始图片顺序（深拷贝）
    initialImageOrder.value = [...originalImageList.value];
    selectedIndex.value = 0;
    activeImageIndex.value = 0;

    // 回显子种类数据：若存在 editions，则使用后端返回的数据，否则使用默认（单个商品数据）
    if (data.editions && data.editions.length > 0) {
      // 将后端 editions 数据转换为前端子种类数据格式
      classificationItems.value = data.editions.map(edition => ({
        id: edition.id,
        name: edition.editionName,
        storage: edition.storage,
        price: edition.price
      }));
      // 默认回显第一个子种类
      classificationName.value = classificationItems.value[0].name;
      classificationStorage.value = classificationItems.value[0].storage;
      classificationPrice.value = classificationItems.value[0].price;
      currentClassificationId.value = classificationItems.value[0].id;
    } else {
      // 无子种类数据时，使用大商品信息作为默认子种类
      classificationName.value = data.name;
      classificationStorage.value = data.storage;
      classificationPrice.value = data.price;
      classificationItems.value = [{
        id: Date.now(),
        name: classificationName.value,
        storage: classificationStorage.value,
        price: classificationPrice.value
      }];
      currentClassificationId.value = classificationItems.value[0].id;
    }
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
    price = Math.min(...classificationItems.value.map(item => parseFloat(item.price)));
    storage = classificationItems.value.reduce((total, item) => total + parseInt(item.storage), 0);
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
    price:price,
    storage: storage,
    editions: classificationItems.value.map(item => ({
      editionName: item.name,
      price: parseFloat(item.price),
      storage: parseInt(item.storage)
    }))
  };
// 构造 FormData
const formData = new FormData();
formData.append('product', new Blob([JSON.stringify(updatedProduct)], { type: 'application/json' }));
// 将新图片顺序以 JSON 形式传递（直接传字符串）
const plainImageOrder = JSON.parse(JSON.stringify(newImageOrder.value));
formData.append('imageOrder', JSON.stringify(plainImageOrder));

  // 对于每个图片槽 1~5
  for (let i = 0; i < 5; i++) {
    const imgObj = imageList.value[i];
    if (imgObj && imgObj.file) {
      // 如果上传了新文件，则更新该槽
      formData.append(`image_${i+1}`, imgObj.file);
    }
    // 对于未上传新文件，我们不再传空参数，让后端根据 imageOrder 更新
  }
  try {
    // 调试代码：打印 FormData 中的所有数据
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }
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
      <div class="card">
        <div style="padding: 20px 5px 0px 20px;">
          <h2 style="color: #303133;">修改商品信息</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-xl-7 col-xxl-6">
              <!-- Image Selection -->
              <div>
                <div class="row">
                  <!-- 缩略图区域 -->
                  <div class="col-4 col-md-3 col-xxl-2">
                    <div class="nav flex-column nav-outline" role="tablist" aria-orientation="vertical">
                      <a
                        v-for="(item, index) in thumbnailList"
                        :key="index"
                        class="nav-link p-1"
                        :class="{ active: selectedIndex === index }"
                        @mouseover="handleThumbnailMouseOver(index)"
                        @mouseleave="handleThumbnailMouseLeave"
                        @click="onThumbnailClick(index)"
                      >
                        <img
                          v-if="item"
                          :src="item.preview"
                          :alt="`商品图片${index + 1}`"
                          class="img-fluid mx-auto d-block rounded mh-75px"
                        />
                        <img
                          v-else
                          :src="defaultImage"
                          alt="添加图片"
                          class="img-fluid mx-auto d-block rounded mh-75px"
                        />
                      </a>
                    </div>
                  </div>
                  <!-- 主展示区 -->
                  <div class="col-8 col-md-1 col-xxl-9">
                    <div class="tab-content p-3">
                      <div>
                        <img :src="mainImageUrl" alt="预览图片" class="img-fluid" />
                        <div class="row" style="margin-top:10px;">
                          <div class="col-8 col-md-1 col-xxl-7">
                            <input class="form-control mb-3" type="file" @change="onImageChange" :placeholder="imageList[selectedIndex] ? '修改该图片' : '添加图片'" />
                          </div>
                          <div v-if="imageList[selectedIndex]" class="col-8 col-md-1 col-xxl-5">
                            <button class="btn btn-danger" @click="deleteImage">删除图片</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    <!-- 显示已添加的商品种类 -->
                    <div>
                      <h5>Classification商品分类:</h5>
                      <div id="classificationList" class="col-8 col-md-1 col-xxl-10">
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
                                  <label class="col-form-label text-sm-right">名称</label>
                                </div>
                                <div class="col-md col-xxl-10">
                                  <div class="input-group">
                                    <span class="input-group-text">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="edit-3" class="lucide lucide-edit-3 align-middle">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                                      </svg>
                                    </span>
                                    <input type="text" class="form-control" placeholder="Name" v-model="classificationName" />
                                  </div>
                                </div>
                              </div>
                              <div class="mb-3 row">
                                <div class="col-md col-xxl-2">
                                  <label class="col-form-label text-sm-right">库存</label>
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
                                  <label class="col-form-label text-sm-right">价格</label>
                                </div>
                                <div class="col-md col-xxl-10">
                                  <div class="input-group">
                                    <span class="input-group-text">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="shopping-cart" class="lucide lucide-shopping-cart align-middle">
                                        <circle cx="8" cy="21" r="1"></circle>
                                        <circle cx="19" cy="21" r="1"></circle>
                                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                                      </svg>
                                    </span>
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