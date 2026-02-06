<template>
  <!-- 管理员页面容器 -->
  <div class="admin-page">
    <!-- 顶部标题 -->
    <section class="admin-header">
      <h1 class="admin-title">龙岛的后台</h1>
    </section>

    <!-- 主体圆圈按钮区域 -->
    <section class="admin-main-content">
      <div 
        class="circle-item" 
        v-for="(item, idx) in circleList" 
        :key="idx"  
        @click.prevent="handleCircleClick(item)"
      >
        <div class="circle-bg">
          <span class="circle-text">{{ item.content }}</span>
        </div>
      </div>
    </section>

    <!-- 1. 龙的成长记录主弹窗 -->
    <div class="modal-mask" v-if="showGrowthMainModal" @click="closeGrowthMainModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title">龙的成长记录</div>
        <div class="growth-btn-group">
          <button class="growth-sub-btn" @click="openAddCategoryModal">添加成长分类</button>
          <button class="growth-sub-btn" @click="openSelectCategoryTypeModal">添加成长节点</button>
          <button class="growth-sub-btn danger" @click="openDeleteCategoryModal">删除成长分类</button>
          <button class="growth-sub-btn danger" @click="openDeleteNodeStep1Modal">删除成长节点</button>
        </div>
        <button class="modal-close-btn" @click="closeGrowthMainModal">关闭</button>
      </div>
    </div>

    <!-- 2. 添加成长分类弹窗 -->
    <div class="modal-mask" v-if="showAddCategoryModal" @click="closeAddCategoryModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title">添加成长分类</div>
        <div class="modal-form-item">
          <label>分类名称：</label>
          <input 
            v-model="categoryForm.name" 
            placeholder="请输入分类名称"
            class="modal-input"
          />
        </div>
        <div class="modal-form-item">
          <label>类型选择：</label>
          <select v-model="categoryForm.type" class="modal-select" required>
            <option value="" disabled>请选择分类类型</option>
            <option value="前端">前端</option>
            <option value="后端">后端</option>
            <option value="算法">算法</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn" 
            @click="submitCategory"
            :disabled="!categoryForm.name.trim() || !categoryForm.type || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-icon">🔄</span>
            {{ isSubmitting ? '提交中...' : '提交分类' }}
          </button>
          <button class="modal-close-btn" @click="closeAddCategoryModal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>

    <!-- 3. 第一步：选择分类类型弹窗（添加节点） -->
    <div class="modal-mask" v-if="showSelectTypeModal" @click="closeSelectTypeModal">
      <div class="modal-container" @click.stop style="width: 400px;">
        <div class="modal-title">选择分类类型</div>
        <div class="modal-form-item">
          <label>请选择板块类型：</label>
          <select v-model="selectedCategoryType" class="modal-select" required>
            <option value="" disabled>请选择板块类型</option>
            <option value="前端">前端</option>
            <option value="后端">后端</option>
            <option value="算法">算法</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn" 
            @click="confirmCategoryType"
            :disabled="!selectedCategoryType || isSubmitting"
          >
            下一步
          </button>
          <button class="modal-close-btn" @click="closeSelectTypeModal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>

    <!-- 4. 第二步：选择具体分类弹窗（添加节点）【核心修改：双图片按钮】 -->
    <!-- 关键修改：遮罩点击改为confirmCloseAddNodeModal（拦截逻辑） -->
    <div class="modal-mask" v-if="showAddNodeModal" @click="confirmCloseAddNodeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title">添加成长节点（{{ selectedCategoryType }}板块）</div>
        <div class="modal-form-item">
          <label>所属具体分类：</label>
          <select v-model="nodeForm.growthId" class="modal-select" required>
            <option value="" disabled>请选择所属具体分类</option>
            <option 
              v-for="category in filteredCategoryList" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <p class="upload-tip" v-if="filteredCategoryList.length === 0">
            该类型下暂无分类，请先添加对应分类
          </p>
        </div>
        <div class="modal-form-item">
          <label>节点内容：</label>
          <!-- 新增ref：获取文本框光标位置 -->
          <textarea 
            ref="nodeContentInputRef"
            v-model="nodeForm.content" 
            placeholder="请输入节点内容，图片嵌入会插入到光标位置"
            class="modal-textarea"
            rows="4"
          ></textarea>
          <!-- 核心新增：图片嵌入 + 图片上传 双按钮 -->
          <div class="img-double-btn" style="display: flex; gap: 12px; margin-top: 10px;">
            <button class="img-btn insert-btn" @click="triggerInsertImg">图片嵌入</button>
            <button class="img-btn upload-btn" @click="triggerUploadImg">图片上传</button>
            <!-- 隐藏的文件选择框：分别对应嵌入/上传 -->
            <input 
              ref="insertImgFileInput"
              type="file" 
              accept="image/jpeg,image/png,image/gif"
              style="display: none"
              @change="handleInsertImgUpload"
            />
            <input 
              ref="uploadImgFileInput"
              type="file" 
              accept="image/jpeg,image/png,image/gif"
              style="display: none"
              @change="handleUploadImgUpload"
            />
          </div>
        </div>
        <!-- 保留：底部图片预览（仅展示「图片上传」的图片） -->
        <div class="modal-form-item" v-if="nodeForm.imgUrls.length > 0">
          <label>底部图片预览（图片上传）：</label>
          <div class="upload-preview">
            <div v-for="(url, idx) in nodeForm.imgUrls" :key="idx" class="preview-item">
              <img :src="url" alt="底部预览图" class="preview-img" @error="handleNodeImgError(idx)" />
              <button @click="removeNodeImage(idx)" class="remove-img-btn">×</button>
            </div>
          </div>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn" 
            @click="submitNode"
            :disabled="!nodeForm.growthId || !nodeForm.content.trim() || isSubmitting || filteredCategoryList.length === 0"
          >
            <span v-if="isSubmitting" class="loading-icon">🔄</span>
            {{ isSubmitting ? '提交中...' : '提交节点' }}
          </button>
          <button class="modal-close-btn" @click="closeAddNodeModal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>

    <!-- 5. 删除成长分类弹窗 -->
    <div class="modal-mask" v-if="showDeleteCategoryModal" @click="closeDeleteCategoryModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title danger-title">删除成长分类</div>
        <div class="modal-form-item">
          <label>请选择要删除的分类：</label>
          <select v-model="deleteCategoryId" class="modal-select" required>
            <option value="" disabled>请选择分类</option>
            <option 
              v-for="category in categoryList" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}（类型：{{ category.type }}）
            </option>
          </select>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn danger-btn" 
            @click="submitDeleteCategory"
            :disabled="!deleteCategoryId || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-icon">🔄</span>
            {{ isSubmitting ? '删除中...' : '确认删除' }}
          </button>
          <button class="modal-close-btn" @click="closeDeleteCategoryModal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>

    <!-- 6. 删除成长节点：第一步选择分类类型 -->
    <div class="modal-mask" v-if="showDeleteNodeStep1Modal" @click="closeDeleteNodeStep1Modal">
      <div class="modal-container" @click.stop style="width: 400px;">
        <div class="modal-title danger-title">删除成长节点（选择板块）</div>
        <div class="modal-form-item">
          <label>请选择板块类型：</label>
          <select v-model="deleteNodeSelectedType" class="modal-select" required>
            <option value="" disabled>请选择板块类型</option>
            <option value="前端">前端</option>
            <option value="后端">后端</option>
            <option value="算法">算法</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn" 
            @click="confirmDeleteNodeStep1"
            :disabled="!deleteNodeSelectedType || isSubmitting"
          >
            下一步
          </button>
          <button class="modal-close-btn" @click="closeDeleteNodeStep1Modal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>

    <!-- 7. 删除成长节点：第二步选择分类 -->
    <div class="modal-mask" v-if="showDeleteNodeStep2Modal" @click="closeDeleteNodeStep2Modal">
      <div class="modal-container" @click.stop style="width: 400px;">
        <div class="modal-title danger-title">删除成长节点（选择分类）</div>
        <div class="modal-form-item">
          <label>请选择分类：</label>
          <select v-model="deleteNodeSelectedCategoryId" class="modal-select" required>
            <option value="" disabled>请选择分类</option>
            <option 
              v-for="category in deleteNodeFilteredCategoryList" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <p class="upload-tip" v-if="deleteNodeFilteredCategoryList.length === 0">
            该类型下暂无分类
          </p>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn" 
            @click="confirmDeleteNodeStep2"
            :disabled="!deleteNodeSelectedCategoryId || isSubmitting || deleteNodeFilteredCategoryList.length === 0"
          >
            下一步
          </button>
          <button class="modal-close-btn" @click="closeDeleteNodeStep2Modal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>

    <!-- 8. 删除成长节点：第三步选择具体节点 -->
    <div class="modal-mask" v-if="showDeleteNodeStep3Modal" @click="closeDeleteNodeStep3Modal">
      <div class="modal-container" @click.stop>
        <div class="modal-title danger-title">删除成长节点（选择节点）</div>
        <div class="modal-form-item">
          <label>请选择要删除的节点：</label>
          <select v-model="deleteNodeId" class="modal-select" required>
            <option value="" disabled>请选择节点</option>
            <option 
              v-for="node in deleteNodeList" 
              :key="node.id" 
              :value="node.id"
            >
              {{ node.content }}（创建时间：{{ formatTime(node.createTime) }}）
            </option>
          </select>
          <p class="upload-tip" v-if="deleteNodeList.length === 0">
            该分类下暂无节点
          </p>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn danger-btn" 
            @click="submitDeleteNode"
            :disabled="!deleteNodeId || isSubmitting || deleteNodeList.length === 0"
          >
            <span v-if="isSubmitting" class="loading-icon">🔄</span>
            {{ isSubmitting ? '删除中...' : '确认删除' }}
          </button>
          <button class="modal-close-btn" @click="closeDeleteNodeStep3Modal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>

    <!-- 9. 更新龙岛日志弹窗 -->
    <div class="modal-mask" v-if="showLogModal" @click="closeLogModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title">更新龙岛日志</div>
        <div class="modal-form-item">
          <label>日志内容：</label>
          <textarea 
            v-model="logForm.content" 
            placeholder="请输入日志内容（必填）"
            class="modal-textarea"
            rows="5"
          ></textarea>
        </div>
        <div class="modal-form-item">
          <label>上传图片：</label>
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/gif"
            @change="handleImageUpload"
            class="modal-file-input"
          />
          <div class="upload-preview" v-if="logForm.imgUrls.length > 0">
            <div v-for="(url, idx) in logForm.imgUrls" :key="idx" class="preview-item">
              <img :src="url" alt="预览图" class="preview-img" @error="handleImgError(idx)" />
              <button @click="removeImage(idx)" class="remove-img-btn">×</button>
            </div>
          </div>
          <p class="upload-tip" v-if="logForm.imgUrls.length === 0">暂未上传图片，支持JPG/PNG/GIF格式</p>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn" 
            @click="submitLog"
            :disabled="!logForm.content.trim() || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-icon">🔄</span>
            {{ isSubmitting ? '提交中...' : '提交日志' }}
          </button>
          <button class="modal-close-btn" @click="closeLogModal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import axios from 'axios'

