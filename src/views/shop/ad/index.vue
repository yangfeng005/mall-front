<template>
  <div>
    <el-form :inline="true" :model="pageParams">
      <el-form-item label="广告名称">
        <el-input clearable v-model="pageParams.name" placeholder="广告名称"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-if="$route.meta.manage" @click="addOne">添加</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" ref="multipleTable" :data="tableData" :max-height="tableH" :height="tableH" border>
      <el-table-column prop="adPositionName" label="广告位置" show-overflow-tooltip width="200"></el-table-column>
      <el-table-column prop="mediaType" label="形式" show-overflow-tooltip width="50"></el-table-column>
      <el-table-column prop="name" label="广告名称" show-overflow-tooltip width="200"></el-table-column>
      <el-table-column prop="link" label="链接" show-overflow-tooltip width="250"></el-table-column>
      <el-table-column label="图片" width="80">
        <template slot-scope="scope">
          <el-avatar v-if="scope.row.imageUrl" shape="square" style="vertical-align: middle;" :src="getFile(scope.row.imageUrl)"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip width="200"></el-table-column>
      <el-table-column prop="endTime" label="结束时间" show-overflow-tooltip width="100"></el-table-column>
      <el-table-column label="状态" width="60">
        <template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <template v-if="scope.row.enabled">
              <el-tag size="mini">启用</el-tag>
            </template>
            <template v-else>
              <el-tag type="danger" size="mini">禁用</el-tag>
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
      width="40%"
      :close-on-click-modal="false"
      :title="!$route.meta.manage ? '详情' : form.id ? '编辑' : '添加'"
      :visible.sync="dialogVisible"
      :before-close="handleCancel"
    >
      <el-form ref="form" :model="form" :disabled="!$route.meta.manage" :rules="formRules" label-width="110px">
        <el-form-item label="广告位置" prop="adPositionId">
          <el-select v-model="form.adPositionId" filterable>
            <el-option v-for="adPosition in adPositions" :value="adPosition.id" :key="adPosition.id" :label="adPosition.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="形式" prop="mediaType">
          <el-radio-group v-model="form.mediaType">
            <el-radio :label="0">
              0
            </el-radio>
            <el-radio :label="1">
              1
            </el-radio>
            <el-radio :label="2">
              2
            </el-radio>
            <el-radio :label="3">
              3
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="广告名称" prop="name">
          <el-input v-model="form.name" placeholder="广告名称" />
        </el-form-item>
        <el-form-item label="链接" prop="link">
          <el-input v-model="form.link" placeholder="链接" />
        </el-form-item>
        <el-form-item label="图片">
          <upload-img :avatarUrl="form.imageUrl" @changeUrl="(url) => (form.imageUrl = url)" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input type="textarea" v-model="form.content" placeholder="内容" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="form.endTime" placeholder="结束时间"></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-radio-group v-model="form.enabled">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
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
import { deleteById, getList, insert, updateById } from '@/api/ad';
import { getAllAdPositionList } from '@/api/adPosition';
import UploadImg from '@/components/Upload';

import { mapState } from 'vuex';
import { getStyle } from '@/utils/common';

const defaultProps = {
  id: null,
  name: '',
  adPositionName: '',
  adPositionId: '',
  link: '',
  mediaType: null,
  content: null,
  imageUrl: '',
  endTime: null,
  enabled: null,
};

export default {
  name: 'Ad',
  data(props) {
    return {
      adPositions: [],
      loading: false,
      saving: false,
      pageParams: {
        pageNo: 1,
        pageSize: 10,
        name: '',
      },
      form: props._.cloneDeep(defaultProps),
      dialogVisible: false,
      tableData: [],
      total: 0,
      brandIds: [], // 批量操作状态
      formRules: {
        name: [{ required: true, message: '请输入广告名称', trigger: 'blur' }],
      },
    };
  },
  components: {
    UploadImg,
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
    handleSelectionChange(val) {
      this.brandIds = val;
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
    getAllAdPositionList().then((res) => {
      this.adPositions = res.data;
    });
  },
};
</script>
