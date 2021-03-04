import request from '@/utils/request';

export function getGoodsGalleryList(data) {
  return request({
    url: '/goodsGallery/listAll',
    method: 'post',
    data,
  });
}
