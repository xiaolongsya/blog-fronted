<template>
  <div class="admin-page">
    <section class="admin-header">
      <h1 class="admin-title unselectable">龙岛控制台</h1>
    </section>

    <section class="admin-main-content">
      <div 
        class="circle-item" 
        v-for="(item, idx) in circleList" 
        :key="idx"  
        @click.prevent="handleCircleClick(item)"
      >
        <div class="circle-bg unselectable hover-scale" :class="{ 'is-loading': globalLoading && currentLoadingItem === item.type }">
          <span class="circle-text" v-if="!(globalLoading && currentLoadingItem === item.type)">{{ item.content }}</span>
          <span class="loading-spinner" v-else>↻</span>
          <div class="glass-reflection"></div>
        </div>
      </div>
    </section>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showGrowthMainModal" @click="closeGrowthMainModal">
        <div class="modal-container gpu-layer" @click.stop>
          <div class="modal-decoration"></div>
          <div class="modal-header">
            <h2 class="modal-title">🐲 龙的成长管理</h2>
          </div>
          
          <div v-if="isFetchingData" class="loading-container">
            <span class="loading-spinner large">↻</span>
            <p>数据加载中...</p>
          </div>

          <div v-else class="growth-btn-group">
            <button class="action-btn hover-scale" @click="openAddCategoryModal">
              <span class="btn-icon">📂</span> 添加分类
            </button>
            <button class="action-btn hover-scale" @click="openSelectCategoryTypeModal">
              <span class="btn-icon">🌱</span> 添加节点
            </button>
            <button class="action-btn danger hover-scale" @click="openDeleteCategoryModal">
              <span class="btn-icon">🗑️</span> 删除分类
            </button>
            <button class="action-btn danger hover-scale" @click="openDeleteNodeStep1Modal">
              <span class="btn-icon">✂️</span> 删除节点
            </button>
          </div>
          <button class="modal-close-text-btn" @click="closeGrowthMainModal">关闭菜单</button>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showAddCategoryModal" @click="confirmCloseAddCategoryModal">
        <div class="modal-container gpu-layer" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">添加成长分类</h2>
          </div>
          <div class="modal-body">
            <div class="modal-form-item">
              <label>分类名称</label>
              <input v-model="categoryForm.name" placeholder="例如：Vue3学习笔记" class="modal-input" />
            </div>
            <div class="modal-form-item">
              <label>所属板块</label>
              <select v-model="categoryForm.type" class="modal-select" required>
                <option value="" disabled>请选择板块</option>
                <option value="前端">前端</option>
                <option value="后端">后端</option>
                <option value="算法">算法</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
          <div class="modal-btn-group">
            <button class="modal-submit-btn hover-scale" @click="submitCategory" :disabled="!categoryForm.name.trim() || !categoryForm.type || isSubmitting">
              <span v-if="isSubmitting" class="loading-spinner">↻</span>
              {{ submitBtnText.category }}
            </button>
            <button class="modal-cancel-btn" @click="confirmCloseAddCategoryModal" :disabled="isSubmitting">关闭</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showSelectTypeModal" @click="closeSelectTypeModal">
        <div class="modal-container gpu-layer" @click.stop style="width: 450px;">
          <div class="modal-header">
            <h2 class="modal-title">选择板块类型</h2>
          </div>
          <div class="modal-body">
            <div class="modal-form-item">
              <select v-model="selectedCategoryType" class="modal-select" required>
                <option value="" disabled>请选择目标板块</option>
                <option value="前端">前端</option>
                <option value="后端">后端</option>
                <option value="算法">算法</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
          <div class="modal-btn-group">
            <button class="modal-submit-btn hover-scale" @click="confirmCategoryType" :disabled="!selectedCategoryType || isSubmitting">下一步</button>
            <button class="modal-cancel-btn" @click="closeSelectTypeModal" :disabled="isSubmitting">取消</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showAddNodeModal" @click="confirmCloseAddNodeModal">
        <div class="modal-container gpu-layer wide-modal" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">发布节点 <span class="sub-title">({{ selectedCategoryType }})</span></h2>
          </div>
          <div class="modal-body">
            <div class="modal-form-item">
              <label>所属分类</label>
              <select v-model="nodeForm.growthId" class="modal-select" required>
                <option value="" disabled>请选择具体分类</option>
                <option v-for="category in filteredCategoryList" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
              <p class="error-tip" v-if="filteredCategoryList.length === 0">⚠️ 该板块下暂无分类，请先添加分类</p>
            </div>
            <div class="modal-form-item">
              <label>节点内容</label>
              <textarea 
                ref="nodeContentInputRef" 
                v-model="nodeForm.content" 
                placeholder="支持Markdown语法，点击下方按钮插入图片..." 
                class="modal-textarea" 
                rows="6"
              ></textarea>
              
              <div class="tool-bar">
                <button class="tool-btn hover-scale" @click="triggerInsertImg">
                  🖼️ 嵌入图片
                </button>
                <button class="tool-btn hover-scale" @click="triggerUploadImg">
                  📤 上传图片
                </button>
                <input ref="insertImgFileInput" type="file" accept="image/jpeg,image/png,image/gif" style="display: none" @change="handleInsertImgUpload"/>
                <input ref="uploadImgFileInput" type="file" accept="image/jpeg,image/png,image/gif" style="display: none" @change="handleUploadImgUpload"/>
              </div>
            </div>

            <Transition name="fade">
              <div class="modal-form-item" v-if="nodeForm.imgUrls.length > 0">
                <label>图片预览管理</label>
                <div class="upload-preview-scroller">
                  <div v-for="(url, idx) in nodeForm.imgUrls" :key="idx" class="preview-card">
                    <img :src="url" class="preview-img" @error="handleNodeImgError(idx)" />
                    <div class="preview-mask">
                      <button @click="removeNodeImage(idx)" class="remove-img-btn">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <div class="modal-btn-group">
            <button class="modal-submit-btn hover-scale" @click="submitNode" :disabled="!nodeForm.growthId || !nodeForm.content.trim() || isSubmitting || filteredCategoryList.length === 0">
              <span v-if="isSubmitting" class="loading-spinner">↻</span>
              {{ submitBtnText.node }}
            </button>
            <button class="modal-cancel-btn" @click="confirmCloseAddNodeModal" :disabled="isSubmitting">关闭</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showDeleteCategoryModal" @click="closeDeleteCategoryModal">
        <div class="modal-container gpu-layer danger-mode" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title danger-text">删除成长分类</h2>
          </div>
          <div class="modal-body">
            <div class="modal-form-item">
              <label>选择删除对象</label>
              <select v-model="deletegrowthId" class="modal-select danger-input" required>
                <option value="" disabled>请慎重选择</option>
                <option v-for="category in categoryList" :key="category.id" :value="category.id">{{ category.name }} - {{ category.type }}</option>
              </select>
            </div>
          </div>
          <div class="modal-btn-group">
            <button class="modal-submit-btn danger-bg hover-scale" @click="submitDeleteCategory" :disabled="!deletegrowthId || isSubmitting">
              <span v-if="isSubmitting" class="loading-spinner">↻</span>
              {{ isSubmitting ? '删除中...' : '确认销毁' }}
            </button>
            <button class="modal-cancel-btn" @click="closeDeleteCategoryModal" :disabled="isSubmitting">取消</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showDeleteNodeStep1Modal" @click="closeDeleteNodeStep1Modal">
        <div class="modal-container gpu-layer danger-mode" @click.stop style="width: 450px;">
          <div class="modal-header"><h2 class="modal-title danger-text">删节点 - 选板块</h2></div>
          <div class="modal-body">
             <select v-model="deleteNodeSelectedType" class="modal-select"><option value="前端">前端</option><option value="后端">后端</option><option value="算法">算法</option><option value="其他">其他</option></select>
          </div>
          <div class="modal-btn-group"><button class="modal-submit-btn danger-bg" @click="confirmDeleteNodeStep1" :disabled="!deleteNodeSelectedType">下一步</button><button class="modal-cancel-btn" @click="closeDeleteNodeStep1Modal">取消</button></div>
        </div>
      </div>
    </Transition>
    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showDeleteNodeStep2Modal" @click="closeDeleteNodeStep2Modal">
        <div class="modal-container gpu-layer danger-mode" @click.stop style="width: 450px;">
          <div class="modal-header"><h2 class="modal-title danger-text">删节点 - 选分类</h2></div>
          <div class="modal-body"><select v-model="deleteNodeSelectedgrowthId" class="modal-select"><option v-for="c in deleteNodeFilteredCategoryList" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
          <div class="modal-btn-group"><button class="modal-submit-btn danger-bg" @click="confirmDeleteNodeStep2" :disabled="!deleteNodeSelectedgrowthId">下一步</button><button class="modal-cancel-btn" @click="closeDeleteNodeStep2Modal">取消</button></div>
        </div>
      </div>
    </Transition>
    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showDeleteNodeStep3Modal" @click="closeDeleteNodeStep3Modal">
        <div class="modal-container gpu-layer danger-mode" @click.stop>
          <div class="modal-header"><h2 class="modal-title danger-text">删节点 - 选内容</h2></div>
          <div class="modal-body"><select v-model="deleteNodeId" class="modal-select"><option v-for="n in deleteNodeList" :key="n.id" :value="n.id">{{ n.content }}</option></select></div>
          <div class="modal-btn-group"><button class="modal-submit-btn danger-bg" @click="submitDeleteNode" :disabled="!deleteNodeId">确认删除</button><button class="modal-cancel-btn" @click="closeDeleteNodeStep3Modal">取消</button></div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showLogModal" @click="confirmCloseLogModal">
        <div class="modal-container gpu-layer" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">📝 更新龙岛日志</h2>
          </div>
          <div class="modal-body">
            <div class="modal-form-item">
              <label>日志内容</label>
              <textarea v-model="logForm.content" placeholder="记录今天的点滴..." class="modal-textarea" rows="5"></textarea>
            </div>
            <div class="modal-form-item">
              <label>配图上传</label>
              <div class="file-upload-wrapper">
                <input type="file" accept="image/jpeg,image/png,image/gif" @change="handleImageUpload" class="modal-file-input" />
                <div class="upload-btn-fake">选择图片</div>
              </div>
              <div class="upload-preview-scroller" v-if="logForm.imgUrls.length > 0">
                <div v-for="(url, idx) in logForm.imgUrls" :key="idx" class="preview-card">
                  <img :src="url" class="preview-img" @error="handleImgError(idx)" />
                  <div class="preview-mask"><button @click="removeImage(idx)" class="remove-img-btn">🗑️</button></div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-btn-group">
            <button class="modal-submit-btn hover-scale" @click="submitLog" :disabled="!logForm.content.trim() || isSubmitting">
              <span v-if="isSubmitting" class="loading-spinner">↻</span>
              {{ submitBtnText.log }}
            </button>
            <button class="modal-cancel-btn" @click="confirmCloseLogModal" :disabled="isSubmitting">关闭</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showRecentMainModal" @click="closeRecentMainModal">
        <div class="modal-container gpu-layer" @click.stop>
          <div class="modal-header"><h2 class="modal-title">📅 最近事项</h2></div>
          <div class="growth-btn-group">
            <button class="action-btn hover-scale" @click="openRecentUploadModal">📤 上传新事项</button>
            <button class="action-btn danger hover-scale" @click="openRecentDeleteModal">🗑️ 删除旧事项</button>
          </div>
          <button class="modal-close-text-btn" @click="closeRecentMainModal">关闭菜单</button>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showRecentUploadModal" @click="confirmCloseRecentUploadModal">
        <div class="modal-container gpu-layer" @click.stop>
          <div class="modal-header"><h2 class="modal-title">发布最近动态</h2></div>
          <div class="modal-body">
            <div class="modal-form-item">
              <label>标题</label>
              <input v-model="recentForm.title" placeholder="简短的标题" class="modal-input" />
            </div>
            <div class="modal-form-item">
              <label>详情</label>
              <textarea v-model="recentForm.content" placeholder="详细描述（选填）" class="modal-textarea" rows="5"></textarea>
            </div>
          </div>
          <div class="modal-btn-group">
            <button class="modal-submit-btn hover-scale" @click="submitRecent" :disabled="!recentForm.title.trim() || isSubmitting">
              <span v-if="isSubmitting" class="loading-spinner">↻</span>
              {{ submitBtnText.recent }}
            </button>
            <button class="modal-cancel-btn" @click="confirmCloseRecentUploadModal" :disabled="isSubmitting">关闭</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showRecentDeleteModal" @click="closeRecentDeleteModal">
        <div class="modal-container gpu-layer danger-mode" @click.stop>
          <div class="modal-header"><h2 class="modal-title danger-text">删除动态</h2></div>
          <div class="modal-body">
            <div class="modal-form-item">
              <select v-model="deleteRecentId" class="modal-select danger-input" required>
                <option value="" disabled>请选择删除项</option>
                <option v-for="item in recentList" :key="item.id" :value="item.id">{{ item.title }} ({{ formatTime(item.createTime) }})</option>
              </select>
            </div>
          </div>
          <div class="modal-btn-group">
            <button class="modal-submit-btn danger-bg" @click="submitDeleteRecent" :disabled="!deleteRecentId || isSubmitting">
              <span v-if="isSubmitting" class="loading-spinner">↻</span>
              {{ isSubmitting ? '删除中...' : '确认删除' }}
            </button>
            <button class="modal-cancel-btn" @click="closeRecentDeleteModal" :disabled="isSubmitting">取消</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="modal-mask" v-if="showStackModal" @click="closeStackModal">
        <div class="modal-container gpu-layer stack-modal-width" @click.stop>
          <div class="modal-decoration"></div>
          <div class="modal-header">
            <h2 class="modal-title">⚔️ 龙岛武库管理</h2>
          </div>

          <div class="tab-controls">
            <button class="tab-btn" :class="{ active: stackActiveTab === 'upload' }" @click="stackActiveTab = 'upload'">
              ➕ 登记新武器 (上传)
            </button>
            <button class="tab-btn" :class="{ active: stackActiveTab === 'delete' }" @click="stackActiveTab = 'delete'">
              🗑️ 销毁旧武器 (删除)
            </button>
          </div>

          <div class="modal-body scroll-content">
            
            <div v-if="stackActiveTab === 'upload'" class="stack-panel fade-in">
              <div class="modal-form-item">
                <label>技术归属分类</label>
                <div class="type-selector">
                  <label class="radio-label" v-for="type in stackTypes" :key="type">
                    <input type="radio" :value="type" v-model="stackForm.type" />
                    <span class="radio-text">{{ type }}</span>
                  </label>
                </div>
              </div>

              <div class="modal-form-item">
                <label>技术栈名称</label>
                <input type="text" v-model="stackForm.name" placeholder="例如：Mysql" class="modal-input" />
              </div>

              <div class="modal-form-item">
                <label>技术栈图标 (图片)</label>
                <input type="file" accept="image/*" @change="handleStackImgChange" class="modal-input file-input" />
                <div class="img-preview-box" v-if="stackForm.imgUrl">
                  <img :src="stackForm.imgUrl" alt="预览图" />
                </div>
              </div>

              <div class="modal-form-item">
                <label>熟练度星级</label>
                <div class="star-rating unselectable">
                  <span 
                    v-for="n in 5" 
                    :key="'star-'+n" 
                    class="star" 
                    :class="{ 'active': n <= stackForm.starRating }"
                    @click="stackForm.starRating = n"
                  >⭐</span>
                </div>
                <p class="star-tip">当前选定：{{ stackForm.starRating }} 星</p>
              </div>

              <div class="modal-btn-group">
                <button class="modal-submit-btn hover-scale" @click="submitStack" :disabled="isStackUploading">
                  {{ isStackUploading ? '正在入库中...' : '确认入库' }}
                </button>
              </div>
            </div>

            <div v-if="stackActiveTab === 'delete'" class="stack-panel fade-in">
              
              <div class="modal-form-item">
                <label>请选择要查阅的分类：</label>
                <div class="type-selector" style="margin-bottom: 10px;">
                  <label class="radio-label" v-for="type in stackTypes" :key="'del-'+type">
                    <input type="radio" :value="type" v-model="stackDeleteType" />
                    <span class="radio-text">{{ type }}</span>
                  </label>
                </div>
              </div>

              <div class="stack-list-container">
                <div v-if="filteredStackList.length === 0" class="empty-tip">
                  该分类下空空如也~
                </div>
                <div class="stack-list" v-else>
                  <div class="stack-item" v-for="item in filteredStackList" :key="item.id">
                    <div class="stack-item-info">
                      <img :src="item.imgUrl" class="stack-item-img" :alt="item.name" />
                      <div class="stack-item-text">
                        <span class="stack-item-name">{{ item.name }}</span>
                        <span class="stack-item-stars">
                          <span v-for="s in item.starRating" :key="'s-'+item.id+'-'+s">⭐</span>
                        </span>
                      </div>
                    </div>
                    <button class="delete-icon-btn hover-scale" @click="deleteStack(item.id)">移除</button>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <button class="modal-close-text-btn" @click="closeStackModal">关闭武库</button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import request from '@/utils/request' 
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus' 

