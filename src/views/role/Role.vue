<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row>
        <el-col :span="6">
          <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus"
                     @click="handleCreate">
            添加
          </el-button>
        </el-col>
        <el-col :span="8" :offset="10">
          <el-input placeholder="请输入角色名称" v-model="listQuery.q" class="input-with-select"
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
      <el-table-column label="ID" prop="id" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" width="260" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限" min-width="80" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.permissions.map(r => r.name).join(',') }}</span>
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

    <!--    添加角色对话框-->
    <el-dialog title="添加角色" :visible.sync="addFormVisible">
      <el-form ref="addForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:80px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-tree ref="addPermissionTree" :data="permissionTree" :props="defaultProps" node-key="id" getCheckedNodes="" default-expand-all show-checkbox check-on-click-node/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注信息"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearForm">
          取消
        </el-button>
        <el-button type="primary" @click="createData">
          确认
        </el-button>
      </div>
    </el-dialog>


    <!--  编辑角色额对话框  -->
    <el-dialog title="编辑用户" :visible.sync="editFormVisible">
      <el-form ref="editForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
               style="width: 400px; margin-left:80px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-tree ref="editPermissionTree" :data="permissionTree" :props="defaultProps" node-key="id" :default-checked-keys="getDefaultCheckedKeys" default-expand-all show-checkbox check-on-click-node/>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入备注信息"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearForm">
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
  import { getRoles, getRoleById, updateRole, deleteRole, addRole} from '@/api/role'
  import Pagination from '@/components/Pagination'
  import { getPermissionTree } from '@/api/permission'


  export default {
    name: 'Role',
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
          permissions: []
        },
        permissionTree: [],
        defaultProps: {
          label: 'name',
          children: 'children'
        },
        addFormVisible: false,
        editFormVisible: false,
        rules: {
          name: [
            { required: true, message: '角色名称不能为空', trigger: 'blur' }
          ],
        }
      }
    },
    created() {
      this.getList()
    },
    computed: {
      getDefaultCheckedKeys() {
        const keys = this.temp.permissions.filter(r => r.parentId !== 0).map(p => p.id)
        console.log(keys)
        return keys
      }
    },
    methods: {
      handleErrorMsg(response) {
        if (response.success !== 1) {
          this.$message.error(response.errorMsg)
          return true
        }
        return false
      },
      resetTemp() {
        this.temp = {
          permissions: []
        }
      },
      clearForm() {
        this.resetTemp()
        this.addFormVisible = false
        this.editFormVisible = false
        this.$refs['editForm'].clearValidate()
        this.$refs['addForm'].clearValidate()
      },
      getList() {
        this.listLoading = true
        getRoles(this.listQuery).then(response => {
          this.list = response.data.list
          this.total = response.data.paginator.totalCount
          this.listLoading = false
        })
      },
      handleCreate() {
        this.resetTemp()
        this.addFormVisible = true
        this.$nextTick(() => {
          this.getPermissions()
        })
      },
      createData() {
        this.$refs['addForm'].validate(valid => {
          if (valid) {
            const checkedNodes = this.$refs.addPermissionTree.getCheckedNodes()
            const halfCheckedNodes = this.$refs.addPermissionTree.getHalfCheckedNodes()
            this.temp.permissions = [...checkedNodes, ...halfCheckedNodes]
            addRole(this.temp).then(response => {
              if (this.handleErrorMsg(response)) {
                return
              }
              this.$nextTick(() => {
                this.getList()
                this.clearForm()
              })
            })
          }
        })
      },
      getPermissions() {
        getPermissionTree().then(response => {
          this.permissionTree = response.data
        })
      },
      handleUpdate(row) {
        getRoleById(row.id).then(response => {
          this.temp = response.data
          this.editFormVisible = true
          this.$nextTick(() => {
            this.getPermissions()
          })
        })
      },
      updateData() {
        this.$refs['editForm'].validate(valid => {
          if (valid) {
            const checked = this.$refs.editPermissionTree.getCheckedNodes()
            const halfChecked = this.$refs.editPermissionTree.getHalfCheckedNodes()
            this.temp.permissions = [...checked, ...halfChecked]
            updateRole(this.temp).then(response => {
              if (this.handleErrorMsg(response)) {
                return
              }

              this.$nextTick(() => {
                this.getList()
                this.clearForm()
              })
            })
          }
        })
      },
      handleDelete(row) {
        this.temp = Object.assign({}, row)
        this.$confirm('是否删除该角色?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(r => {
          this.doDelete()
        }).catch(() => {})
      },
      doDelete() {
        deleteRole(this.temp.id).then(response => {
          this.$nextTick(() => {
            this.getList()
            this.clearForm()
          })
        })
      }
    }
  }
</script>
