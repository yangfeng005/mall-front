import request from '@/utils/request';

export function getList(data) {
  return request({
    url: '/goods/list',
    method: 'post',
    data,
  });
}

//根据id获取
export function getById(id) {
  return request({
    url: '/goods/' + id,
    method: 'GET',
  });
}

//插入
export function insert(data) {
  return request({
    url: '/goods',
    method: 'POST',
    data: data,
  });
}

//更新数据状态
export function updateById(data) {
  return request({
    url: '/goods/',
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
    url: '/goods/' + id,
    method: 'DELETE',
  });
}

export function getAllGoodsList() {
  return request({
    url: '/goods/listAll',
    method: 'post',
  });
}

//上架
export function enSale(data) {
  return request({
    url: '/goods/enSale',
    method: 'post',
    data,
  });
}

//下架
export function unSale(data) {
  return request({
    url: '/goods/unSale',
    method: 'post',
    data,
  });
}
