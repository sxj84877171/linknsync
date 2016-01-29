// LinkitPClient.h : main header file for the PROJECT_NAME application
//

#pragma once

#ifndef __AFXWIN_H__
	#error "include 'stdafx.h' before including this file for PCH"
#endif

#include "resource.h"		// main symbols

#define MAIN_PAGE_URL _T("http://115.29.178.5/linkit.html")
#define MSG_POP_URL _T("http://115.29.178.5/notice_message.html")
#define NOTIFICATION_POP_URL _T("http://115.29.178.5/notice_notification.html")
#define CONFIG_FILE_FOLDER _T("Lenovo\\LINKit\\abc")
#define CONFIG_FILE_NAME _T("Conf.ini")

//_T("http://114.215.236.240/linkit.html")
//_T("http://10.176.33.32/test3.htm")



// CLinkitPClientApp:
// See LinkitPClient.cpp for the implementation of this class
//

class CLinkitPClientApp : public CWinApp
{
public:
	CLinkitPClientApp();

// Overrides
	public:
	virtual BOOL InitInstance();

	HRESULT CallJSFunction(IHTMLDocument2 * pDoc, CString &strFunc, CString &strParam);
	HRESULT CallJSFunction(IHTMLDocument2* pDoc2, CString strFunctionName, DISPPARAMS dispParams, VARIANT* varResult, EXCEPINFO* exceptInfo, UINT* nArgErr );
// Implementation

	DECLARE_MESSAGE_MAP()
};

extern CLinkitPClientApp theApp;