const router = useRouter()

// 圆圈按钮列表 (第四个改成了技术栈)
const circleList = [
  { content: "龙岛日志", type: "log" },
  { content: "成长记录", type: "growth" },
  { content: "最近事项", type: "recent" },
  { content: "龙岛武库\n(技术栈)", type: "stack" },
  { content: "开发中", type: "none" }
];

// ============ 状态管理 ============
const showLogModal = ref(false)
const showGrowthMainModal = ref(false)
const showAddCategoryModal = ref(false)
const showSelectTypeModal = ref(false)
const showAddNodeModal = ref(false)
const showDeleteCategoryModal = ref(false)
const showDeleteNodeStep1Modal = ref(false)
const showDeleteNodeStep2Modal = ref(false)
const showDeleteNodeStep3Modal = ref(false)
const showRecentMainModal = ref(false)
const showRecentUploadModal = ref(false)
const showRecentDeleteModal = ref(false)

const isSubmitting = ref(false)
const globalLoading = ref(false)
const currentLoadingItem = ref('')
const isFetchingData = ref(false)

const submitBtnText = ref({
  category: '提交分类',
  node: '发布节点',
  log: '发布日志',
  recent: '发布动态'
})

// ============ 数据存储 ============
const categoryList = ref([])
const selectedCategoryType = ref('')
const deleteNodeSelectedType = ref('')
const deleteNodeSelectedgrowthId = ref('')
const deleteNodeList = ref([])
const recentList = ref([])
const recentForm = ref({ title: '', content: '' })
const deleteRecentId = ref('')
const logForm = ref({ content: '', imgUrls: [] })
const categoryForm = ref({ name: '', type: '' })
const nodeForm = ref({ growthId: '', content: '', imgUrls: [] })
const deletegrowthId = ref('')
const deleteNodeId = ref('')