// 圆圈按钮列表
const circleList = [
  { content: "更新龙岛日志", type: "log" },
  { content: "龙的成长记录", type: "growth" },
  { content: "暂无", type: "none" },
  { content: "暂无", type: "none" },
  { content: "暂无", type: "none" }
];

// 状态管理：弹窗显示控制
const showLogModal = ref(false)
const showGrowthMainModal = ref(false)
const showAddCategoryModal = ref(false)
const showSelectTypeModal = ref(false)
const showAddNodeModal = ref(false)
const showDeleteCategoryModal = ref(false)
const showDeleteNodeStep1Modal = ref(false)
const showDeleteNodeStep2Modal = ref(false)
const showDeleteNodeStep3Modal = ref(false)
const isSubmitting = ref(false)

// 分类相关数据
const categoryList = ref([])
const selectedCategoryType = ref('')
const deleteNodeSelectedType = ref('')
const deleteNodeSelectedCategoryId = ref('')
const deleteNodeList = ref([])

// 表单数据
const logForm = ref({ content: '', imgUrls: [] })
const categoryForm = ref({ name: '', type: '' })
const nodeForm = ref({ growthId: '', content: '', imgUrls: [] })
const deleteCategoryId = ref('')
const deleteNodeId = ref('')

// 核心新增：Ref绑定（文本框 + 两个隐藏文件框）
const nodeContentInputRef = ref(null)
const insertImgFileInput = ref(null)
const uploadImgFileInput = ref(null)

