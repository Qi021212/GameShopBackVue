<script setup>
import { ElMessage } from 'element-plus';
import { ref, nextTick, computed } from 'vue';
import { addProduct } from '@/api/product.js';
import defaultImage from '@/assets/ProductsManage/img/loading.png';

// 商品详细信息相关数据
const productName = ref('');              // 商品名称
const productCategory = ref('');          // 商品类别
const productType = ref('');     // 商品类型（例如：促销版、普通版等）
const productDescription = ref('');       // 商品描述
const productPrice = ref('');   // 当没有分类项时使用
const productStorage = ref(''); // 当没有分类项时使用


// 商品分类相关数据
const classificationName = ref('');       // 分类名称
const classificationStorage = ref('');      // 分类库存
const classificationPrice = ref('');      // 分类价格
const classificationItems = ref([]);      // 已添加的分类项数组
const currentClassificationId = ref(null); // 当前编辑的分类项ID
// 控制添加分类表单显示及透明度（用于渐变效果）
const isAddClassificationVisible = ref(false);
const formOpacity = ref(0);

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

// 图片相关处理
// 定义 imageList 保存已添加的图片对象，每项 { file: File, preview: string }
const imageList = ref([]);
// 记录当前选中的图片槽，下标从 0 开始
const selectedIndex = ref(0);
// activeImageIndex 用于鼠标悬停时临时显示，默认与 selectedIndex 同步
const activeImageIndex = ref(0);

// computed：构造缩略图列表，如果 imageList 数量少于 5，则最后显示一个空槽用于添加新图片
const thumbnailList = computed(() => {
  const list = [...imageList.value];
  if (list.length < 5) {
    list.push(null);
  }
  return list;
});

// computed：主展示区 URL，使用 activeImageIndex 而非 selectedIndex
const mainImageUrl = computed(() => {
  if (imageList.value[activeImageIndex.value]) {
    return imageList.value[activeImageIndex.value].preview;
  } else {
    return defaultImage;
  }
});

// 鼠标悬停：暂时显示悬停项
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

// 文件输入变化：更新当前选中槽，并自动移动到下一个空槽（如果未满5张）
const onImageChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const preview = URL.createObjectURL(file);
    // 如果当前选中槽已有图片（例如用户正在修改），则覆盖，否则新增
    if (selectedIndex.value < imageList.value.length) {
      imageList.value[selectedIndex.value] = { file, preview };
    } else {
      imageList.value.push({ file, preview });
    }
    // 添加完后，如果未满5张，则自动切换到下一个空槽，方便连续添加
    if (imageList.value.length < 5) {
      selectedIndex.value = imageList.value.length;
      activeImageIndex.value = selectedIndex.value;
    } else {
      // 已满5张时，选中最后一张
      selectedIndex.value = 4;
      activeImageIndex.value = 4;
    }
  }
};

// 删除当前选中图片
const deleteImage = () => {
  if (selectedIndex.value < imageList.value.length) {
    imageList.value.splice(selectedIndex.value, 1);
    // 调整选中下标
    if (selectedIndex.value >= imageList.value.length) {
      selectedIndex.value = imageList.value.length - 1;
    }
    activeImageIndex.value = selectedIndex.value;
  }
};

const submitProduct = async () => {
  // 必填项校验
  if (!productName.value.trim()) {
    ElMessage.error('商品名称不能为空');
    return;
  }
  if (!productCategory.value.trim()) {
    ElMessage.error('商品分类不能为空');
    return;
  }

  // 若有分类项，则使用分类项数据，否则使用单独输入的值
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

  const productData = {
    name: productName.value,
    category: productCategory.value,
    type: productType.value,
    // picture: productPicture.value,
    description: productDescription.value,
    // 后端会使用图片文件上传后的文件名，因此这里不传 picture 字段
    price: price,
    storage: storage,
    // 如果存在分类项，则映射为多个子商品；否则以单一子商品的形式提交
    editions: classificationItems.value.length > 0
      ? classificationItems.value.map(item => ({
        editionName: item.name,
        price: parseFloat(item.price),
        storage: parseInt(item.storage)
      }))
      : [{
        editionName: productName.value, // 默认使用商品名称作为版本名称
        price: parseFloat(productPrice.value || 0),
        storage: parseInt(productStorage.value || 0)
      }]

  };

  // 构造 FormData
  const formData = new FormData();
  formData.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }));
  // 遍历 imageList，将每个文件添加，注意参数名与后端一致（可多次 append）
  imageList.value.forEach(imgObj => {
    if (imgObj && imgObj.file) {
      formData.append('image', imgObj.file);
    }
  });
  try {
    const result = await addProduct(formData);
    console.log('添加商品成功:', result);
    ElMessage.success('商品添加成功！');
    // 重置所有表单数据
    productName.value = '';
    productCategory.value = '';
    productType.value = '';
    productDescription.value = '';
    productPrice.value = '';
    productStorage.value = '';
    imageList.value = [];
    selectedIndex.value = 0;
    activeImageIndex.value = 0;
    classificationItems.value = [];
  } catch (error) {
    console.error('提交商品失败:', error);
    ElMessage.error('提交商品失败！');
  }
};
</script>

