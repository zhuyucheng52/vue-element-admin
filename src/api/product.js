import request from '@/utils/request'

export function getProducts(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}

export function deleteProduct(id) {
  return request({
    url: `/product/${id}`,
    method: 'delete'
  })
}

export function updateProduct(data) {
  return request({
    url: '/product',
    method: 'put',
    data
  })
}

export function addProduct(data) {
  return request({
    url: '/product',
    method: 'post',
    data
  })
}
