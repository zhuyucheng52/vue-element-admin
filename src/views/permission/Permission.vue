<template>
  <div class="app-container">
    <el-tree :data="list" :props="defaultProps" align="center" default-expand-all/>
  </div>
</template>

<script>

  import { getPermissionTree } from '@/api/permission'
  import Pagination from '@/components/Pagination'

  export default {
    name: 'Permission',
    components: { Pagination },
    data() {
      return {
        list: [],
        defaultProps: {
          label: 'name',
          children: 'children'
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        getPermissionTree(this.listQuery).then(response => {
          this.list = response.data
        })
      },
    }
  }

</script>