// 计算属性
const filteredCategoryList = computed(() => {
  if (!selectedCategoryType.value) return []
  return categoryList.value.filter(category => category.type === selectedCategoryType.value)
})
const deleteNodeFilteredCategoryList = computed(() => {
  if (!deleteNodeSelectedType.value) return []
  return categoryList.value.filter(category => category.type === deleteNodeSelectedType.value)
})

/**
 * 获取全部分类列表
 */
const getCategoryList = async () => {
  try {
    const res = await axios.get('https://xiaolongya.cn/blog/growth/list')
    if (res.data.code === 200) {
      categoryList.value = res.data.data || []
    } else {
      throw new Error(res.data.msg || '获取分类列表失败')
    }
  } catch (err) {
    alert(`获取分类列表失败：${err.message}`)
  }
}

/**
 * 获取指定分类下的节点列表
 */
const getNodeListByCategoryId = async (categoryId) => {
  try {
    const res = await axios.get(`https://xiaolongya.cn/blog/node/list?growthId=${categoryId}`)
    if (res.data.code === 200) {
      deleteNodeList.value = res.data.data || []
    } else {
      throw new Error(res.data.msg || '获取节点列表失败')
    }
  } catch (err) {
    alert(`获取节点列表失败：${err.message}`)
  }
}

