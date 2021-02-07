import React, { useState } from 'react';
import { Link } from 'dva/router';
import { getResponse } from 'utils/utils';
import { Modal, Table, Icon, Dropdown, Menu } from 'hzero-ui';
import { queryServiceVersionList } from '../../services';

export default function VersionModal({ serviceData = {}, handleCancel = () => {} }) {
  const [loading, setLoading] = useState({});
  const [showMenu, setShowMenu] = useState({});
  const [versionList, setVersionList] = useState([]);

  const handleClickCompare = (record) => {
    document.body.onclick = () => setShowMenu({});
    setLoading(record);
    const { groupId, artifactId } = record;
    queryServiceVersionList({ groupId, artifactId }).then((res) => {
      setLoading({});
      if (getResponse(res)) {
        setVersionList(res); // 把查询回来的版本回写到页面中
        setShowMenu(record);
      }
    });
  };

  // 渲染菜单每一项
  const renderMenuItem = () => {
    if (!Array.isArray(versionList) || !versionList.length) {
      return <Menu.Item>暂无内容</Menu.Item>;
    }

    return versionList.map((versionItem) => {
      return (
        <Menu.Item>
          <Link
            to={`/market-client/compare/${serviceData.serviceId}/${versionItem.version}__${versionItem.artifactId}`}
          >
            <div style={{ width: '100px' }}>{versionItem.version}</div>
          </Link>
        </Menu.Item>
      );
    });
  };

  const columns = [
    {
      title: 'GroupId',
      dataIndex: 'groupId',
    },
    {
      title: 'ArtifactId',
      dataIndex: 'artifactId',
    },
    {
      title: '当前版本',
      dataIndex: 'version',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      width: 80,
      align: 'center',
      render: (text, record) => {
        const { groupId, artifactId } = record;
        return (
          <Dropdown
            trigger="click"
            visible={groupId === showMenu.groupId && artifactId === showMenu.artifactId}
            overlay={<Menu>{renderMenuItem()}</Menu>}
            onClick={() => handleClickCompare(record)}
          >
            {groupId === loading.groupId && artifactId === loading.artifactId ? (
              <Icon type="loading" />
            ) : (
              <a>对比</a>
            )}
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Modal
      title="对比版本选择"
      width={807}
      onCancel={() => {
        document.body.onclick = null;
        if (handleCancel) handleCancel();
      }}
      visible={!!(serviceData && Object.keys(serviceData).length)}
      footer={null}
    >
      <Table bordered rowKey="groupId" dataSource={serviceData?.servers} columns={columns} />
    </Modal>
  );
}