const nodeContentInputRef = ref(null)
const insertImgFileInput = ref(null)
const uploadImgFileInput = ref(null)

// ================= 计算属性 =================
const filteredCategoryList = computed(() => {
  if (!selectedCategoryType.value) return []
  return categoryList.value.filter(category => category.type === selectedCategoryType.value)
})
const deleteNodeFilteredCategoryList = computed(() => {
  if (!deleteNodeSelectedType.value) return []
  return categoryList.value.filter(category => category.type === deleteNodeSelectedType.value)
})

// ================= 工具函数 =================
const showSuccessFeedback = (type) => {
  const originalText = { category: '提交分类', node: '发布节点', log: '发布日志', recent: '发布动态' }[type]
  submitBtnText.value[type] = '✨ 发布成功'
  setTimeout(() => { submitBtnText.value[type] = originalText }, 2000)
}
const formatTime = (timeStr) => { if(!timeStr) return ''; return timeStr.split('T')[0] }

// ================= API 请求 =================
const getCategoryList = async () => {
  try {
    const res = await request.get('https://xiaolongya.cn/blog/growth/list')
    if (res.code === 200) categoryList.value = res.data || []
  } catch (err) { console.error(err) }
}
const getNodeListBygrowthId = async (growthId) => {
  try {
    const res = await request.get(`https://xiaolongya.cn/blog/node/list?growthId=${growthId}`)
    if (res.code === 200) deleteNodeList.value = res.data || []
  } catch (err) { alert(`获取节点列表失败：${err.message}`) }
}
const getRecentList = async () => {
  try {
    const res = await request.get('https://xiaolongya.cn/blog/recent/list')
    if (res.code === 200) recentList.value = res.data || []
  } catch (err) { alert(`获取失败：${err.message}`) }
}

