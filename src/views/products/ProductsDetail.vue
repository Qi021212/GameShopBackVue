<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { getProductDetail } from '@/api/product.js';
import { ElMessage } from 'element-plus';
import ModifyProduct from "@/views/products/ModifyProduct.vue"; 


const route = useRoute();
const router = useRouter();

const product = ref([]);

const fetchProductDetail = async () => {
  const id = route.params.id; // 获取路由参数
  if (!id) {
    ElMessage.error('商品 id 缺失');
    return;
  }
  try {
    console.log('id：', id);
    const data = await getProductDetail(id);
    console.log('获取到的商品详情数据：', data);
    product.value = data;
  } catch (error) {
    ElMessage.error('获取商品详情失败');
  }
};


// 初始化点赞和评论数据
const likes = ref([
  { count: 2, active: false }, // 点赞数据，count 为点赞数量，active 表示是否已点赞
]);
const comments = ref([
  { count: 1, visible: false }, // 评论数据，count 为评论数量，visible 控制子评论显示
]);
// 切换点赞状态
const toggleLike = (index) => {
  const like = likes.value[index];
  like.active = !like.active;
  like.count = like.active ? like.count + 1 : like.count - 1; // 点赞数增加或减少
};
// 切换评论区显示状态
const toggleComments = (index) => {
  comments.value[index].visible = !comments.value[index].visible; // 切换评论区显示
};

// 定义跳转到 goToModifyProduct 页面的方法
const goToModifyProduct = (id) => {
  router.push(`/modifyProduct/${id}`);
};

onMounted(fetchProductDetail);
</script>

