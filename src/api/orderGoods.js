import request from '@/utils/request';

export function getList(data) {
  return request({
    url: '/orderGoods/list',
    method: 'post',
    data,
  });
}