/**
 * 处理圆圈按钮点击
 */
const handleCircleClick = async (item) => {
  if (item.type === "log") {
    await nextTick()
    showLogModal.value = true
  } else if (item.type === "growth") {
    await getCategoryList()
    await nextTick()
    showGrowthMainModal.value = true
  }
}

/**
 * 打开弹窗方法
 */
const openAddCategoryModal = async () => {
  showGrowthMainModal.value = false
  await nextTick()
  showAddCategoryModal.value = true
}
const openSelectCategoryTypeModal = async () => {
  showGrowthMainModal.value = false
  await nextTick()
  showSelectTypeModal.value = true
  selectedCategoryType.value = ''
}
const openDeleteCategoryModal = async () => {
  showGrowthMainModal.value = false
  await getCategoryList()
  await nextTick()
  showDeleteCategoryModal.value = true
  deleteCategoryId.value = ''
}
const openDeleteNodeStep1Modal = async () => {
  showGrowthMainModal.value = false
  await nextTick()
  showDeleteNodeStep1Modal.value = true
  deleteNodeSelectedType.value = ''
  deleteNodeSelectedCategoryId.value = ''
  deleteNodeId.value = ''
}

/**
 * 确认步骤
 */
const confirmCategoryType = async () => {
  if (!selectedCategoryType.value) return
  await getCategoryList()
  await nextTick()
  showSelectTypeModal.value = false
  showAddNodeModal.value = true
}
const confirmDeleteNodeStep1 = async () => {
  if (!deleteNodeSelectedType.value) return
  await getCategoryList()
  await nextTick()
  showDeleteNodeStep1Modal.value = false
  showDeleteNodeStep2Modal.value = true
}
const confirmDeleteNodeStep2 = async () => {
  if (!deleteNodeSelectedCategoryId.value) return
  await getNodeListByCategoryId(deleteNodeSelectedCategoryId.value)
  await nextTick()
  showDeleteNodeStep2Modal.value = false
  showDeleteNodeStep3Modal.value = true
}

/**
 * 关闭弹窗逻辑（重置数据）
 */