<template>
    <div class="wrapper">
      <div class="main">
        <h1 class="h3 mb-3">Product Details</h1>
        <div class="card" v-if="product">
          <div class="card-body">
            <div class="row">
              <div class="col-xl-7 col-xxl-6">
                <div>
                  <div class="row">
                    <div class="col-4 col-md-3 col-xxl-2">
                      <div class="nav flex-column nav-outline" role="tablist" aria-orientation="vertical">
                        <a class="nav-link active mb-2" data-bs-toggle="pill" href="#product-1" role="tab" aria-controls="product-1" aria-selected="true">
                          <img src="@/assets/ProductsManage/img/001.png" alt="" class="img-fluid mx-auto d-block rounded mh-75px">
                        </a>
                        <a class="nav-link mb-2" data-bs-toggle="pill" href="#product-2" role="tab" aria-controls="product-2" aria-selected="false" tabindex="-1">
                          <img src="@/assets/ProductsManage/img/002.png" alt="" class="img-fluid mx-auto d-block rounded mh-75px">
                        </a>
                        <a class="nav-link mb-2" data-bs-toggle="pill" href="#product-2" role="tab" aria-controls="product-2" aria-selected="false" tabindex="-1">
                          <img src="@/assets/ProductsManage/img/003.png" alt="" class="img-fluid mx-auto d-block rounded mh-75px">
                        </a>
                        <a class="nav-link mb-2" data-bs-toggle="pill" href="#product-2" role="tab" aria-controls="product-2" aria-selected="false" tabindex="-1">
                          <img src="@/assets/ProductsManage/img/004.png" alt="" class="img-fluid mx-auto d-block rounded mh-75px">
                        </a>
                      </div>
                    </div>
                    <div class="col-8 col-md-1 col-xxl-9">
                      <div class="tab-content p-3">
                        <div class="tab-pane fade active show" id="product-1" role="tabpanel">
                          <div>
                            <img :src="product.picture ? `http://localhost:8080/images/${product.picture}` : '/src/assets/ProductsManage/img/001.png'" alt="商品图片" class="img-fluid" />
                          </div>
                        </div>
                        <div class="tab-pane fade" id="product-2" role="tabpanel">
                          <div>
                            <img src="@/assets/ProductsManage/img/002.png" alt="" class="img-fluid mx-auto d-block">
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div>
                      <h5>Classification商品分类:</h5>
                      <div id="classificationList" class="col-8 col-md-1 col-xxl-10">
                        <!-- 使用 v-for 循环展示每个商品种类 -->
                        <div class="input-group mb-3 classification-item">
                          <span class="input-group-text form-control-lg price">￥{{ product.price }}</span>
                          <span class="form-control form-control-lg name">{{ product.name }}</span>
                          <span class="input-group-text form-control-lg storage me-2">{{ product.storage }}件</span>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-xl-5 col-xxl-5">
                <h4 class="mt-1">{{ product.name }}</h4>
                <span class="badge badge-subtle-primary">{{ product.category }}</span>
                <p class="mb-3">
                  <i class="fa-solid text-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="star" class="lucide lucide-star align-middle me-2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </i> 4.6 <span class="text-muted">out of 40 Reviews</span>
                </p>
  
                <h4 class="mb-3">Price: ￥{{ product.price }}</h4>
  
                <div class="row mb-3">
                    <div class="col-md-12">
                        <p class="text-muted mb-4">
                            <i class="align-middle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="map" class="lucide lucide-map align-middle me-2"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"></path><path d="M15 5.764v15"></path><path d="M9 3.236v15"></path></svg>
                            </i>
                            <span class="align-middle">Description：{{ product.description }}</span>
                        </p>	
                        <p class="text-muted">
                            <i class="align-middle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="tag" class="lucide lucide-tag align-middle me-2"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>
                            </i>
                            <span class="align-middle">Type:{{ product.type }}</span>
                        </p>
                        <p class="text-muted">
                            <i class="align-middle">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="database" class="lucide lucide-database align-middle me-2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
                            </i>
                            <span class="align-middle">Storage:{{ product.storage }}件</span>
                        </p>

                    </div>
                </div>
  

                <button class="btn btn-primary mb-3 me-1" @click="goToModifyProduct(product.id)">
                  <i class="align-middle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="edit" class="lucide lucide-edit align-middle me-2">
                      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path>
                    </svg>
                  </i>
                  <span class="align-middle">编辑商品信息</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>加载中...</p>
        </div>
  
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Comments (2)</h5>
          </div>
          <div class="card-body">
            <div class="d-flex align-items-start">
              <img src="@/assets/ProductsManage/img/头像.jpg" width="56" height="56" class="rounded-circle me-3" alt="Ashley Briggs">
              <div class="flex-grow-1">
                <small class="float-end">5m ago</small>
                <p class="mb-2"><strong>dongenqie</strong></p>
                <p>谁说这评论区不好啊，这评论区太棒了</p>
                <div style="text-align: right;">
                  <ul style="display: flex; list-style-type: none; padding: 0; margin: 0 0 0 850px;">
                    <!--点赞按钮-->
                    <li style="margin-right: 10px;">
                      <a class="nav-item dropdown nav-icon dropdown-toggle like-btn" @click="toggleLike(0)"
                      :class="{ active: likes[0].active }">
                        <div class="position-relative">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="thumbs-up" class="lucide lucide-message-circle align-middle text-body">
                            <path d="M7 10v12"></path>
                            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                          </svg>
                          <span class="indicator">{{ likes[0].count }}</span>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a class="nav-item dropdown nav-icon dropdown-toggle comment-btn" @click="toggleComments(0) ">
                        <div class="position-relative">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="message-circle" class="lucide lucide-message-circle align-middle text-body">
                            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                          </svg>
                          <span class="indicator">{{ comments[0].count }}</span>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
                <!-- 子评论区 -->
                <div v-show="comments[0].visible" class="sub-comments mt-3">
                <div class="d-flex align-items-start">
                    <a class="pe-2" href="#">
                    <img
                        src="@/assets/ProductsManage/img/头像.jpg"
                        width="36"
                        height="36"
                        class="rounded-circle me-2"
                        alt="Stacie Hall"
                    />
                    </a>
                    <div class="flex-grow-1">
                    <small class="float-end">Today 7:51 pm</small>
                    <p class="mb-2"><strong>Stacie Hall</strong></p>
                    <p>
                        Nam pretium turpis et arcu. Duis arcu tortor, suscipit eget, imperdiet nec, imperdiet
                        iaculis, ipsum. Sed aliquam ultrices mauris. Integer ante arcu, accumsan a, consectetuer
                        eget, posuere ut, mauris.
                    </p>
                    </div>
                </div>
                </div>
              </div>
            </div>

  
            <hr />
            <div class="d-flex align-items-start">
              <img src="@/assets/ProductsManage/img/头像.jpg" width="56" height="56" class="rounded-circle me-3" alt="Chris Wood">
              <div class="flex-grow-1">
                <small class="float-end">Today 7:26 pm</small>
                <p class="mb-2"><strong>Chris Wood</strong></p>
                <p>Etiam rhoncus. Maecenas tempus, tellus eget condimentum...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<style scoped>
  @import "@/assets/ProductsManage/app.css"; 

  .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
  