import { request } from 'umi';
import { TableListItem,MenuListItem } from './data';
import { ApiResponse } from '../../../services/public/service'

export async function roleQuery(
    params: {
      /** 当前的页码 */
      pageIndex?: number;
      current?: number;
      /** 页面的容量 */
      pageSize?: number;
    }, options?: { [key: string]: any } ) {
    params.pageIndex = params.current
    params.current = undefined
    var requestData =  await request<{
        data: {
            data: TableListItem[];
            total?: number;
        }; 
        message?: string;
        success?: boolean; }>('/v1/tenantrole/tenantrolelist', {
            method: 'GET',
            params: {
                ...params,
            },
            ...(options || {}),
        });
    let retData :{
            data:  TableListItem[];
            /** 列表的内容总数 */
            total?: number;
            success?: boolean;
        } = { 
            data: requestData.data.data,
            success : requestData.success,
            total : requestData.data.total
        }
    
        //return query(params,options)
        return new Promise<any>(resolve => {
            resolve(retData)
        })
  }
  
export const queryMenuList = async (
    params: {
      tenantId?: number;
      pageIndex?: number;
      current?: number;
      pageSize?: number;
    },
    sort: Record<string, any>,
    options?: { [key: string]: any },) => {

    const msg = await request<ApiResponse<MenuListItem[]>>('/v1/sysmenu/usermenutree',  { method: 'GET', });
    return {
        data: msg.data,
        success: msg.success,
        total: 0
    }
}



