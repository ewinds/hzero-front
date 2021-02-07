import React from 'react';
import { Spin, Icon } from 'hzero-ui';
import FreeIcon from '@/assets/market/free.svg';
import styles from './index.less';

export default function ProductItem({ productList = [], loading, jumpHost }) {
  const getCategoryText = (categoryArr) => {
    if (!Array.isArray(categoryArr)) return null;
    return categoryArr.join('/');
  };

  if ((!Array.isArray(productList) || !productList.length) && !loading) {
    // 展示空内容
    return <div className={styles['empty-content']}>暂无数据</div>;
  }

  const handelClickToProductDetail = (e, productItem) => {
    e.preventDefault();
    if (productItem.productId) {
      window.open(`${jumpHost}/market-home/detail/${productItem.productId}`);
    }
  };

  return (
    <div className={styles['product-item-wrap']}>
      <Spin spinning={loading}>
        <div className={styles['min-height-wrap']}>
          {productList.map((o) => {
            const { productName, introduction, trialFlag, productCategories, productId } = o;
            return (
              <div className={styles.item} key={productId}>
                <div className={styles['item-right']}>
                  <h3>
                    <span>{productName}</span>
                    {trialFlag ? (
                      <span>
                        <img style={{ margin: '0 2px 0 9px' }} src={FreeIcon} alt="" />
                        <span style={{ fontSize: '12px', color: '#77CF37' }}>免费试用</span>
                      </span>
                    ) : null}
                    <a onClick={(e) => handelClickToProductDetail(e, o)}>
                      了解详情 &nbsp;
                      <Icon type="arrow-right" />
                    </a>
                  </h3>
                  <p className={styles['sub-title']}>{getCategoryText(productCategories)}</p>
                  <p className={styles['right-desc']}>{introduction}</p>
                  {/* {Array.isArray(labels) && (
                    <div className={styles['product-tag']}>
                      {labels.map(oo => (<span key={oo}>{oo}</span>))}
                    </div>
                  )} */}
                </div>
              </div>
            );
          })}
        </div>
      </Spin>
    </div>
  );
}
