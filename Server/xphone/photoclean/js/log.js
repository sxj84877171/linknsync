var arrLog = null;
var ARRLOG_CN = [
	{
		date: "2015年12月",
		data: 
		[
			{
			time: "12月22日",
			Android: "1.4.72",
			iOS: "1.3.1",
			window: "1.2.6",
			title: "OneDrive云端备份",
			data: [
				"● 支持备份照片到云端(OneDrive)",
				"● 优化清理照片时的选择和查看",
				""
				]
			}
		]
	},
	{
		date: "2015年10月",
		data: 
		[
			{
			time: "10月16日",
			Android: "1.4.28",
			iOS: "即将发布",
			window: "1.1.0.4",
			title: "新版UI，智能切换连接方式",
			data: [
				"● 增加多种连接方式，智能选择最佳传输方案",
				"● 全新2.0界面，清爽便捷",
				"● 已连接过的电脑分组显示",
				"● 添加分享和反馈功能"
				]
			}
		]
	},
	{
		date: "2015年09月",
		data: 
		[{
			time: "09月18日",
			Android: "2.0.1",
			iOS: "即将发布",
			window: "1.1.1.0",
			title: "照片大挪移安卓版发布",
			data: [
				"● 照片大挪移，快速腾出手机空间",
				"● 简洁界面，轻松使用",
				"● 可自由选择是否删除导出完成的照片",
				"● 快速发现、连接电脑"
				]
		}]
	}
],
ARRLOG_EN = [
	{
		date: "2015.12",
		data: 
		[
			{
			time: "12.22",
			Android: "1.4.72",
			iOS: "1.3.1",
			window: "1.2.6",
			title: "New user interface; automatic switch between connection mode",
			data: [
				"● Support for similar photos detection.",
				"● Optimize user experience.",
				""
				]
			}
		]
	},
	{
		date: "2015.10",
		data: 
		[
			{
			time: "10.16",
			Android: "1.4.28",
			iOS: "Coming soon",
			window: "1.1.0.4",
			title: "New user interface; automatic switch between connection mode",
			data: [
				"● Add multiple connection modes and automatically select the optimal mode for transfer.",
				"● User interface 2.0: concise and easy-to-use.",
				"● Display the previously connected PCs in group.",
				"● Add new functions for sharing and feedback."
				]
			}
		]
	}
];

function changeLog() {
	var language = navigator.browserLanguage ? navigator.browserLanguage : navigator.language;
	if (language.indexOf('zh') >= 0) {
		arrLog = ARRLOG_CN;
	} 
	else if(language.indexOf('zh') < 0){
		arrLog = ARRLOG_EN;
}
}

