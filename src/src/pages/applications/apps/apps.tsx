import React, { useState, useRef } from 'react';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { ApplicationItem, ApplicationModel } from './apps_data';
import { PageContainer } from '@ant-design/pro-layout';
import ProForm, { DrawerForm, ProFormSelect, ProFormTextArea, ProFormText, ProFormGroup } from '@ant-design/pro-form';
import { Input, Button, Form, Checkbox, Radio, Select } from 'antd';
import { GithubOutlined, GitlabOutlined, GoogleOutlined, GooglePlusOutlined, PlusOutlined, SettingFilled } from '@ant-design/icons';
import { getAppLanguage, getAppLevel, createApp, getApps, updateApp, initGitRepoistry } from './apps_service';
import { Link } from 'umi';
import { queryRepoConnections } from '@/pages/resources/serviceConnection/service';
const { Search } = Input;
const Apps: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [formVisible, formVisibleHandler] = useState<boolean>(false)
    const [appForm] = Form.useForm()
    const [edit, editHandler] = useState<boolean>(false)
    const [gitRepo, gieRepoHandler] = useState<string>("");
    const [appName, appNamehandler] = useState<string>("");
    const [repoOptions, repoOptionsHandler] = useState<any>([{label:'公开',value:0}]);
    const columns: ProColumns<ApplicationItem>[] = [
        {
            title: 'id',
            dataIndex: 'id',
            width: 48,
            hideInForm: true,
            hideInSearch: true
        },
        {
            title: '应用名称',
            dataIndex: 'name',
            copyable: true,
            render: (dom, row) => {
                return <Link key={'linkapp' + row.id} style={{ color: 'blue', textDecorationLine: 'underline' }} to={'/applications/info?id=' + row.id + '&name=' + row.name}>{dom}</Link>
            }
        },
        {
            title: '租户id',
            dataIndex: 'tenantId',
            hideInTable: true,
            hideInForm: true,
            hideInSearch: true
        },
        {
            title: "标签",
            dataIndex: 'labels',
        }, {
            title: "Git地址",
            dataIndex: 'git',
            hideInSearch: true,
            render: (dom, row) => {
                return <a key={'gitlink' + row.id} href={row.git} target="_blank">{dom}</a>
            }
        }, {
            title: '级别',
            dataIndex: 'level',
            hideInTable: true,
            valueType: 'select',
            request: getAppLevel
        }, {
            title: '级别',
            dataIndex: 'levelName',
            hideInSearch: true
        }, {
            title: '语言',
            dataIndex: 'languageName',
            hideInSearch: true
        },
        {
            title: "备注",
            dataIndex: 'remarks',
            hideInSearch: true

        }, {
            title: '状态',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
                '0': { text: '停用' },
                '1': { text: '启用' }
            }
        }, {
            title: '操作',
            valueType: 'option',
            render: (text, record, _, action) => [
                <Link key={"link-id" + record.id} to={'/applications/info?id=' + record.id + '&name=' + record.name}>进入应用</Link>,
                <a key={"edit" + record.id} onClick={() => {
                    formVisibleHandler(true)
                    editHandler(true)
                    record.sources = record.sCID
                    appForm.setFieldsValue(record)
                    console.log(record)
                    bindRepo(record.sourceType,record)
                }}>编辑</a>,
            ]
        }
    ]
    function bindRepo(repoType: string,selectedRecord:any) {
        let res = queryRepoConnections(repoType)
        res.then(x => {    
            console.log(x)
            repoOptionsHandler(x)
            if (selectedRecord){
                console.log(selectedRecord)
                appForm.setFieldsValue({ sources:selectedRecord.sCID }) 
            }           
        })
    }


    return (
        <PageContainer >
            <ProTable<ApplicationItem>
                columns={columns}
                rowKey="id"
                actionRef={actionRef}
                headerTitle="应用列表"
                toolBarRender={() => [
                    <Button key='button' icon={<PlusOutlined />} type="primary"
                        onClick={() => {
                            appForm.resetFields()
                            formVisibleHandler(true);
                            editHandler(false)
                            appForm.setFieldsValue({ status: 1 })
                        }}>创建应用</Button>
                ]}
                request={getApps}
            ></ProTable>
            <DrawerForm<ApplicationModel>
                form={appForm}
                title="创建应用"
                visible={formVisible}
                onVisibleChange={formVisibleHandler}
                onFinish={async (x) => {
                    console.log(x)

                    let res
                    if (edit) {
                        res = await updateApp(x)
                    } else {
                        res = await createApp(x)
                    }

                    if (res.success) {
                        actionRef.current?.reload()
                    }
                    appForm.resetFields()
                    return res.success
                }}
                drawerProps={{
                    forceRender: true,
                    destroyOnClose: true,
                }}
            >

                <ProFormText width="md" name="id" label="id" readonly={true} hidden={true} />
                <ProForm.Item name="name" label="应用名称" rules={[{ required: true, message: '请输入应用名' }]} >
                    <Input placeholder="请输入应用名称(仅限英文)" onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^\w_-]/g, ''); appNamehandler(e.currentTarget.value) }} disabled={edit} />
                </ProForm.Item>
                <ProForm.Item name="labels" label="应用标签">
                    <Input placeholder="" />
                </ProForm.Item>
                <ProForm.Item name="sourceType" label="选择代码源类型" rules={[{ required: true, message: '请选择代码源类型' }]} >
                    <Radio.Group onChange={(x) => { bindRepo(x.target.value,null) }}>
                        <Radio value="github"><GithubOutlined style={{ fontSize: '25px' }} />Github</Radio>
                        <Radio value="gitee"><GooglePlusOutlined style={{ fontSize: '25px' }} />Gitee</Radio>
                        <Radio value="gitlab"><GitlabOutlined style={{ fontSize: '25px' }} />Gitlab</Radio>
                        <Radio value="gogs"><SettingFilled style={{ fontSize: '25px' }} />Gogs</Radio>
                    </Radio.Group>
                </ProForm.Item>
                <ProForm.Item name="sources" label="代码源" initialValue={0} rules={[{ required: true, message: '请选择代码源' }]}>
                    <Select options={repoOptions} ></Select>
                </ProForm.Item>
                <ProFormText name="git" label="git地址" rules={[{ required: true, message: '请输入git地址' }]}>
                </ProFormText>
                <ProForm.Item name='level' label="应用等级" rules={[{ required: true, message: '请选择应用级别!' }]}>
                    <ProFormSelect initialValue={0}
                        request={getAppLevel}
                    ></ProFormSelect>
                </ProForm.Item>
                <ProForm.Item name='language' label="开发语言" rules={[{ required: true, message: '请选择开发语言!' }]}>
                    <ProFormSelect request={getAppLanguage} ></ProFormSelect>
                </ProForm.Item>
                <ProForm.Item name='remark' label='备注'>
                    <ProFormTextArea></ProFormTextArea>
                </ProForm.Item>
                <ProForm.Item name='status' label="状态" >
                    <ProFormSelect initialValue={1}
                        request={async () => [
                            { label: '启用', value: 1 },
                            { label: '停用', value: 0 }
                        ]}
                    ></ProFormSelect>
                </ProForm.Item>
            </DrawerForm>
        </PageContainer>
    )
}

export default Apps