const closeGrowthMainModal = () => {
  showGrowthMainModal.value = false
}
const closeAddCategoryModal = () => {
  showAddCategoryModal.value = false
  categoryForm.value = { name: '', type: '' }
}
const closeSelectTypeModal = () => {
  showSelectTypeModal.value = false
  selectedCategoryType.value = ''
}
// 原有关闭节点弹窗逻辑（无拦截，供确认后调用）
const closeAddNodeModal = () => {
  showAddNodeModal.value = false
  nodeForm.value = { growthId: '', content: '', imgUrls: [] }
  selectedCategoryType.value = ''
}
// 核心新增：添加节点弹窗遮罩点击拦截逻辑
const confirmCloseAddNodeModal = () => {
  // 判断是否有已填数据（选了分类/输了内容/传了图片）
  const hasData = nodeForm.value.growthId || 
                  nodeForm.value.content.trim() || 
                  nodeForm.value.imgUrls.length > 0
  // 无数据：直接关闭
  if (!hasData) {
    closeAddNodeModal()
    return
  }
  // 有数据：弹出警告确认，确认后才关闭
  const isConfirm = confirm('⚠️ 警告：你已填写节点内容/上传图片，关闭后数据将全部丢失！\n是否确定关闭？')
  if (isConfirm) {
    closeAddNodeModal()
  }
}
const closeDeleteCategoryModal = () => {
  showDeleteCategoryModal.value = false
  deleteCategoryId.value = ''
}
const closeDeleteNodeStep1Modal = () => {
  showDeleteNodeStep1Modal.value = false
  deleteNodeSelectedType.value = ''
}
const closeDeleteNodeStep2Modal = () => {
  showDeleteNodeStep2Modal.value = false
  deleteNodeSelectedCategoryId.value = ''
}
const closeDeleteNodeStep3Modal = () => {
  showDeleteNodeStep3Modal.value = false
  deleteNodeId.value = ''
  deleteNodeList.value = []
}
const closeLogModal = () => {
  showLogModal.value = false
  logForm.value = { content: '', imgUrls: [] }
}

/**
 * 图片上传通用方法（返回图片URL）
 */
const uploadImage = async (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    alert('请上传合法的图片格式（JPG/PNG/GIF）')
    return null
  }
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await axios.post('https://xiaolongya.cn/blog/upload/image', formData)
    if (res.data.code === 200) {
      return res.data.data.trim()
    }
    throw new Error(res.data.msg || '图片上传失败')
  } catch (err) {
    alert(`图片上传失败：${err.message}`)
    return null
  }
}

// ========== 核心新增：双图片按钮逻辑 ==========
/**
 * 触发图片嵌入的文件选择
 */
const triggerInsertImg = () => {
  insertImgFileInput.value.click()
}
/**
 * 触发图片上传的文件选择
 */
const triggerUploadImg = () => {
  uploadImgFileInput.value.click()
}
/**
 * 处理图片嵌入上传：插入[IMAGE:URL]到文字光标位置，不加入imgUrls
 */
const handleInsertImgUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const imgUrl = await uploadImage(file)
  if (!imgUrl) return

  const input = nodeContentInputRef.value
  if (!input) return
  // 获取光标位置
  const start = input.selectionStart
  const end = input.selectionEnd
  // 构造图片标记，换行分隔更美观
  const imgTag = `\n[IMAGE:${imgUrl}]\n`
  // 插入标记到光标位置
  nodeForm.value.content = nodeForm.value.content.substring(0, start) + imgTag + nodeForm.value.content.substring(end)
  // 重置光标到标记后，提升体验
  nextTick(() => {
    input.selectionStart = input.selectionEnd = start + imgTag.length
  })
  // 清空文件框，允许重复选择同一文件
  e.target.value = ''
}
/**
 * 处理图片上传：直接加入imgUrls（底部展示），和原有逻辑一致
 */
const handleUploadImgUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const imgUrl = await uploadImage(file)
  if (imgUrl) {
    nodeForm.value.imgUrls.push(imgUrl)
  }
  e.target.value = ''
}
// ==============================================

/**
 * 龙岛日志 - 图片上传
 */
const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const imgUrl = await uploadImage(file)
  if (imgUrl) {
    logForm.value.imgUrls.push(imgUrl)
  }
  e.target.value = ''
}
const removeImage = (idx) => logForm.value.imgUrls.splice(idx, 1)
const handleImgError = (idx) => {
  alert(`第${idx+1}张图片无效，已自动移除`)
  removeImage(idx)
}

/**
 * 成长节点 - 图片相关（仅处理底部图片）
 */
const removeNodeImage = (idx) => nodeForm.value.imgUrls.splice(idx, 1)
const handleNodeImgError = (idx) => {
  alert(`第${idx+1}张底部图片无效，已自动移除`)
  removeNodeImage(idx)
}

/**
 * 提交成长分类
 */
