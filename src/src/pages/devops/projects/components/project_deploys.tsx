import React, { useState, useRef,useEffect } from 'react';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { Link } from 'umi';
import {  Tag, Typography,Badge } from 'antd';
import {  LoadingOutlined } from '@ant-design/icons';
import { DeploymentItem } from '../../../applications/info/data'
import {  getDeploymentList, getPodList ,GetProjectDeployLevelCounts} from '../../../applications/info/deployment.service'
const { Paragraph } = Typography;

export type ProjectDeployProps = {
    projectId : number;
};


const ProjectDeployList: React.FC<ProjectDeployProps> = ( props ) => {
    const [onLoaded,_] = useState<boolean>()
    const columns: ProColumns<DeploymentItem>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 48,
            hideInForm: true,
            hideInSearch: true
        },
        {
            title:'可用集群',
            dataIndex:'clusterId',
            hideInTable:true,
            hideInSearch: true
        },
        {
            title: '环境名称',
            width: 320,
            dataIndex: 'nickname',
            render: (_, row) => {
                return <span>
                    <Paragraph><Link to={{ pathname:'/resources/pods' ,  search: '?did='+ row.id + '&app=' + row.name + '&cid=' + row.clusterId + '&ns=' + row.namespace ,  state:row } }  >{row.name}</Link></Paragraph>
                    <Paragraph>{row.nickname}</Paragraph>
                </span>
            }
        },
        {
            title: '环境级别',
            dataIndex: 'level',
            hideInSearch: true,
            width: 140,
            valueEnum:{
                '测试环境': { text: '测试环境', status: 'Warning' },
                '开发环境': { text: '开发环境', status: 'Processing' },
                '预发布环境': { text: '预发布环境', status: 'Default' },
                '生产环境': { text: '生产环境', status: 'Success' },

            }
        },
        {
            title: '集群',
            dataIndex: 'clusterName',
            width: 180,
            hideInForm: true,
            hideInSearch: true
        },
        {
            title: '命名空间',
            dataIndex: 'namespace',
            width: 180,
            hideInForm: true,
            hideInSearch: true
        },
        {
            title: '部署状态',
            dataIndex: 'status',
            width: 110,
            hideInForm: true,
            hideInSearch: true,
            render: (_, row) => {
                return <span>  {row.running > 0 ? <Tag color='blue'>已部署</Tag> : <Tag color='red'>未部署</Tag>} </span>
            }
        },
        {
            title: '镜像(last)',
            dataIndex: 'lastImage',
            width: 330,
            hideInForm: true,
            hideInSearch: true,
            render: (_, row) => {
                return <span>  {row.lastImage != '' ? row.lastImage : <LoadingOutlined />} </span>
            }
        },
        {
            title: '实例数',
            dataIndex: 'runningNumber',
            width: 80,
            hideInForm: true,
            hideInSearch: true,
            render: (_, row) => {
                return <span>  {row.running > -1 ? row.running : <LoadingOutlined />}   / {row.expected}</span>
            }
        },
        {
            title: '服务名/IP',
            dataIndex: 'serviceIP',
            width: 380,
            hideInForm: true,
            hideInSearch: true,
            render: (dom, row) => {
                return (<span>
                    {row.serviceIP != '0.0.0.0' ? <span>
                        <Paragraph copyable>{row.serviceName}</Paragraph>
                        <Paragraph copyable>{row.serviceIP} </Paragraph>
                    </span> : <span><LoadingOutlined /> / {dom}</span>}
                </span>)
            }
        },]

    useEffect(()=>{
        GetProjectDeployLevelCounts(props.projectId).then(res=>{
            var allCount = 0
            res.data.forEach(val=> allCount += val.count)
            const data = [{label:'全部',value:'all',count:allCount}].concat(res.data)
            levelTabsHandler(data)
        })
    },[onLoaded])

    const actionRef = useRef<ActionType>();
    const [tableListDataSource, setTableListDataSource] = useState<DeploymentItem[]>([]);
    const [activeKey, setActiveKey] = useState<string>('all');
    const [levelTabs,levelTabsHandler] = useState<{label:string,value:string,count:number}[]>()
    const renderBadge = (count: number, active = false) =>   {
        return (<Badge count={count} showZero={true} 
            style={{ marginTop: -2, marginLeft: 4, color: active ? '#1890FF' : '#722ed1',
            backgroundColor: active ? '#722ed1' : '#eee',}} />) }

    return (
        <ProTable  columns={columns} rowKey="id" dataSource={tableListDataSource} actionRef={actionRef}  cardProps={{  bordered: true }} toolbar={{ style:{ fontSize: 14 },
            menu:{ type:'tab', activeKey: activeKey,
                items: levelTabs?.map((v):{key:string,label:React.ReactNode}  =>{ 
                        return ( { key:v.value,label: (<span>{v.label}{renderBadge(v.count,activeKey==v.label)}</span>) } )
                }),
                onChange:(key) => { 
                    setActiveKey(key as string)
                    actionRef.current?.reload()
                }
            }
        }}
        request={async (params, sort) => {
            params.projectId = props.projectId
            params.appid = 1
            if (activeKey == 'all') {
                params.profile = ''
            } else {
                params.profile = activeKey
            }
            var datasource = await getDeploymentList(params)
            
            if (!datasource.data) {
                setTableListDataSource([])
                return []
            }

            var asyncAll = []
            for (var index = 0; index < datasource.data.length; index++) {
                var item = datasource.data[index]
                asyncAll.push(getPodList(item.name, item.clusterId, index))
            }
            Promise.all(asyncAll).then(asyncPodList => {
                const list = [...datasource.data]
                console.log(asyncPodList)
                asyncPodList.forEach((podSet) => {
                    if (podSet.data && podSet.data.length > 0) {
                        list[podSet.index].lastImage = podSet.data[0].containers[0].image
                        list[podSet.index].running = podSet.data.length
                        list[podSet.index].serviceIP = podSet.data[0].ip
                    } else {
                        list[podSet.index].lastImage = '无'
                        list[podSet.index].running = 0
                        list[podSet.index].serviceName ='no services'
                        list[podSet.index].serviceIP = 'x.x.x.x'
                    }
                })
                setTimeout(() => {
                    setTableListDataSource(list)
                }, 200)
            })
            console.log(datasource)
            setTableListDataSource(datasource.data)
            return datasource
        }}
    ></ProTable>
    )
}


export default ProjectDeployList
