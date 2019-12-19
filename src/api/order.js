import request from '@/utils/request'

export function getOrders(params) {
  return request({
    url: '/orders',
    method: 'get',
    params
  })
}

export function deleteOrder(id) {
  return request({
    url: '/order/' + id,
    method: 'delete'
  })
}

export function updateOrder(data) {
  return request({
    url: '/order',
    method: 'put',
    data
  })
}

export function addOrder(data) {
  return request({
    url: '/order',
    method: 'post',
    data
  })
}