const submitCategory = async () => {
  const { name, type } = categoryForm.value
  if (!name.trim() || !type) return
  isSubmitting.value = true
  try {
    const res = await axios.post('https://xiaolongya.cn/blog/growth/upload', {
      name,
      type
    })
    if (res.data.code === 200) {
      alert('成长分类添加成功！')
      closeAddCategoryModal()
      getCategoryList()
    } else {
      throw new Error(res.data.msg || '分类添加失败')
    }
  } catch (err) {
    alert(`分类添加失败：${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 提交成长节点（无需修改：后端原样存储content和imgUrls即可）
 */
const submitNode = async () => {
  const { growthId, content, imgUrls } = nodeForm.value
  if (!growthId || !content.trim()) return
  isSubmitting.value = true
  try {
    const res = await axios.post('https://xiaolongya.cn/blog/node/upload', {
      growthId,
      content: content.trim(),
      imgUrls
    })
    if (res.data.code === 200) {
      alert('成长节点添加成功！')
      closeAddNodeModal()
    } else {
      throw new Error(res.data.msg || '节点添加失败')
    }
  } catch (err) {
    alert(`节点添加失败：${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 提交删除成长分类
 */
const submitDeleteCategory = async () => {
  if (!deleteCategoryId.value) return
  if (!confirm('确认删除该分类？删除后该分类下的节点也会被删除！')) return
  isSubmitting.value = true
  try {
    const res = await axios.post(`https://xiaolongya.cn/blog/growth/delete?id=${deleteCategoryId.value}`)
    if (res.data.code === 200) {
      alert('分类删除成功！')
      closeDeleteCategoryModal()
      getCategoryList()
    } else {
      throw new Error(res.data.msg || '分类删除失败')
    }
  } catch (err) {
    alert(`分类删除失败：${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 提交删除成长节点
 */
const submitDeleteNode = async () => {
  if (!deleteNodeId.value) return
  if (!confirm('确认删除该节点？')) return
  isSubmitting.value = true
  try {
    const res = await axios.post(`https://xiaolongya.cn/blog/node/delete?id=${deleteNodeId.value}`)
    if (res.data.code === 200) {
      alert('节点删除成功！')
      closeDeleteNodeStep3Modal()
      getNodeListByCategoryId(deleteNodeSelectedCategoryId.value)
    } else {
      throw new Error(res.data.msg || '节点删除失败')
    }
  } catch (err) {
    alert(`节点删除失败：${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 提交龙岛日志
 */
const submitLog = async () => {
  const content = logForm.value.content.trim()
  if (!content) return
  isSubmitting.value = true
  try {
    const res = await axios.post('https://xiaolongya.cn/blog/development/upload', {
      content,
      imgUrls: logForm.value.imgUrls
    })
    if (res.data.code === 200) {
      alert('龙岛日志更新成功！')
      closeLogModal()
    } else {
      throw new Error(res.data.msg || '日志提交失败')
    }
  } catch (err) {
    alert(`日志提交失败：${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 格式化时间
 */
const formatTime = (timeStr) => {
  if (!timeStr) return '未知时间'
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 页面初始化
 */
onMounted(() => {
  getCategoryList()
})
</script>

<style scoped>
/* 页面容器 */
.admin-page {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 0;
  font-family: "Microsoft YaHei", "楷体", sans-serif;
}

/* 顶部标题 */
.admin-header {
  text-align: center;
  margin-bottom: 60px;
}
.admin-title {
  font-size: 100px;
  font-weight: 900;
  background: linear-gradient(135deg, #00c0e2, #2f5496);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: "Ma Shan Zheng", "楷体", "STKaiti", cursive;
  letter-spacing: 10px;
  margin: 0;
}

/* 主体圆圈区域 */
.admin-main-content {
  width: 100%;
  background-color: #b3d8ff;
  border-radius: 80px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 60px 20px;
  box-sizing: border-box;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(47, 84, 150, 0.1);
}

/* 圆圈按钮样式 */
.circle-item {
  width: 180px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
.circle-bg {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
  border: 2px solid #2f5496;
  padding: 10px;
  box-sizing: border-box;
}
.circle-bg:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(47, 84, 150, 0.2);
  background-color: #f8fbff;
  border-color: #3a66b8;
}
.circle-bg:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(47, 84, 150, 0.2);
}
.circle-text {
  font-size: 25px;
  font-weight: 700;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  text-align: center;
  white-space: pre-line;
  line-height: 1.5;
  transition: color 0.15s ease;
}
.circle-bg:hover .circle-text {
  color: #3a66b8;
}

/* 弹窗遮罩 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: modalFadeIn 0.1s ease forwards;
  opacity: 0;
}

/* 弹窗容器 */
.modal-container {
  width: 500px;
  max-width: 90vw;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-family: "Microsoft YaHei", "楷体", serif;
  animation: modalFadeIn 0.12s ease forwards;
  opacity: 0;
  overflow: hidden;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 弹窗标题 */
.modal-title {
  font-size: 24px;
  color: #2f5496;
  text-align: center;
  margin-bottom: 25px;
  font-weight: 700;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}
.danger-title {
  color: #ff4d4f;
  border-bottom-color: #ffcccc;
}

/* 表单项 */
.modal-form-item {
  margin-bottom: 25px;
}
.modal-form-item label {
  display: block;
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}
.modal-input, .modal-select, .modal-textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.1s ease;
  background-color: #fff;
}
.modal-select {
  cursor: pointer;
}
.modal-textarea {
  font-family: "Microsoft YaHei", "楷体", serif;
  resize: vertical;
}
.modal-input:focus, .modal-select:focus, .modal-textarea:focus {
  border-color: #2f5496;
}

/* 文件输入 + 上传提示 */
.modal-file-input {
  font-size: 16px;
  font-family: "Microsoft YaHei", "楷体", serif;
  padding: 8px 0;
  color: #666;
}
.upload-tip {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
  margin-bottom: 0;
}

/* 图片预览 */
.upload-preview {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
.remove-img-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background-color: #ff4d4f;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.1s ease;
}
.remove-img-btn:hover {
  background-color: #ff7875;
}

/* 按钮组 */
.modal-btn-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}
.growth-btn-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}
.growth-sub-btn, .modal-submit-btn {
  padding: 12px 0;
  background-color: #2f5496;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
  box-shadow: 0 2px 6px rgba(47, 84, 150, 0.2);
}
.modal-submit-btn {
  padding: 10px 30px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.growth-sub-btn.danger, .modal-submit-btn.danger-btn {
  background-color: #ff4d4f;
  box-shadow: 0 2px 6px rgba(255, 77, 79, 0.2);
}
.growth-sub-btn:hover, .modal-submit-btn:not(:disabled):hover {
  background-color: #3a66b8;
}
.growth-sub-btn.danger:hover, .modal-submit-btn.danger-btn:not(:disabled):hover {
  background-color: #ff7875;
}
.growth-sub-btn:active, .modal-submit-btn:not(:disabled):active {
  transform: translateY(1px);
  box-shadow: none;
}
.growth-sub-btn:disabled, .modal-submit-btn:disabled {
  background-color: #b3d8ff;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
.modal-close-btn {
  padding: 10px 30px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
}
.modal-close-btn:hover {
  background-color: #f0f0f0;
  border-color: #ccc;
}
.modal-close-btn:active {
  transform: translateY(1px);
}
.modal-close-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 核心新增：双图片按钮样式（适配原有风格） */
.img-double-btn {
  margin-top: 12px;
}
.img-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.1s ease;
  color: #fff;
}
.insert-btn {
  background-color: #2f5496;
}
.upload-btn {
  background-color: #00c0e2;
}
.img-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
.img-btn:active {
  transform: translateY(1px);
}

/* 加载图标 */
.loading-icon {
  animation: rotate 1.5s linear infinite;
}
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .admin-title { font-size: 36px; }
  .admin-main-content { border-radius: 40px; padding: 30px 10px; gap: 20px; }
  .circle-item { width: 120px; height: 120px; }
  .circle-bg { width: 120px; height: 120px; }
  .circle-text { font-size: 18px; }
  .modal-container { padding: 20px; }
  .modal-title { font-size: 20px; margin-bottom: 20px; }
  .modal-btn-group { gap: 15px; }
  .modal-submit-btn, .modal-close-btn { padding: 8px 20px; font-size: 16px; }
  .growth-sub-btn { font-size: 16px; }
  .img-btn { padding: 6px 15px; font-size: 14px; }
}
</style>