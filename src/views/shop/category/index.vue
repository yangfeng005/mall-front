<template>
  <div>
    <el-form :inline="true" :model="pageParams">
      <el-form-item label="分类名称">
        <el-input clearable v-model="pageParams.name" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="分类编码">
        <el-input clearable v-model="pageParams.code" placeholder="请输入编码"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-if="$route.meta.manage" @click="addOne()">添加</el-button>
      </el-form-item>
    </el-form>
    <el-table stripe v-loading="loading" :data="tableData" row-key="id" default-expand-all border style="width: 100%; margin-bottom: 20px;">
      <el-table-column prop="name" label="分类名称" width="200"></el-table-column>
      <el-table-column prop="code" label="分类编码" width="150"></el-table-column>
      <el-table-column prop="frontDesc" label="描述" show-overflow-tooltip width="250"></el-table-column>
      <el-table-column prop="showIndex" label="首页展示" width="80"></el-table-column>
      <el-table-column prop="isShow" label="显示" width="60">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.isShow">
              <el-tag size="mini">是</el-tag>
            </template>
            <template v-else>
              <el-tag type="danger" size="mini">否</el-tag>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" :width="!$route.meta.manage ? '200' : '260'">
        <template slot-scope="scope">
          <el-button @click="updateOne(scope.row)" type="primary" size="mini">{{ $route.meta.manage ? '编辑' : '详情' }}</el-button>
          <el-button v-if="$route.meta.manage" style="margin-right: 10px;" @click="addOne(scope.row)" type="info" size="mini"
            >添加子类</el-button
          >
          <el-popconfirm v-if="$route.meta.manage" title="确定删除吗？" @confirm="removeOne(scope.row.id)">
            <el-button slot="reference" type="danger" size="mini">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      top="2vh"
      width="40%"
      :max-height="tableH"
      :height="tableH"
      :close-on-click-modal="false"
      :title="`${!form.id && form.parentCode ? '添加子类' : form.id ? '编辑' : '添加'}`"
      :visible.sync="dialogVisible"
      :before-close="handleCancel"
    >
      <el-form ref="form" :model="form" :disabled="!$route.meta.manage" :rules="formRules" label-width="110px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input :disabled="!!form.id" v-model="form.code" maxlength="16"></el-input>
          <small v-if="!form.id">注：编码设置后不能修改</small>
        </el-form-item>
        <el-form-item label="父类编码" v-if="form.parentCode" prop="parentCode">
          <el-input disabled v-model="form.parentCode" maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="父类名称" v-if="form.parentName" prop="parentName">
          <el-input disabled v-model="form.parentName" maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.frontDesc" maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="rank">
          <el-input-number v-model="form.rank" :min="1" controls-position="right"></el-input-number>
        </el-form-item>
        <el-form-item label="首页展示排序">
          <el-input-number v-model="form.showIndex" :min="1" controls-position="right"></el-input-number>
        </el-form-item>
        <el-form-item label="显示">
          <el-radio-group v-model="form.isShow">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="banner图片">
          <upload-img :avatarUrl="form.bannerUrl" @changeUrl="(url) => (form.bannerUrl = url)" />
        </el-form-item>
        <el-form-item label="手机banner">
          <upload-img :avatarUrl="form.wapBannerUrl" @changeUrl="(url) => (form.wapBannerUrl = url)" />
        </el-form-item>
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
import { getList, removeOne, saveOrUpd } from '@/api/category';
import UploadImg from '@/components/Upload';

const defaultProps = {
  id: null,
  name: '',
  code: '',
  frontDesc: '',
  parentCode: '',
  rank: null,
  showIndex: null,
  isShow: null,
  bannerUrl: '',
  iconUrl: '',
  imgUrl: '',
  wapBannerUrl: '',
  type: null,
  frontName: '',
  parentName: '',
};

export default {
  name: 'Category',
  components: {
    UploadImg,
  },
  data(props) {
    return {
      loading: false,
      saving: false,
      pageParams: {
        // pageNo: 1,
        // pageSize: 10,
        name: '',
        code: '',
      },
      form: props._.cloneDeep(defaultProps),
      dialogVisible: false,
      tableData: [],
      total: 0,
      formRules: {
        name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
        code: [
          { required: true, message: '请输入分类编码', trigger: 'blur' },
          { max: 16, min: 3, message: '长度必须在3至16个字符之间' },
        ],
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
  methods: {
    addOne(row) {
      if (row) {
        this.form.parentName = row.name;
        this.form.parentCode = row.code;
      }
      this.dialogVisible = true;
    },
    handleSearch() {
      // this.pageParams.pageNo = 1;

      this.loadData();
    },
    loadData() {
      this.loading = true;
      getList(this.pageParams)
        .then((res) => {
          if (res.data) {
            this.tableData = res.data;
            // this.total = (res.additionalProperties.page && res.additionalProperties.page.total) || res.data.length;
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

        saveOrUpd({
          ...this.form,
          children: JSON.stringify(this.form.children || []),
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
      });
    },
    updateOne(row) {
      this.form = this._.pick(row, Object.keys(defaultProps));

      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.form.clearValidate();
      });
    },
    removeOne(categoryId) {
      removeOne({ categoryId }).then(() => {
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
    changeSwitch(data) {
      const form = this._.pick(data, Object.keys(defaultProps));
      form.status = form.status == 1 ? 2 : 1;
      saveOrUpd(form).then(() => {
        data.status = form.status;
      });
    },
  },
  mounted() {
    this.loadData();
  },
};
</script>
