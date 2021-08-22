import { Guid } from "guid-typescript";
import { IMenuOpInst } from "../menu-entities/IMenu";

export const menuList: IMenuOpInst[] = [
  {
    id: "13245",
    name: "主页",
    path: "/home",
    component: "pages/home/home",
    tabs: [],
    buttonClick: "",
    buttons: [],
    parentId: "000",
    icon: "",
    parentNumber: "",
    eName: "",
    microName: "",
    componentName: "home",
    isShow: true,
    menuEnum: 0,
    children: [],
  },
  {
    id: "132445765",
    name: "任务配置",
    path: "/etltaskconf",
    component: "",
    tabs: [],
    buttonClick: "",
    buttons: [],
    parentId: "000",
    icon: "",
    parentNumber: "",
    eName: "",
    microName: "",
    componentName: "test-page",
    isShow: true,
    menuEnum: 0,
    children: [{
      id: Guid.create().toString(),
      name: "连接管理",
      path: "/etl-dbconnection",
      component: "pages/etlconfigure-page/dbconnection-page/dbconnection-page",
      tabs: [],
      buttonClick: "",
      buttons: [],
      parentId: "000",
      icon: "",
      parentNumber: "",
      eName: "",
      microName: "",
      componentName: "dbconnection-page",
      isShow: true,
      menuEnum: 0,
      children: [],
    },
    {
      id: Guid.create().toString(),
      name: "任务管理",
      path: "/etl-task",
      component: "pages/etlconfigure-page/task-page/task-page",
      tabs: [],
      buttonClick: "",
      buttons: [],
      parentId: "000",
      icon: "",
      parentNumber: "",
      eName: "",
      microName: "",
      componentName: "task-page",
      isShow: true,
      menuEnum: 0,
      children: [],
    },
    {
      id: Guid.create().toString(),
      name: "任务流程",
      path: "/etlflow-design",
      component: "pages/etlflow-design/etlflow-design",
      tabs: [],
      buttonClick: "",
      buttons: [],
      parentId: "000",
      icon: "",
      parentNumber: "",
      eName: "",
      microName: "",
      componentName: "task-page",
      isShow: true,
      menuEnum: 0,
      children: [],
    }],
  }
]