<template>
  <div class="wrapper">
    <!-- Main Content -->
    <div class="main">
      <div class="card">
        <div style="padding: 20px 5px 0px 20px;">
          <h2 style="color: #303133;">新增商品</h2>
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
                      <!-- 遍历 thumbnailList -->
                      <a v-for="(item, index) in thumbnailList" :key="index" class="nav-link p-1"
                        :class="{ active: selectedIndex === index }" @mouseover="handleThumbnailMouseOver(index)"
                        @mouseleave="handleThumbnailMouseLeave" @click="onThumbnailClick(index)">
                        <img v-if="item" :src="item.preview" :alt="`商品图片${index + 1}`"
                          class="img-fluid mx-auto d-block rounded mh-75px" />
                        <img v-else :src="defaultImage" alt="添加图片" class="img-fluid mx-auto d-block rounded mh-75px" />
                      </a>
                    </div>
                  </div>
                  <!-- 主展示区 -->
                  <div class="col-8 col-md-1 col-xxl-9">
                    <div class="tab-content p-3">
                      <div>
                        <img :src="mainImageUrl" alt="预览图片" class="img-fluid" />
                        <!-- 如果当前选中的槽已有图片，则显示修改和删除按钮，否则显示添加按钮 -->
                        <div class="row">
                          <!-- <div style="margin-top:10px;"> -->
                          <div class="col-8 col-md-1 col-xxl-7" style="margin-top:10px;">
                            <input class="form-control mb-3" type="file" @change="onImageChange"
                              :placeholder="imageList[selectedIndex] ? '修改该图片' : '添加图片'" />
                          </div>
                          <div v-if="imageList[selectedIndex]" class="col-8 col-md-1 col-xxl-5"
                            style="margin-top:10px;">
                            <button class="btn btn-danger" @click="deleteImage">删除图片</button>
                          </div>

                          <!-- </div> -->
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 显示已添加的商品种类 -->
                  <div>
                    <h5>Classification商品分类:</h5>
                    <div id="classificationList" class="col-8 col-md-1 col-xxl-10">
                      <!-- 使用 v-for 循环展示每个商品种类 -->
                      <div v-for="item in classificationItems" :key="item.id"
                        class="input-group mb-3 classification-item">
                        <span class="input-group-text form-control-lg price">￥{{ item.price }}</span>
                        <span class="form-control form-control-lg name">{{ item.name }}</span>
                        <span class="input-group-text form-control-lg storage me-2">{{ item.storage }}件</span>
                        <button class="btn btn-warning btn-sm editBtn badge-subtle-warning rounded-1"
                          @click="editClassification(item)">修改</button>
                        <button class="btn btn-danger btn-sm deleteBtn badge-subtle-danger rounded-1"
                          @click="deleteClassification(item.id)">删除</button>
                      </div>
                    </div>
                  </div>
                  <div class="col-8 col-md-1 col-xxl-10">
                    <!-- 添加商品种类功能子框，带渐变过渡效果 -->
                    <div v-if="isAddClassificationVisible" class="card" id="classificationForm"
                      :style="{ opacity: formOpacity }">
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
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" data-lucide="edit-3"
                                    class="lucide lucide-edit-3 align-middle">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                                  </svg>
                                </span>
                                <input type="text" class="form-control" placeholder="Name"
                                  v-model="classificationName" />
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
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" data-lucide="database"
                                    class="lucide lucide-database align-middle">
                                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                    <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                                    <path d="M3 12A9 3 0 0 0 21 12"></path>
                                  </svg>
                                </span>
                                <input type="text" class="form-control" placeholder="Storage"
                                  v-model="classificationStorage" />
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
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" data-lucide="shopping-cart"
                                    class="lucide lucide-shopping-cart align-middle">
                                    <circle cx="8" cy="21" r="1"></circle>
                                    <circle cx="19" cy="21" r="1"></circle>
                                    <path
                                      d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12">
                                    </path>
                                  </svg>
                                </span>
                                <input type="text" class="form-control" placeholder="Price"
                                  v-model="classificationPrice" />
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
                            <option class="badge-subtle-secondary">casul</option>
                            <option class="badge-subtle-success">role</option>
                            <option class="badge-subtle-danger">adventure</option>
                            <option class="badge-subtle-warning">sports</option>
                            <option class="badge-subtle-info">simulation</option>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                          data-lucide="tag" class="lucide lucide-tag align-middle">
                          <path
                            d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z">
                          </path>
                          <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle>
                        </svg>
                      </span>
                      <input type="text" class="form-control" placeholder="具体分类" v-model="productType">
                    </div>
                    <div class="mt-2 mb-3">
                      <div class="form-floating">
                        <textarea class="form-control" placeholder="Leave a comment here" id="floatingTextarea1"
                          style="height: 200px" v-model="productDescription"></textarea>
                        <label for="floatingTextarea1">
                          游戏介绍
                        </label>
                      </div>
                    </div>
                    <div class="mt-2 mb-3">
                      <!-- 添加商品种类按钮 -->
                      <div>
                        <a class="btn btn-primary mb-3 me-1" v-if="!isAddClassificationVisible"
                          @click="showAddClassification">
                          <span class="align-middle">添加商品种类</span>
                        </a>
                        <button type="button" class="btn btn-primary mb-3 me-1" @click="submitProduct">
                          <i class="align-middle">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                              stroke-linejoin="round" data-lucide="edit" class="lucide lucide-edit align-middle me-2">
                              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                            </svg>
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
