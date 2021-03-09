<template>
  <div>
    <el-form :inline="true" :model="pageParams">
      <el-form-item label="名称">
        <el-input clearable v-model="pageParams.name" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-if="$route.meta.manage" @click="addOne()">添加</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="success" v-if="$route.meta.manage" @click="enSaleGoods()">上架</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" v-if="$route.meta.manage" @click="unSaleGoods()">下架</el-button>
      </el-form-item>
    </el-form>
    <el-table
      stripe
      v-loading="loading"
      :data="tableData"
      row-key="id"
      default-expand-all
      border
      @selection-change="handleSelectionChange"
      style="width: 100%; margin-bottom: 20px;"
    >
      <el-table-column type="selection" width="35"></el-table-column>
      <el-table-column prop="categoryName" label="商品类型" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column prop="name" label="名称" show-overflow-tooltip width="200"></el-table-column>
      <el-table-column prop="brandName" label="品牌" show-overflow-tooltip width="150"></el-table-column>
      <el-table-column label="上架" width="60">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.isOnSale">
              <el-tag size="mini">是</el-tag>
            </template>
            <template v-else>
              <el-tag type="danger" size="mini">否</el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="录入日期" show-overflow-tooltip width="140"></el-table-column>
      <el-table-column prop="attributeCategoryName" label="属性类别" show-overflow-tooltip width="120"></el-table-column>
      <el-table-column prop="retailPrice" label="零售价格" width="80"></el-table-column>
      <el-table-column prop="goodsNumber" label="商品库存" width="80"></el-table-column>
      <el-table-column prop="sellVolume" label="销售量" width="80"></el-table-column>
      <el-table-column prop="marketPrice" label="市场价" width="80"></el-table-column>
      <el-table-column label="是否热销" width="50">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.isHot">
              <el-tag size="mini">是</el-tag>
            </template>
            <template v-else>
              <el-tag type="danger" size="mini">否</el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" :width="!$route.meta.manage ? '150' : '150'">
        <template slot-scope="scope">
          <el-button @click="updateOne(scope.row)" type="primary" size="mini">{{ $route.meta.manage ? '编辑' : '详情' }}</el-button>
          <el-popconfirm v-if="$route.meta.manage" title="确定删除吗？" @confirm="removeOne(scope.row.id)">
            <el-button slot="reference" type="danger" size="mini">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pageParams.pageNo"
      background
      layout="total, prev, pager, next, jumper, sizes"
      :page-size="pageParams.pageSize"
      :total="total"
    ></el-pagination>
    <el-dialog
      top="5vh"
      width="55%"
      :max-height="tableH"
      :height="tableH"
      :close-on-click-modal="false"
      :title="form.id ? '编辑' : '添加'"
      :visible.sync="dialogVisible"
      :before-close="handleCancel"
    >
      <el-dialog width="35%" title="选择分类" :visible.sync="innerVisible" append-to-body>
        <el-form :inline="true" class="form-class form-input" label-width="70px" size="mini">
          <el-form-item label="关键字：" label-width="110px">
            <el-input placeholder="输入关键字过滤" v-model="filterText" style="width: 150px;"> </el-input>
          </el-form-item>
        </el-form>
        <el-card class="box-card">
          <div class="text item">
            <ul class="infinite-list" style="height: 300px; overflow: auto;">
              <el-tree
                :data="categoryTreeData"
                node-key="id"
                ref="categoryTree"
                :filter-node-method="filterNode"
                :props="defaultProps"
              >
              </el-tree>
            </ul>
          </div>
        </el-card>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" type="primary" @click="submitCategory" :loading="saving" icon="el-icon-check">确定 </el-button>
          <el-button size="mini" type="info" @click="clearCategory" :loading="saving" icon="el-icon-document-delete">清除 </el-button>
          <el-button size="mini" @click="innerVisible = false" icon="el-icon-close">关闭</el-button>
        </div>
      </el-dialog>
      <el-form ref="form" :model="form" :disabled="!$route.meta.manage" :rules="formRules" label-width="110px">
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane label="通用信息" name="general">
            <el-form-item label="商品类型">
              <el-input v-model="form.categoryName" autocomplete="off" @focus="searchTreeSource" suffix-icon="el-icon-search"></el-input>
            </el-form-item>
            <el-form-item style="display: none;">
              <el-input v-model="form.categoryId" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="商品序列号">
              <el-input v-model="form.goodsSn" maxlength="64"></el-input>
            </el-form-item>
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" maxlength="64"></el-input>
            </el-form-item>
            <el-form-item label="品牌">
              <el-select v-model="form.brandId">
                <el-option v-for="(item, index) in brandList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="类别">
              <el-select v-model="form.attributeCategory">
                <el-option v-for="(item, index) in attributeCategoryList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="商品库存">
              <el-input-number v-model="form.goodsNumber" :min="1" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="零售价格">
              <el-input v-model="form.retailPrice" maxlength="64"></el-input>
            </el-form-item>
            <el-form-item label="市场价">
              <el-input v-model="form.marketPrice" maxlength="64"></el-input>
            </el-form-item>
            <el-form-item label="商品主图">
              <upload-img :avatarUrl="form.primaryPicUrl" @changeUrl="(url) => (form.primaryPicUrl = url)" />
            </el-form-item>
            <el-form-item label="商品列表图">
              <upload-img :avatarUrl="form.listPicUrl" @changeUrl="(url) => (form.listPicUrl = url)" />
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="详细描述" name="detail">
            <el-tag size="small">商品轮播图</el-tag>
            <el-divider></el-divider>
            <template>
              <el-upload
                :action="`${BASE_URL}/file/upload`"
                list-type="picture-card"
                :file-list="goodsGalleryList"
                :on-preview="handleView"
                :on-success="handleSuccess"
                :before-upload="handleBeforeUpload"
                :on-remove="handleRemove"
                accept=".jpg,.jpeg,.png,.gif,.JPG,.JPEG"
              >
                <i class="el-icon-plus"></i>
              </el-upload>
              <el-dialog :visible.sync="dialogImgVisible">
                <img width="100%" :src="dialogImageUrl" alt="" />
              </el-dialog>
            </template>
            <w-editor v-if="dialogVisible" :value="form.goodsDesc" @onChange="(v) => (form.goodsDesc = v)"></w-editor>
          </el-tab-pane>
          <el-tab-pane label="其他信息" name="otherInfo">
            <el-form-item label="排序">
              <el-input-number v-model="form.sortOrder" :min="1" controls-position="right"></el-input-number>
            </el-form-item>
            <el-form-item label="上架">
              <el-radio-group v-model="form.isOnSale">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="是否新商品">
              <el-radio-group v-model="form.isNew">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="热销">
              <el-radio-group v-model="form.isHot">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="推广描述">
              <el-input v-model="form.promotionDesc" maxlength="64"></el-input>
            </el-form-item>
            <el-form-item label="关键字">
              <el-input v-model="form.keywords" maxlength="64"></el-input>
            </el-form-item>
            <el-form-item label="简明介绍">
              <el-input v-model="form.promotionTag" maxlength="64"></el-input>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <div slot="footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button :loading="saving" type="primary" v-if="$route.meta.manage" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { getStyle } from '@/utils/common';