// ================= 交互逻辑 =================
const handleCircleClick = async (item) => {
  if (globalLoading.value) return;

  if (item.type === "log") {
    showLogModal.value = true
  } 
  else if (item.type === "growth") {
    globalLoading.value = true; currentLoadingItem.value = 'growth'; showGrowthMainModal.value = true; isFetchingData.value = true
    try { await getCategoryList(); } finally { isFetchingData.value = false; globalLoading.value = false; currentLoadingItem.value = '' }
  } 
  else if (item.type === "recent") {
    showRecentMainModal.value = true
  }
  // 🚀 【优化点】技术栈：秒开弹窗，去除强制延迟和蓝色等待光标
  else if (item.type === "stack") {
    showStackModal.value = true;
    fetchStackList(); // 在后台默默拉取列表数据，不阻塞UI渲染
  }
}

const closeAddCategoryModal = () => { showAddCategoryModal.value = false; categoryForm.value = { name: '', type: '' }; showGrowthMainModal.value = true }
const confirmCloseAddCategoryModal = () => { if (categoryForm.value.name) { if(confirm('确认关闭？未提交的数据将丢失')) closeAddCategoryModal() } else closeAddCategoryModal() }
const closeGrowthMainModal = () => { showGrowthMainModal.value = false; isFetchingData.value = false }
const closeLogModal = () => { showLogModal.value = false; logForm.value = { content: '', imgUrls: [] } }
const confirmCloseLogModal = () => { if (logForm.value.content) { if(confirm('确认关闭？数据将丢失')) closeLogModal() } else closeLogModal() }
const closeSelectTypeModal = () => { showSelectTypeModal.value = false; selectedCategoryType.value = ''; showGrowthMainModal.value = true }
const confirmCategoryType = async () => { if (!selectedCategoryType.value) return; isSubmitting.value = true; await getCategoryList(); isSubmitting.value = false; showSelectTypeModal.value = false; showAddNodeModal.value = true }
const closeAddNodeModal = () => { showAddNodeModal.value = false; nodeForm.value = { growthId: '', content: '', imgUrls: [] }; selectedCategoryType.value = ''; showGrowthMainModal.value = true }
const confirmCloseAddNodeModal = () => { if (nodeForm.value.content || nodeForm.value.imgUrls.length > 0) { if(confirm('确认关闭？数据将丢失')) closeAddNodeModal() } else closeAddNodeModal() }

