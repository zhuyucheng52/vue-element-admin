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
          <el-input placeholder="请输入订单编号,商品名称,客户名称,客户手机号或地址搜索" v-model="listQuery.q" class="input-with-select"
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
        fixed
        width="50" align="center">
      </el-table-column>
      <el-table-column label="编号" width="160" property="num"/>
      <el-table-column label="商品名称" width="120" property="productName"/>
      <el-table-column label="件数" width="80" property="productNum"/>
      <el-table-column label="金额" width="80" property="payment"/>
      <el-table-column label="状态" width="80" property="status"/>
      <el-table-column label="客户" width="100" property="customerName"/>
      <el-table-column label="电话" width="120" property="customerMobile"/>
      <el-table-column label="地址" min-width="200" property="address"/>
      <el-table-column label="审批状态" min-width="80" property="approveStatus" fixed="right"/>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width" fixed="right">
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
    <el-dialog title="添加订单" :visible.sync="addFormVisible">
      <el-form ref="addForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:80px;">
        <el-form-item label="编号" prop="num">
          <el-input v-model="temp.num"/>
        </el-form-item>
        <el-form-item label="类目" prop="category">
          <el-select v-model="temp.category" value-key="id" @change="getProductsByCategory" filterable clearable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allCategories"
              :key="item.id"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品" prop="product">
          <el-select v-model="temp.product" value-key="id" filterable clearable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allProducts"
              :key="item.id"
              :label="item.name"
              :value="item">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.price }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="客户" prop="customer">
          <el-select v-model="temp.customer" value-key="id" filterable clearable placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in allCustomers"
              :key="item.id"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="productNum">
          <el-input v-model="temp.productNum"/>
        </el-form-item>
        <el-form-item label="金额" prop="payment">
          <el-input v-model="temp.payment" type="number"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-input v-model="temp.status"/>
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
    <el-dialog title="编辑订单" :visible.sync="editFormVisible">
      <el-form ref="editForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:80px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name"/>
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
  import { getOrders, deleteOrder, updateOrder, addOrder } from '@/api/order'
  import { generateRandomWithCurrentTime } from '@/utils'
  import { getCategories } from '@/api/product-category'
  import { getCustomers } from '@/api/customer'
  import { getProductsByCategoryId } from '@/api/product'
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
        temp: {
          category: null,
          product: null,
          priority: 3,
          productNum: 1
        },
        allCategories: [],
        allProducts: [],
        allCustomers: [],
        addFormVisible: false,
        editFormVisible: false,
        rules: {
          productNum: [
            { required: true, message: '商品件数不能为空', trigger: 'blur' }
          ],
          payment: [
            { required: true, message: '金额不能为空', trigger: 'blur' }
          ]
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      resetTemp() {
        this.temp = {
          category: null,
          product: null,
          priority: 0,
          productNum: 1
        }
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
      // computePayment() {
      //   if (this.temp.product && this.temp.product.price && this.temp.productNum) {
      //     let price = this.temp.product.price
      //     let productNum = this.temp.productNum
      //     this.temp.payment = price * productNum
      //   }
      //   console.log("Computed: " + this.temp.payment)
      // },
      getList() {
        this.listLoading = true
        getOrders(this.listQuery).then(response => {
          this.$nextTick(() => {
            this.list = response.data.list
            this.total = response.data.paginator.totalCount
            this.listLoading = false
          })
        })
      },
      getAllCategories() {
        getCategories().then(response => {
          this.$nextTick(() => {
            this.allCategories = response.data.list
            if (this.allCategories.length > 0) {
              this.temp.category = this.allCategories[0]
              this.getProductsByCategory()
            }
          })
        })
      },
      getProductsByCategory() {
        getProductsByCategoryId(this.temp.category.id).then(response => {
          this.$nextTick(() => {
            this.allProducts = response.data
            if (this.allProducts.length > 0) {
              this.temp.product = this.allProducts[0]
            } else {
              this.temp.product = null
            }
          })
        })
      },
      getCustomers() {
        getCustomers().then(response => {
          this.$nextTick(() => {
            this.allCustomers = response.data.list
            if (this.allCustomers.length > 0) {
              this.temp.customer = this.allCustomers[0]
            }
          })
        })
      },
      handleCreate() {
        this.resetTemp()
        this.addFormVisible = true
        this.getAllCategories()
        this.getCustomers()
        this.temp.num = generateRandomWithCurrentTime()
      },
      convertData() {
        if (this.temp.product) {
          this.temp.productId = this.temp.product.id
          this.temp.productName = this.temp.product.name
        }
        if (this.temp.customer) {
          this.temp.customerId = this.temp.customer.id
          this.temp.customerName = this.temp.customer.name
          this.temp.customerMobile = this.temp.customer.mobile
          this.temp.address = this.temp.customer.address
        }
      },
      createData() {
        this.$refs['addForm'].validate(valid => {
          if (valid) {
            this.convertData()
            this.temp.customerId = this.temp.customer.id
            addOrder(this.temp).then(response => {
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
        // getProductById(row.id).then(response => {
        //   this.temp = response.data
          this.editFormVisible = true
        // })
      },
      updateData() {
        this.$refs['editForm'].validate(valid => {
          if (valid) {
            // updateProduct(this.temp).then(response => {
            //   this.$nextTick(() => {
            //     this.getList()
                this.clearEditForm()
              // })
            // })
          }
        })
      },
      handleDelete(row) {
        this.temp = Object.assign({}, row)
        this.$confirm('是否删除该订单?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(r => {
          this.doDelete()
        }).catch(() => {})
      },
      doDelete() {
        deleteOrder(this.temp.id).then(response => {
          this.$nextTick(() => {
            this.getList()
            this.resetTemp()
          })
        })
      }
    }
  }
</script>
