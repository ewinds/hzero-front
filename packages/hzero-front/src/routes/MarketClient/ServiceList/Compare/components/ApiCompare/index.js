import React from 'react';
import styles from './index.less';

const SHOW_KEYS = {
  changedEndpoints: '变更接口',
  missingEndpoints: '弃用接口',
  newEndpoints: '新增接口',
};
const KEY_ADD = 'add';
const KEY_DELETE = 'delete';
const KEY_MODIFY = 'modify';

export default function ApiCompare({ compareResult = {} }) {
  const handleModifyValue = (data) => {
    const { leftParameter = {}, rightParameter = {} } = data;
    let resText = '';

    if (leftParameter.required !== rightParameter.required) {
      resText += `是否必输：${leftParameter.required} -> ${rightParameter.required} `;
    } else if (leftParameter.format !== rightParameter.format) {
      resText += `类型：${leftParameter.format} -> ${rightParameter.format} `;
    } else if (leftParameter.in !== rightParameter.in) {
      resText += `参数位置：${leftParameter.in} -> ${rightParameter.in} `;
    } else if (leftParameter.description !== rightParameter.description) {
      resText += `注释：${leftParameter.description} -> ${rightParameter.description} `;
    }

    return resText;
  };
  const renderDiffResultItemOne = (data) => {
    const { name, el, description, action, leftParameter = {} } = data;
    let icon;
    const nameText = name || el; // params props 返回值结构不同
    let newDescription = description;
    switch (action) {
      case KEY_ADD:
        icon = '新增字段:';
        break;
      case KEY_DELETE:
        icon = '删除字段:';
        break;
      case KEY_MODIFY:
        icon = `${leftParameter.name || ''} 字段修改:`;
        newDescription = handleModifyValue(data);
        break;
      default:
    }

    if (!newDescription && !nameText) return null;

    return (
      <div className={`${styles['diff-result-item']} ${styles[action]}`}>
        <span>{icon}</span>
        <span>{nameText}</span>
        <span>{newDescription}</span>
      </div>
    );
  };
  const renderDiffResultItem = (dataList, action) => {
    if (!Array.isArray(dataList) || !dataList.length) return null;
    return dataList.map((o) => renderDiffResultItemOne({ ...o, action }));
  };
  const renderDiffContent = (changedEndpointsItem) => {
    const {
      diffParam, // 是否有 diff 的结果
      diffProp,
      addParameters = [], // 增加的属性
      addProps = [],
      changedParameter = [], // 改变的属性
      changedProps = [],
      missingParameters = [], // 删除的属性
      missingProps = [],
    } = changedEndpointsItem;
    return (
      <div className={styles['diff-result']}>
        {diffParam ? <div className={styles['result-sub-title']}>参数：</div> : null}
        {renderDiffResultItem(addParameters, KEY_ADD)}
        {renderDiffResultItem(changedParameter, KEY_MODIFY)}
        {renderDiffResultItem(missingParameters, KEY_DELETE)}
        {diffProp ? <div className={styles['result-sub-title']}>返回值：</div> : null}
        {renderDiffResultItem(addProps, KEY_ADD)}
        {renderDiffResultItem(changedProps, KEY_MODIFY)}
        {renderDiffResultItem(missingProps, KEY_DELETE)}
      </div>
    );
  };
  const renderComparePathHeader = ({ method, pathUrl, summary }) => {
    return (
      <h3 className={styles['compare-path-header']}>
        <div className={styles[String(method).toLowerCase()]}>{method}</div>
        <div>{pathUrl}</div>
        <div>{summary}</div>
      </h3>
    );
  };
  const compareItemContent = (item) => {
    const { diff } = item;

    return (
      <div className={styles['compare-item']}>
        {renderComparePathHeader(item)}
        {diff ? renderDiffContent(item) : null}
      </div>
    );
  };
  const renderItemGroup = (key, title, listData = []) => {
    return (
      <div className={`${styles['compare-group']} ${styles[key]}`}>
        <h3>{title}</h3>
        {listData.map((o) => compareItemContent(o))}
      </div>
    );
  };

  return (
    <div className={styles['api-diff-result-wrap']}>
      {Object.keys(compareResult).map((key) => {
        if (!SHOW_KEYS[key]) return null;
        return renderItemGroup(key, SHOW_KEYS[key], compareResult[key]);
      })}
    </div>
  );
}