const openDeleteCategoryModal = () => { showGrowthMainModal.value = false; showDeleteCategoryModal.value = true }
const closeDeleteCategoryModal = () => { showDeleteCategoryModal.value = false; deletegrowthId.value = ''; showGrowthMainModal.value = true }
const openDeleteNodeStep1Modal = () => { showGrowthMainModal.value = false; showDeleteNodeStep1Modal.value = true }
const closeDeleteNodeStep1Modal = () => { showDeleteNodeStep1Modal.value = false; deleteNodeSelectedType.value = ''; showGrowthMainModal.value = true }
const confirmDeleteNodeStep1 = () => { showDeleteNodeStep1Modal.value = false; showDeleteNodeStep2Modal.value = true }
const closeDeleteNodeStep2Modal = () => { showDeleteNodeStep2Modal.value = false; deleteNodeSelectedgrowthId.value = ''; showDeleteNodeStep1Modal.value = true }
const confirmDeleteNodeStep2 = async () => { await getNodeListBygrowthId(deleteNodeSelectedgrowthId.value); showDeleteNodeStep2Modal.value = false; showDeleteNodeStep3Modal.value = true }
const closeDeleteNodeStep3Modal = () => { showDeleteNodeStep3Modal.value = false; deleteNodeId.value = ''; showDeleteNodeStep2Modal.value = true }

const closeRecentMainModal = () => showRecentMainModal.value = false
const openRecentUploadModal = () => { showRecentMainModal.value = false; showRecentUploadModal.value = true }
const closeRecentUploadModal = () => { showRecentUploadModal.value = false; recentForm.value = { title: '', content: '' }; showRecentMainModal.value = true }
const confirmCloseRecentUploadModal = () => { if(recentForm.value.title) { if(confirm('确认关闭？')) closeRecentUploadModal() } else closeRecentUploadModal() }
const openRecentDeleteModal = async () => { await getRecentList(); showRecentMainModal.value = false; showRecentDeleteModal.value = true }
const closeRecentDeleteModal = () => { showRecentDeleteModal.value = false; deleteRecentId.value = ''; showRecentMainModal.value = true }

// ================= 提交逻辑 =================
const submitCategory = async () => {
  if (!categoryForm.value.name.trim() || !categoryForm.value.type) return
  isSubmitting.value = true
  try {
    const res = await request.post('https://xiaolongya.cn/blog/growth/upload', categoryForm.value)
    if (res.code === 200) { showSuccessFeedback('category'); categoryForm.value = { name: '', type: '' }; getCategoryList() } else { alert(res.msg || '添加失败') }
  } catch (err) { alert('提交出错') } finally { isSubmitting.value = false }
}

const submitNode = async () => {
  if (!nodeForm.value.growthId || !nodeForm.value.content.trim()) return
  isSubmitting.value = true
  try {
    const res = await request.post('https://xiaolongya.cn/blog/node/upload', nodeForm.value)
    if (res.code === 200) { showSuccessFeedback('node'); nodeForm.value.content = ''; nodeForm.value.imgUrls = [] } else { alert(res.msg || '添加失败') }
  } catch (err) { alert('提交出错') } finally { isSubmitting.value = false }
}