import { deleteById, getList, insert, updateById, enSale, unSale } from '@/api/goods';
import { getBrandAllList } from '@/api/brand';
import { getAttributeCategoryList } from '@/api/attributeCategory';
import { getList as getCategoryList } from '@/api/category';
import { getGoodsGalleryList } from '@/api/goodsGallery';
import UploadImg from '@/components/Upload';
import WEditor from '@/components/WEditor';

const defaultProps = {
  id: null,
  name: '',
  categoryId: '',
  goodsSn: '',
  brandId: '',
  goodsNumber: null,
  goodsDesc: null,
  keywords: '',
  goodsBrief: '',
  isOnSale: null,
  sortOrder: null,
  attributeCategory: '',
  counterPrice: null,
  extraPrice: null,
  isNew: null,
  goodsUnit: '',
  primaryPicUrl: '',
  listPicUrl: '',
  retailPrice: null,
  sellVolume: null,
  primaryProductId: '',
  unitPrice: null,
  promotionDesc: '',
  promotionTag: '',
  appExclusivePrice: null,
  isAppExclusive: '',
  isLimited: null,
  isHot: null,
  marketPrice: null,
  categoryName: '',
};

export default {
  name: 'Goods',
  components: { UploadImg, WEditor },
  data(props) {
    return {
      dialogImageUrl: '',
      dialogImgVisible: false,
      goodsGalleryList: [],
      goodsIds: [],
      categoryTreeData: null,
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name',
      },
      innerVisible: false,
      attributeCategoryList: [],
      brandList: [],
      loading: false,
      saving: false,
      pageParams: {
        name: '',
        pageNo: 1,
        pageSize: 10,
      },
      activeName: 'general',
      form: props._.cloneDeep(defaultProps),
      dialogVisible: false,
      tableData: [],
      total: 0,
      formRules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      },
    };
  },
  computed: {
    ...mapState('layout', ['tableHeight']),

    tableH() {
      if (this.tableHeight) {
        let html = getStyle(document.documentElement);
        let htmlFont = Number(html.fontSize.replace('px', ''));
        return this.tableHeight - 1.5 * htmlFont;
      }
      return null;
    },
  },
  watch: {
    filterText(val) {
      this.$refs.categoryTree.filter(val);
    },
  },
  methods: {
    handleView(name) {
      this.imgName = name;
      this.visible = true;
    },
    handleRemove(file) {
      // 从 upload 实例删除数据
      const fileList = this.goodsGalleryList;
      this.goodsGalleryList.splice(fileList.indexOf(file), 1);
    },
    handleSuccess(res, file) {
      // 因为上传过程为实例，这里模拟添加 url
      file.url = this.getFile(res.data.id);
      this.goodsGalleryList.push(file);
    },
    handleBeforeUpload() {
      const check = this.goodsGalleryList.length < 4;
      if (!check) {
        this.$notify.warning({
          title: '最多只能上传 4 张图片。',
        });
      }
      return check;
    },

    //上架
    enSaleGoods() {
      enSale({
        goodsIds: this.goodsIds.join(','),
      }).then(() => {
        this.$message({
          type: 'success',
          message: '操作成功',
        });
        this.loadData();
      });
    },
    unSaleGoods() {
      unSale({
        goodsIds: this.goodsIds.join(','),
      }).then(() => {
        this.$message({
          type: 'success',
          message: '操作成功',
        });
        this.loadData();
      });
    },
    handleSelectionChange(val) {
      this.goodsIds = [];
      if (val && val.length > 0) {
        val.forEach((item) => {
          this.goodsIds.push(item.id);
        });
      }
    },
    //过滤树形数据
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1 || data.code.indexOf(value) !== -1;
    },
    //查找树数据源
    searchTreeSource() {
      getCategoryList().then((res) => {
        this.categoryTreeData = res.data;
      });
      this.filterText = '';
      this.innerVisible = true;
    },
    //选择商品分类
    submitCategory() {
      let category = this.$refs.categoryTree.getCurrentNode();
      if (category) {
        this.form.categoryName = category.name;
        this.form.categoryId = category.id;
        this.innerVisible = false;
      }
    },
    //清除选择的商品分类
    clearCategory() {
      this.form.categoryName = '';
      this.form.categoryId = '';
      this.innerVisible = false;
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    addOne(row) {
      if (row) {
        this.form.name = row.name;
      }
      this.dialogVisible = true;
    },
    handleSearch() {
      this.loadData();
    },
    loadData() {
      this.loading = true;
      getList(this.pageParams)
        .then((res) => {
          if (res.data) {
            this.tableData = res.data;
            this.total = (res.additionalProperties.page && res.additionalProperties.page.total) || res.data.length;
          }
        })
        .finally(() => (this.loading = false));
    },
    handleCancel() {
      this.form = this._.cloneDeep(defaultProps);
      this.$refs.form.resetFields();
      this.dialogVisible = false;
    },
    handleSave() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;

        this.saving = true;
        if (this.goodsGalleryList && this.goodsGalleryList.length > 0) {
          let imgIds = [];
          this.goodsGalleryList.forEach((item) => {
            imgIds.push(item.url.split('=')[1]);
          });
          this.form.galleryImgIds = imgIds;
        }

        if (this.form && this.form.id) {
          updateById(JSON.stringify(this.form))
            .then(() => {
              this.$message({
                message: '保存成功',
                type: 'success',
              });
              this.loadData();
              this.handleCancel();
            })
            .finally(() => (this.saving = false));
        } else {
          insert({
            ...this.form,
          })
            .then(() => {
              this.$message({
                message: '保存成功',
                type: 'success',
              });
              this.loadData();
              this.handleCancel();
            })
            .finally(() => (this.saving = false));
        }
      });
    },
    updateOne(row) {
      this.form = this._.pick(row, Object.keys(defaultProps));
      let params = {
        goodsId: row.id,
      };
      let that = this;
      this.goodsGalleryList = [];
      getGoodsGalleryList(params).then((res) => {
        if (res.data && res.data.length > 0) {
          let goodsGalleryList = [];
          res.data.forEach((item) => {
            let gallery = {
              url: that.getFile(item.imgUrl),
            };
            goodsGalleryList.push(gallery);
          });
          this.goodsGalleryList = goodsGalleryList;
        }
      });
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },
    removeOne(agencyId) {
      deleteById(agencyId).then(() => {
        this.$message({
          message: '删除成功',
          type: 'success',
        });
        this.loadData();
      });
    },
    handleSizeChange(pageSize) {
      this.pageParams.pageSize = pageSize;
      this.loadData();
    },
    handleCurrentChange(pageNo) {
      this.pageParams.pageNo = pageNo;
      this.loadData();
    },
  },
  mounted() {
    this.loadData();
    getBrandAllList().then((res) => {
      this.brandList = res.data;
    });
    getAttributeCategoryList().then((res) => {
      this.attributeCategoryList = res.data;
    });
  },
};
</script>
