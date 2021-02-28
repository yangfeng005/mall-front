import request from '@/utils/request';

export function getList(data) {
  return request({
    url: '/order/list',
    method: 'post',
    data,
  });
}

//根据id获取
export function getById(id) {
  return request({
    url: '/order/' + id,
    method: 'GET',
  });
}

//插入
export function insert(data) {
  return request({
    url: '/order',
    method: 'POST',
    data: data,
  });
}

//更新数据状态
export function updateById(data) {
  return request({
    url: '/order/',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: data,
  });
}

//删除
export function deleteById(id) {
  return request({
    url: '/order/' + id,
    method: 'DELETE',
  });
}

export function getAllGoodsList() {
  return request({
    url: '/order/listAll',
    method: 'post',
  });
}

export function sendGoods(data) {
  return request({
    url: '/order/sendGoods',
    method: 'post',
    data,
  });
}