const submitLog = async () => {
  if (!logForm.value.content.trim()) return
  isSubmitting.value = true
  try {
    const res = await request.post('https://xiaolongya.cn/blog/development/upload', logForm.value)
    if (res.code === 200) { showSuccessFeedback('log'); logForm.value = { content: '', imgUrls: [] } } else { alert(res.msg || '发布失败') }
  } catch (err) { alert('提交出错') } finally { isSubmitting.value = false }
}

const submitRecent = async () => {
  if (!recentForm.value.title.trim()) return
  isSubmitting.value = true
  try {
    const res = await request.post('https://xiaolongya.cn/blog/recent/upload', recentForm.value)
    if (res.code === 200) { showSuccessFeedback('recent'); recentForm.value = { title: '', content: '' } } else { alert(res.msg || '发布失败') }
  } catch (err) { alert('提交出错') } finally { isSubmitting.value = false }
}

const submitDeleteCategory = async () => {
  if(!deletegrowthId.value) return
  if(!confirm('确定要删除该分类吗？关联的节点也会被删除！')) return
  isSubmitting.value = true
  try {
    const res = await request.post(`https://xiaolongya.cn/blog/growth/delete?id=${deletegrowthId.value}`)
    if(res.code === 200) { alert('删除成功'); closeDeleteCategoryModal(); getCategoryList() } else alert(res.msg)
  } catch(e) { alert('出错') } finally { isSubmitting.value = false }
}

const submitDeleteNode = async () => {
  if(!deleteNodeId.value) return
  if(!confirm('确定删除该节点？')) return
  isSubmitting.value = true
  try {
    const res = await request.post(`https://xiaolongya.cn/blog/node/delete?id=${deleteNodeId.value}`)
    if(res.code === 200) { alert('删除成功'); closeDeleteNodeStep3Modal() } else alert(res.msg)
  } catch(e) { alert('出错') } finally { isSubmitting.value = false }
}

const submitDeleteRecent = async () => {
  if(!deleteRecentId.value) return
  if(!confirm('确定删除？')) return
  isSubmitting.value = true
  try {
    const res = await request.post(`https://xiaolongya.cn/blog/recent/delete?id=${deleteRecentId.value}`)
    if(res.code === 200) { alert('删除成功'); closeRecentDeleteModal() } else alert(res.msg)
  } catch(e) { alert('出错') } finally { isSubmitting.value = false }
}

// ============ 原有图片处理 ============
const handleImageUpload = async (e) => {
  const file = e.target.files[0]; if (!file) return
  const formData = new FormData(); formData.append('file', file)
  try {
    const res = await request.post('https://xiaolongya.cn/blog/upload/image', formData)
    if (res.code === 200) logForm.value.imgUrls.push(res.data)
  } catch (e) { alert('上传失败') }
}
const triggerInsertImg = () => insertImgFileInput.value.click()
const triggerUploadImg = () => uploadImgFileInput.value.click()
const handleInsertImgUpload = async (e) => {
  const file = e.target.files[0]; if (!file) return
  const formData = new FormData(); formData.append('file', file)
  try {
    const res = await request.post('https://xiaolongya.cn/blog/upload/image', formData)
    if (res.code === 200) {
      const imgMd = `\n[IMAGE:${res.data}]\n`
      const textarea = nodeContentInputRef.value
      const start = textarea.selectionStart; const end = textarea.selectionEnd
      nodeForm.value.content = nodeForm.value.content.substring(0, start) + imgMd + nodeForm.value.content.substring(end)
    }
  } catch (e) { alert('图片上传失败') }
}
const handleUploadImgUpload = async (e) => {
  const file = e.target.files[0]; if (!file) return
  const formData = new FormData(); formData.append('file', file)
  try {
    const res = await request.post('https://xiaolongya.cn/blog/upload/image', formData)
    if (res.code === 200) nodeForm.value.imgUrls.push(res.data)
  } catch (e) { alert('上传失败') }
}
const removeNodeImage = (idx) => nodeForm.value.imgUrls.splice(idx, 1)
const removeImage = (idx) => logForm.value.imgUrls.splice(idx, 1)
const handleImgError = (idx) => logForm.value.imgUrls.splice(idx, 1)
const handleNodeImgError = (idx) => nodeForm.value.imgUrls.splice(idx, 1)

// ================= 🌟 技术栈（龙岛武库）专属逻辑 =================
const showStackModal = ref(false);
const stackActiveTab = ref('upload'); 
const stackTypes = ['前端', '后端', '计算机基础'];

const stackForm = ref({
  name: '',
  imgUrl: '',
  type: '前端', 
  starRating: 0 
});
const isStackUploading = ref(false);
const stackList = ref([]);
const stackDeleteType = ref('前端'); 

const closeStackModal = () => {
  showStackModal.value = false;
  stackForm.value = { name: '', imgUrl: '', type: '前端', starRating: 0 };
};

// 1. 上传图片到服务器
const handleStackImgChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const res = await request.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    if (res.code === 200) {
      stackForm.value.imgUrl = res.data; 
      ElMessage.success('图片上传成功');
    } else {
      ElMessage.error(res.msg || '图片上传失败');
    }
  } catch (err) {
    ElMessage.error('图片接口请求异常');
  }
};

