import React, { useState, useRef } from 'react';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PageContainer } from '@ant-design/pro-layout';
import { Input, Button, Form,Transfer ,message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'umi';
import ProForm, { DrawerForm,  ProFormText } from '@ant-design/pro-form';
import { RecordType } from './data'
import { getApps  } from '../../applications/apps/apps_service';
import { createProjectItem } from './data'
import { createProject,getProjectList } from './service'



const Projects: React.FC = () => {

    const [formVisible, formVisibleHandler] = useState<boolean>(false)
    const [appForm] = Form.useForm()
    const [modelAppListData, setModelAppListData] = useState<RecordType[]>([]);
    const [targetKeys, setTargetKeys] = useState<number[]>([]);

    const filterOption = (inputValue: string, option: RecordType) => option.title.indexOf(inputValue) > -1;

    const handleChange = (newTargetKeys: number[]) => {
        setTargetKeys(newTargetKeys);
    };

    const getAppList = () => {
        const tempTargetKeys = [];
        return new Promise<boolean>(x=> {
            getApps({current:1,pageSize:100},{},{}).then((res)=>{
                let coll:any[] = res.data
                const appDataList = coll.flatMap((v)=>{
                   return {
                        key: v.id,
                        title:  v.name,
                        description: v.remarks,
                        chosen: false,
                      }
                })
                setModelAppListData(appDataList);
                setTargetKeys([])
                console.log(res)
                x(true)
            })
        })
      };


    const columns: ProColumns[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 48,
            hideInForm: true,
            hideInSearch: true
        },
        {
            title: '项目名称',
            dataIndex: 'name',
            copyable: true,
            render: (dom, row) => {
                return <Link key={'linkapp' + row.id} style={{ color: 'blue', textDecorationLine: 'underline' }} to={'/devops/projects/info?id=' + row.id + '&name=' + row.name}>{dom}</Link>
            }
        },
        {
            title: '应用数',
            dataIndex: 'appCount',
            hideInSearch: true
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            valueType: 'dateTime',
            hideInSearch: true
        },
        {
            title: '操作',
            valueType: 'option',
            render: (text, record, _, action) => [
                <Link key={"link-id" + record.id} to={'/devops/projects/info?id=' + record.id + '&name=' + record.name}>配置</Link>,
                <a key={"edit" + record.id} onClick={ async () => { 
                    const jsAppList = JSON.parse( '['+ record.appList + ']')
                    await getAppList()
                    setTargetKeys(jsAppList)
                    appForm.setFieldsValue({
                        id: record.id,
                        name: record.name
                    })
                    formVisibleHandler(true)
                }}>编辑</a>,
            ]
        }
    ]


    return (
       <PageContainer>
            <ProTable columns={columns} rowKey="id" headerTitle="项目列表"
                request={async (params, sort) => {
                    params.pageIndex = params.current
                    const data = await getProjectList(params)
                    return data.data
                }}
                toolBarRender={() => [
                    <Button key='button' icon={<PlusOutlined />} type="primary"
                        onClick={async () => {
                            appForm.resetFields()
                            await getAppList()
                            formVisibleHandler(true)
                        }}>创建项目</Button>
                ]}
            ></ProTable>
           <DrawerForm form={appForm} title="项目编辑" visible={formVisible} onVisibleChange={formVisibleHandler} drawerProps={{ forceRender: true, destroyOnClose: true, }}
                onFinish={async (data) => {
                    console.log({
                        name: data.name,
                        appIdList: targetKeys
                    })

                    const res = await createProject({
                        name: data.name,
                        appIdList: targetKeys
                    })
                    if (res.success) {
                        message.success({ content: '项目创建成功!', key:"createProject",duration: 3 });
                    }

                    //setTargetKeys([""])
                    return true
                }} >
                <ProFormText width="md" name="id" label="id" readonly={true} hidden={true} />
                <ProForm.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名' }]} >
                    <Input placeholder="请输入项目名称(仅限英文)" />
                </ProForm.Item>
                <ProForm.Item label="应用列表"  rules={[{ required: true, message: '请选择应用' }]} >
                    <Transfer dataSource={modelAppListData} showSearch  listStyle={{ width: 360, height: 700, }} 
                        filterOption={filterOption} targetKeys={targetKeys} onChange={handleChange} render={item => item.title}
                    />
                </ProForm.Item>
            </DrawerForm>
       </PageContainer>
     
    )
}

export default Projects;