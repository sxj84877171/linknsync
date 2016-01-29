// LinkitPClient.cpp : Defines the class behaviors for the application.
//

#include "stdafx.h"
#include "LinkitPClient.h"
#include "LinkitPClientDlg.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// CLinkitPClientApp

BEGIN_MESSAGE_MAP(CLinkitPClientApp, CWinApp)
	ON_COMMAND(ID_HELP, &CWinApp::OnHelp)
END_MESSAGE_MAP()


// CLinkitPClientApp construction

CLinkitPClientApp::CLinkitPClientApp()
{
	// TODO: add construction code here,
	// Place all significant initialization in InitInstance
}


// The one and only CLinkitPClientApp object

CLinkitPClientApp theApp;


// CLinkitPClientApp initialization

BOOL CLinkitPClientApp::InitInstance()
{

	// InitCommonControlsEx() is required on Windows XP if an application
	// manifest specifies use of ComCtl32.dll version 6 or later to enable
	// visual styles.  Otherwise, any window creation will fail.
	INITCOMMONCONTROLSEX InitCtrls;
	InitCtrls.dwSize = sizeof(InitCtrls);
	// Set this to include all the common control classes you want to use
	// in your application.
	InitCtrls.dwICC = ICC_WIN95_CLASSES;
	InitCommonControlsEx(&InitCtrls);

	SetProcessDPIAware();

	HANDLE hInstanceMutex = CreateMutex(NULL, false, L"LINKit");

	if (GetLastError() == ERROR_ALREADY_EXISTS)
	{
		CloseHandle(hInstanceMutex);
		HWND hWnd;
		hWnd = FindWindow(_T("#32770"), _T("LINKit") );
		if (hWnd == NULL)
			hWnd = FindWindow(_T("#32770"), _T("LINKit"));

		if (hWnd != NULL)
		{
			ShowWindow(hWnd,SW_RESTORE);
			::SetForegroundWindow(hWnd);
			return false;
		} // end if
		return false;
	}


	CWinApp::InitInstance();

	AfxEnableControlContainer();

	// Standard initialization
	// If you are not using these features and wish to reduce the size
	// of your final executable, you should remove from the following
	// the specific initialization routines you do not need
	// Change the registry key under which our settings are stored
	// TODO: You should modify this string to be something appropriate
	// such as the name of your company or organization
	SetRegistryKey(_T("Local AppWizard-Generated Applications"));

	CLinkitPClientDlg dlg;
	m_pMainWnd = &dlg;
	INT_PTR nResponse = dlg.DoModal();
	if (nResponse == IDOK)
	{
		// TODO: Place code here to handle when the dialog is
		//  dismissed with OK
	}
	else if (nResponse == IDCANCEL)
	{
		// TODO: Place code here to handle when the dialog is
		//  dismissed with Cancel
	}

	// Since the dialog has been closed, return FALSE so that we exit the
	//  application, rather than start the application's message pump.


	return FALSE;


}

HRESULT CLinkitPClientApp::CallJSFunction(IHTMLDocument2 * pDoc, CString &strFunc, CString &strParam)
{
	IHTMLDocument2 * pDoc2 = pDoc;
	HRESULT hResult = -1;
	ASSERT(pDoc2);
	DISPPARAMS dispparams;
	memset(&dispparams, 0 ,sizeof(dispparams));

	dispparams.cArgs = 0;

	if(strParam.GetLength() > 0)
	{
		dispparams.cArgs = 1;
		dispparams.rgvarg = new VARIANT[dispparams.cArgs];

		CComBSTR bstr = strParam;
		bstr.CopyTo(&dispparams.rgvarg[0].bstrVal);
		dispparams.rgvarg[0].vt = VT_BSTR;
		dispparams.cNamedArgs = 0;
	}


	VARIANT varResult;

	//GetDHtmlDocument(&pDoc2);

	if(pDoc2)
	{
		hResult = CallJSFunction( pDoc2, strFunc, dispparams, &varResult, NULL, NULL );
		//pDoc2->Release();
		
	}

	return hResult;
}

HRESULT CLinkitPClientApp::CallJSFunction(IHTMLDocument2* pDoc2, CString strFunctionName, DISPPARAMS dispParams, VARIANT* varResult, EXCEPINFO* exceptInfo, UINT* nArgErr )
{
	IDispatch *pDispScript = NULL;
	HRESULT hResult;
	hResult = pDoc2->get_Script(&pDispScript);
	if(FAILED(hResult)) { return S_FALSE; }
	DISPID dispid;
	CComBSTR objbstrValue = strFunctionName;
	BSTR bstrValue = objbstrValue.Copy();
	OLECHAR *pszFunct = bstrValue ;
	hResult = pDispScript->GetIDsOfNames(IID_NULL, &pszFunct,1, LOCALE_SYSTEM_DEFAULT, &dispid);
	if (S_OK != hResult)
	{ pDispScript->Release();
	return hResult; }
	varResult->vt = VT_VARIANT;
	hResult = pDispScript->Invoke(dispid, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &dispParams, varResult, exceptInfo, nArgErr);
	pDispScript->Release();
	return hResult;
}