// 2. 提交技术栈
const submitStack = async () => {
  if (!stackForm.value.name || !stackForm.value.imgUrl || stackForm.value.starRating === 0) {
    ElMessage.warning('请填写完整名称、图片，并至少点亮1颗星星！');
    return;
  }
  
  isStackUploading.value = true;
  try {
    const res = await request.post('/stack/upload', stackForm.value);
    if (res.code === 200) {
      ElMessage.success(`上传成功!`);
      stackForm.value = { name: '', imgUrl: '', type: '前端', starRating: 0 }; 
      fetchStackList(); // 刷新列表
    } else {
      ElMessage.error(res.msg || '上传失败');
    }
  } catch (err) {
    ElMessage.error('网络异常，上传失败');
  } finally {
    isStackUploading.value = false;
  }
};

// 3. 获取并过滤删除列表
const fetchStackList = async () => {
  try {
    const res = await request.get('/stack/list');
    if (res.code === 200) {
      stackList.value = res.data || [];
    }
  } catch (err) {
    console.error('获取技术栈失败', err);
  }
};

const filteredStackList = computed(() => {
  return stackList.value.filter(item => item.type === stackDeleteType.value);
});

// 4. 执行删除操作
const deleteStack = async (id) => {
  if (!confirm('确定要将该技术栈从武库中移除吗？')) return;
  try {
    const res = await request.post(`/stack/delete?id=${id}`);
    if (res.code === 200) {
      ElMessage.success('已成功移除');
      fetchStackList(); 
    } else {
      ElMessage.error(res.msg || '移除失败');
    }
  } catch (err) {
    ElMessage.error('网络异常，移除失败');
  }
};

</script>

