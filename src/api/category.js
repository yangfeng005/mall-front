import request from '@/utils/request';

export function getList(data) {
  return request({
    url: '/category/list',
    method: 'post',
    data,
  });
}

export function saveOrUpd(data) {
  return request({
    url: '/category/save',
    method: 'post',
    data,
  });
}

export function removeOne(params) {
  return request({
    url: '/category/delete',
    method: 'get',
    params,
  });
}
