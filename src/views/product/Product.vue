<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="6">
          <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" size="mini"
                     @click="handleCreate">
            添加
          </el-button>
        </el-col>
        <el-col :span="8" :offset="10">
          <el-input placeholder="请输入商品名称搜索" v-model="listQuery.q" class="input-with-select"
                    @keyup.enter.native="getList">
            <el-button slot="append" icon="el-icon-search" @click="getList"/>
          </el-input>
        </el-col>
      </el-row>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        type="index"
        width="50" align="center">
      </el-table-column>
      <el-table-column label="名称" width="200" property="name"/>
      <el-table-column label="类目" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.category.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="单价" width="80" property="price"/>
      <el-table-column label="备注" min-width="260" property="remark"/>
      <el-table-column label="禁用" width="70" align="center">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.disabled" @change="checkDisabledStatus(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button-group>
            <el-tooltip effect="dark" content="编辑" placement="top-end" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleUpdate(row)"/>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top-end" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDelete(row)"/>
            </el-tooltip>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
                @pagination="getList"/>

    <!--    添加商品对话框-->
    <el-dialog title="添加商品" :visible.sync="addFormVisible">
      <el-form ref="addForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:80px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item label="类目" prop="category">
          <el-select v-model="temp.category" value-key="id" filterable clearable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allCategories"
              :key="item.id"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="temp.price"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注信息"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearAddForm">
          取消
        </el-button>
        <el-button type="primary" @click="createData">
          确认
        </el-button>
      </div>
    </el-dialog>

    <!--  编辑商品对话框  -->
    <el-dialog title="编辑商品" :visible.sync="editFormVisible">
      <el-form ref="editForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:80px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item label="类目" prop="category">
          <el-select v-model="temp.category" value-key="id" clearable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allCategories"
              :key="item.id"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="temp.price"/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注信息"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearEditForm">
          取消
        </el-button>
        <el-button type="primary" @click="updateData">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { getProducts, getProductById, deleteProduct, updateProduct, addProduct } from '@/api/product'
  import { getCategories } from '@/api/product-category'
  import Pagination from '@/components/Pagination'


  export default {
    name: 'Product',
    components: { Pagination },
    data() {
      return {
        list: [],
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          q: undefined
        },
        temp: {},
        allCategories: [],
        addFormVisible: false,
        editFormVisible: false,
        rules: {
          name: [
            { required: true, message: '商品名称不能为空', trigger: 'blur' }
          ],
          category: [
            { required: true, message: '商品类目不能为空', trigger: 'blur' }
          ],
          price: [
            { required: true, message: '商品单价不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      resetTemp() {
        this.temp = {}
      },
      clearAddForm() {
        this.resetTemp()
        this.addFormVisible = false
        this.$refs['addForm'].clearValidate()
      },
      clearEditForm() {
        this.resetTemp()
        this.editFormVisible = false
        this.$refs['editForm'].clearValidate()
      },
      getList() {
        this.listLoading = true
        getProducts(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.paginator.totalCount
          this.listLoading = false
        })
      },
      getAllCategories() {
        getCategories().then(response => {
          this.$nextTick(() => {
            this.allCategories = response.data.list
          })
        })
      },
      handleCreate() {
        this.resetTemp()
        this.addFormVisible = true
        this.getAllCategories()
      },
      createData() {
        this.$refs['addForm'].validate(valid => {
          if (valid) {
            addProduct(this.temp).then(response => {
              this.$nextTick(() => {
                this.getList()
                this.clearAddForm()
              })
            })
          }
        })
      },
      handleUpdate(row) {
        this.getAllCategories()
        getProductById(row.id).then(response => {
          this.temp = response.data
          this.editFormVisible = true
        })
      },
      updateData() {
        this.$refs['editForm'].validate(valid => {
          if (valid) {
            updateProduct(this.temp).then(response => {
              this.$nextTick(() => {
                this.getList()
                this.clearEditForm()
              })
            })
          }
        })
      },
      checkDisabledStatus(row) {
        let msg = (!row.disabled) ? '是否启用该商品' : '是否禁用该商品'
        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(r => {
          updateProduct({
            id: row.id,
            disabled: row.disabled
          }).then(response => {
            this.$notify({
              title: '提示',
              message: '更新状态成功',
              type: 'success'
            })
          })
        }).catch(() => row.disabled = !row.disabled)
      },
      handleDelete(row) {
        this.temp = Object.assign({}, row)
        this.$confirm('是否删除该类目?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(r => {
          this.doDelete()
        }).catch(() => {})
      },
      doDelete() {
        deleteProduct(this.temp.id).then(response => {
          this.$nextTick(() => {
            this.getList()
            this.resetTemp()
          })
        })
      }
    }
  }
</script>