<style scoped>
.unselectable { user-select: none; -webkit-user-select: none; cursor: default; }
.hover-scale { transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.hover-scale:active { transform: scale(0.96); }
.gpu-layer { 
  will-change: transform, opacity; 
  transform: translateZ(0); 
  backface-visibility: hidden;
}

/* 页面布局 */
.admin-page {
  width: 90%;
  max-width: 1200px;
  min-height: 80vh;
  margin: 0 auto;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.admin-header {
  text-align: center;
  margin-bottom: 50px;
}

.admin-title {
  font-family: "Ma Shan Zheng", cursive;
  font-size: 90px; 
  background: linear-gradient(135deg, #2f5496, #00c0e2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 20px;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
}

:global(.global-wrapper.dark-mode) .admin-title {
  background: linear-gradient(135deg, #60a5fa, #2dd4bf);
  -webkit-background-clip: text;
}

.admin-main-content {
  display: flex;
  justify-content: center;
  gap: 50px; 
  flex-wrap: wrap;
}

.circle-item {
  width: 180px; 
  height: 180px; 
}

.circle-bg {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 20px rgba(31, 38, 135, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.circle-bg.is-loading {
  background: rgba(255, 255, 255, 0.8);
  cursor: wait;
}

:global(.global-wrapper.dark-mode) .circle-bg {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
}

.circle-bg:hover {
  box-shadow: 0 10px 25px rgba(47, 84, 150, 0.2);
  transform: translateY(-5px);
}

.circle-text {
  font-weight: bold;
  color: #2f5496;
  font-size: 28px; 
  z-index: 2;
  white-space: pre-line;
  text-align: center;
  line-height: 1.3;
}
:global(.global-wrapper.dark-mode) .circle-text { color: #bfdbfe; }

.glass-reflection {
  position: absolute;
  top: 0; left: -50%;
  width: 200%; height: 100%;
  background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
  transform: skewX(-25deg) translateX(-150%);
  transition: transform 0.5s;
  pointer-events: none;
}
.circle-bg:hover .glass-reflection { transform: skewX(-25deg) translateX(150%); }

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6); 
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 40px; 
  border-radius: 24px;
  width: 550px; 
  max-width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.6);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.wide-modal { width: 750px; }

:global(.global-wrapper.dark-mode) .modal-container {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.modal-header {
  border-bottom: 2px solid rgba(47, 84, 150, 0.1);
  padding-bottom: 15px;
  margin-bottom: 5px;
}

.modal-title {
  margin: 0;
  font-size: 28px; 
  color: #2f5496;
  font-weight: 600;
}
:global(.global-wrapper.dark-mode) .modal-title { color: #60a5fa; }

.sub-title { font-size: 0.7em; color: #64748b; margin-left: 10px; }

.modal-form-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-form-item label {
  font-size: 16px; 
  font-weight: 600;
  color: #475569;
}
:global(.global-wrapper.dark-mode) .modal-form-item label { color: #94a3b8; }

.modal-input, .modal-select, .modal-textarea {
  padding: 14px; 
  border: 2px solid rgba(47, 84, 150, 0.15);
  border-radius: 12px;
  background: #f8fafc;
  font-size: 16px; 
  transition: border-color 0.2s;
  color: #334155;
}
.modal-textarea { resize: vertical; min-height: 120px; font-family: inherit; }

.modal-input:focus, .modal-select:focus, .modal-textarea:focus {
  outline: none;
  border-color: #00c0e2;
  background: #fff;
}

:global(.global-wrapper.dark-mode) .modal-input,
:global(.global-wrapper.dark-mode) .modal-select,
:global(.global-wrapper.dark-mode) .modal-textarea {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
}

.modal-btn-group, .growth-btn-group {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 15px;
}

.growth-btn-group { flex-wrap: wrap; justify-content: center; gap: 20px; }

.modal-submit-btn {
  padding: 12px 30px; 
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #2f5496, #00c0e2);
  color: white;
  font-weight: 600;
  font-size: 18px; 
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 192, 226, 0.2); 
}

.modal-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.modal-cancel-btn {
  padding: 12px 25px; 
  border-radius: 12px;
  border: 2px solid #cbd5e1;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  font-size: 16px;
}
.modal-cancel-btn:hover { border-color: #94a3b8; color: #475569; }

.action-btn {
  width: 180px; 
  height: 130px; 
  padding: 10px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #2f5496, #00c0e2);
  color: white;
  font-weight: 600;
  font-size: 20px; 
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 4px 10px rgba(0, 192, 226, 0.3);
}
.action-btn .btn-icon { font-size: 40px; }

.danger-mode .modal-title { color: #ef4444; }
.danger-bg, .action-btn.danger { background: linear-gradient(135deg, #ef4444, #f87171); box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2); }
.danger-input:focus { border-color: #ef4444; }

.modal-close-text-btn {
  margin-top: 15px;
  background: none; border: none;
  color: #94a3b8;
  cursor: pointer;
  text-decoration: underline;
  font-size: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;
  color: #64748b;
  font-size: 18px;
}
.loading-spinner {
  display: inline-block;
  animation: rotate 1s linear infinite;
  font-family: monospace;
}
.loading-spinner.large { font-size: 40px; margin-bottom: 15px; color: #00c0e2; }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.tool-bar { display: flex; gap: 10px; margin-top: 10px; }
.tool-btn { padding: 8px 16px; background: #eff6ff; color: #2f5496; border-radius: 8px; border: none; font-size: 14px; cursor: pointer; }
.upload-preview-scroller { display: flex; gap: 10px; overflow-x: auto; padding: 5px; background: rgba(0,0,0,0.03); border-radius: 8px; }
.preview-card { position: relative; width: 90px; height: 90px; flex-shrink: 0; border-radius: 8px; overflow: hidden; }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.preview-mask { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.2s; }
.preview-card:hover .preview-mask { opacity: 1; }
.remove-img-btn { background: none; border: none; font-size: 20px; cursor: pointer; }

/* Transitions */
.modal-fast-enter-active, .modal-fast-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.modal-fast-enter-from, .modal-fast-leave-to { opacity: 0; transform: scale(0.98); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ================= 🌟 龙岛武库专属样式 ================= */
.stack-modal-width { max-width: 550px !important; }

.tab-controls { display: flex; gap: 15px; margin-bottom: 25px; border-bottom: 2px solid #f0f5ff; padding-bottom: 10px; }
.tab-btn { flex: 1; padding: 10px 0; background: transparent; border: none; font-size: 16px; font-weight: bold; color: #b0bfc6; cursor: pointer; transition: all 0.3s; position: relative; }
.tab-btn.active { color: #00c0e2; }
.tab-btn.active::after { content: ''; position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 40px; height: 3px; background: #00c0e2; border-radius: 3px; }

.fade-in { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.type-selector { display: flex; gap: 15px; margin-top: 5px; }
.radio-label { display: flex; align-items: center; gap: 5px; cursor: pointer; color: #2f5496; font-weight: 500; }
.radio-label input[type="radio"] { accent-color: #00c0e2; transform: scale(1.1); cursor: pointer; }

.file-input { padding: 10px !important; }
.img-preview-box { margin-top: 15px; width: 80px; height: 80px; border-radius: 15px; border: 2px dashed #00c0e2; padding: 5px; background: #f9fbff; }
.img-preview-box img { width: 100%; height: 100%; object-fit: contain; border-radius: 10px; }

.star-rating { display: flex; gap: 8px; margin-top: 5px; }
.star { font-size: 32px; filter: grayscale(100%) opacity(0.3); transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; line-height: 1; }
.star:hover { transform: scale(1.2); }
.star.active { filter: grayscale(0%) opacity(1); }
.star-tip { margin: 10px 0 0 0; font-size: 13px; color: #00c0e2; font-weight: bold; }

.stack-list-container { max-height: 350px; overflow-y: auto; padding-right: 5px; }
.stack-list { display: flex; flex-direction: column; gap: 12px; }
.stack-item { display: flex; justify-content: space-between; align-items: center; background: #f9fbff; border: 1px solid #eef2f9; padding: 12px 15px; border-radius: 15px; transition: all 0.3s; }
.stack-item:hover { border-color: #00c0e2; background: white; box-shadow: 0 4px 15px rgba(0, 192, 226, 0.1); }
.stack-item-info { display: flex; align-items: center; gap: 15px; }
.stack-item-img { width: 45px; height: 45px; border-radius: 10px; object-fit: contain; background: white; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.stack-item-text { display: flex; flex-direction: column; gap: 4px; }
.stack-item-name { font-weight: bold; color: #2f5496; font-size: 15px; }
.stack-item-stars { font-size: 12px; }
.delete-icon-btn { background: #ff4d4f; color: white; border: none; padding: 6px 14px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.delete-icon-btn:hover { background: #ff7875; }
.empty-tip { text-align: center; color: #b0bfc6; padding: 30px; font-size: 14px; }
</style>