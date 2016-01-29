// LinkitPClientDlg.cpp : implementation file
//

#include "stdafx.h"
#include "LinkitPClient.h"
#include "LinkitPClientDlg.h"
#include "MessageTip.h"
#include "NotificationTip.h"
#include <io.h>
#include "SettingDlg.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif



#define UM_ICONNOTIFY WM_USER+1
#define UM_INITHIDE WM_USER+2
void WINAPI WriteWebBrowserRegKey(LPCTSTR lpKey,DWORD dwValue)  
{  
	static bool bwriteFirstRun = 0;
	HKEY hk = NULL;  
	CString str = _T("Software\\Microsoft\\Internet Explorer\\Main\\FeatureControl\\");  
	str += lpKey;  
	if (RegCreateKey(HKEY_LOCAL_MACHINE,str,&hk)!=0)  
	{  
		//MessageBox(NULL,_T("´ò¿ª×¢²á±íÊ§°Ü!"),L"Error",0);  
		//ExitProcess(-1);
		return;
	}  

	if (RegSetValueEx(hk,L"LINKit.exe", NULL, REG_DWORD,(const byte*)&dwValue,4)!=0)  
	{  
		RegCloseKey(hk);  
		//MessageBox(NULL,L"Ð´×¢²á±íÊ§°Ü!",L"Error",0);  
		//ExitProcess(-1);  
		return;
	}  
	else
	{
		if(!bwriteFirstRun)
		{
			CString conf_file;
			conf_file.Format(_T("%S\\Lenovo"),getenv("APPDATA"));
			CreateDirectory(conf_file,0);
			conf_file.Append(_T("\\LINKit"));
			CreateDirectory(conf_file,0);
			conf_file.Append(_T("\\Conf.ini"));
			WritePrivateProfileString(L"Settings",L"firstrun", L"1", conf_file);
			bwriteFirstRun = 1;
		}

	}
	RegCloseKey(hk);  
}  

// CAboutDlg dialog used for App About

class CAboutDlg : public CDialog
{
public:
	CAboutDlg();

// Dialog Data
	enum { IDD = IDD_ABOUTBOX };

	protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support

// Implementation
protected:
	HICON m_hIcon;
	virtual BOOL OnInitDialog();
	DECLARE_MESSAGE_MAP()
};

CAboutDlg::CAboutDlg() : CDialog(CAboutDlg::IDD)
{
	m_hIcon = AfxGetApp()->LoadIcon(IDR_MAINFRAME);
}

void CAboutDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialog::DoDataExchange(pDX);
}

BOOL CAboutDlg::OnInitDialog()
{
	CDialog::OnInitDialog();
	SetIcon(m_hIcon,TRUE);
	SetIcon(m_hIcon,FALSE);
	return TRUE;
}

BEGIN_MESSAGE_MAP(CAboutDlg, CDialog)

END_MESSAGE_MAP()


// CLinkitPClientDlg dialog


BEGIN_DHTML_EVENT_MAP(CLinkitPClientDlg)
	DHTML_EVENT_ONCLICK(_T("ButtonOK"), OnButtonOK)
	DHTML_EVENT_ONCLICK(_T("ButtonCancel"), OnButtonCancel)
END_DHTML_EVENT_MAP()

BEGIN_DISPATCH_MAP(CLinkitPClientDlg, CDHtmlDialog) 
	DISP_FUNCTION(CLinkitPClientDlg, "getData",GetData,VT_BSTR,VTS_NONE) 
	DISP_FUNCTION(CLinkitPClientDlg,"testfun",TestFunction,VT_EMPTY,VTS_VARIANT VTS_VARIANT)
	DISP_FUNCTION(CLinkitPClientDlg,"msgHandle",OnMsgHandler,VT_EMPTY,VTS_VARIANT)
	DISP_FUNCTION(CLinkitPClientDlg,"notificationHandle",OnNotificationHandler,VT_EMPTY,VTS_VARIANT)
	
	DISP_FUNCTION(CLinkitPClientDlg, "PC",IsPCClient,VT_EMPTY,VTS_VARIANT)
END_DISPATCH_MAP()

CLinkitPClientDlg::CLinkitPClientDlg(CWnd* pParent /*=NULL*/)
	: CDHtmlDialog(CLinkitPClientDlg::IDD, CLinkitPClientDlg::IDH, pParent)
{
	m_hIcon = AfxGetApp()->LoadIcon(IDR_MAINFRAME);
	void *temp = NULL;

	 main_page_url = new TCHAR[256];
	msg_page_url = new TCHAR[256];
	noti_page_url = new TCHAR[256];
	_tcscpy_s(main_page_url,sizeof(MAIN_PAGE_URL)/sizeof(TCHAR), MAIN_PAGE_URL );
	_tcscpy_s(msg_page_url,sizeof(MSG_POP_URL)/sizeof(TCHAR), MSG_POP_URL );
	_tcscpy_s(noti_page_url,sizeof(NOTIFICATION_POP_URL)/sizeof(TCHAR), NOTIFICATION_POP_URL );

	m_ifAutoRun = FALSE;
	m_ifCloseToHide = FALSE;
	m_firstrun = FALSE;
	m_closeReminder = FALSE;
	m_ipdoc = NULL;
	Wow64EnableWow64FsRedirection(FALSE);
	WriteWebBrowserRegKey(L"FEATURE_BROWSER_EMULATION",10001);  
	WriteWebBrowserRegKey(L"FEATURE_ACTIVEX_REPURPOSEDETECTION",1);  
	WriteWebBrowserRegKey(L"FEATURE_BLOCK_LMZ_IMG",1);  
	WriteWebBrowserRegKey(L"FEATURE_BLOCK_LMZ_OBJECT",1);  
	WriteWebBrowserRegKey(L"FEATURE_BLOCK_LMZ_SCRIPT",1);  
	WriteWebBrowserRegKey(L"FEATURE_Cross_Domain_Redirect_Mitigation",1);  
	WriteWebBrowserRegKey(L"FEATURE_ENABLE_SCRIPT_PASTE_URLACTION_IF_PROMPT",1);  
	WriteWebBrowserRegKey(L"FEATURE_LOCALMACHINE_LOCKDOWN",1);  
	WriteWebBrowserRegKey(L"FEATURE_GPU_RENDERING",1);
	Wow64EnableWow64FsRedirection(TRUE);

	_curmt = NULL;
	_curnt = NULL;
	EnableAutomation();
}

void CLinkitPClientDlg::DoDataExchange(CDataExchange* pDX)
{
	CDHtmlDialog::DoDataExchange(pDX);
}

BEGIN_MESSAGE_MAP(CLinkitPClientDlg, CDHtmlDialog)
	ON_WM_SYSCOMMAND()
	//}}AFX_MSG_MAP
	ON_WM_TIMER()
	ON_WM_LBUTTONDOWN()
	ON_WM_NCHITTEST()
	ON_WM_UPDATEUISTATE()
	ON_MESSAGE(UM_INITHIDE,OnInitHide)
	ON_MESSAGE(UM_ICONNOTIFY,OnIconNotify)
	ON_WM_CLOSE()
	ON_COMMAND(ID_POPUP_SHOWWINDOW, &CLinkitPClientDlg::OnPopupShowWindow)
	ON_COMMAND(ID_POPUP_SETTINGS, &CLinkitPClientDlg::OnPopupSettings)
	ON_COMMAND(ID_POPUP_EXIT, &CLinkitPClientDlg::OnPopupExit)
	ON_COMMAND(ID_POPUP_ABOUT, &CLinkitPClientDlg::OnPopupAbout)
END_MESSAGE_MAP()


// CLinkitPClientDlg message handlers

BOOL CLinkitPClientDlg::OnInitDialog()
{
	CDHtmlDialog::OnInitDialog();
		
	// Add "About..." menu item to system menu.

	// IDM_ABOUTBOX must be in the system command range.
	ASSERT((IDM_ABOUTBOX & 0xFFF0) == IDM_ABOUTBOX);
	ASSERT(IDM_ABOUTBOX < 0xF000);

	CMenu* pSysMenu = GetSystemMenu(FALSE);
	if (pSysMenu != NULL)
	{
		CString strAboutMenu;
		strAboutMenu.LoadString(IDS_ABOUTBOX);
		if (!strAboutMenu.IsEmpty())
		{
			pSysMenu->AppendMenu(MF_SEPARATOR);
			pSysMenu->AppendMenu(MF_STRING, IDM_ABOUTBOX, strAboutMenu);
		}
	}

	// Set the icon for this dialog.  The framework does this automatically
	//  when the application's main window is not a dialog
	SetIcon(m_hIcon, TRUE);			// Set big icon
	SetIcon(m_hIcon, FALSE);		// Set small icon

	// TODO: Add extra initialization here

	if(!_tcsicmp(AfxGetApp()->m_lpCmdLine,_T("/min")))
	{
		PostMessage(UM_INITHIDE);
	}


	//HDPI 
// 	int _dpiX, _dpiY;
// 	HDC hdc = ::GetDC(NULL);
// 	if (hdc)
// 	{
// 		_dpiX = GetDeviceCaps(hdc, LOGPIXELSX);
// 		_dpiY = GetDeviceCaps(hdc, LOGPIXELSY);
// 		::ReleaseDC(NULL, hdc);
// 	}
// 
// 	int scalex = MulDiv(1074, _dpiX, 96); 
// 	int scaley = MulDiv(600, _dpiY, 96); 

	//HDPI

	CRect clientrect;
	GetClientRect(&clientrect);
	CRect windowrect;
	GetWindowRect(&windowrect);
	int width=1074+windowrect.Width()-clientrect.Width();
	int height=600+windowrect.Height()-clientrect.Height();


// 	char abc[256] = {0};
// 	sprintf(abc,"org_width:%d, org_height:%d, hdpi_width:%d, hdpi_height:%d",1074,600,scalex,scaley);
// 	MessageBoxA(0,abc,abc,0);

	SetWindowPos(NULL,0,0,width,height,SWP_NOMOVE);
	CenterWindow();
	SetHostFlags(DOCHOSTUIFLAG_NO3DBORDER | DOCHOSTUIFLAG_SCROLL_NO);

	//create profile
	if(0!=Config())
	{
		exit(-1);
	}
	//
	Navigate(this->main_page_url);

	InitializeCriticalSection(&cs);
	//SetTimer(1,500,NULL);
//	SetTimer(2,500,NULL);
	//SetTimer(3,2000,NULL);
	SetExternalDispatch(GetIDispatch(TRUE));

	_cmt = new CMessageTip(this);
	_cmt->SetParent(this);
	_cmt->Create(IDD_DIALOG1,GetDesktopWindow());
	
	_cnt = new CNotificationTip(this);
	_cnt->SetParent(this);
	_cnt->Create(IDD_NOTIFICATIONTIP,GetDesktopWindow());
	
	NOTIFYICONDATA   nid;     
	nid.cbSize   =   sizeof(nid);     
	nid.hWnd   =   m_hWnd;       
	nid.uID   =  IDR_MAINFRAME;       
	nid.uFlags   =   NIF_MESSAGE   |   NIF_ICON   |   NIF_TIP;     
	nid.uCallbackMessage   =   UM_ICONNOTIFY;     
	nid.hIcon   = m_hIcon;
	CString   str   =   CString("LINKit");     
	lstrcpyn(nid.szTip,   (LPCWSTR)str,       
		sizeof(nid.szTip)   /   sizeof(nid.szTip[0]));     
	Shell_NotifyIcon(NIM_ADD,   &nid);
	Shell_NotifyIcon(NIM_MODIFY,&nid);

	 ShowWindow(SW_HIDE);


	return TRUE;  // return TRUE  unless you set the focus to a control
}

void CLinkitPClientDlg::OnSysCommand(UINT nID, LPARAM lParam)
{
	if ((nID & 0xFFF0) == IDM_ABOUTBOX)
	{
		CAboutDlg dlgAbout;
		dlgAbout.DoModal();
	}
	else
	{
		CDHtmlDialog::OnSysCommand(nID, lParam);
	}
}

// If you add a minimize button to your dialog, you will need the code below
//  to draw the icon.  For MFC applications using the document/view model,
//  this is automatically done for you by the framework.

void CLinkitPClientDlg::OnPaint()
{
	if (IsIconic())
	{
		CPaintDC dc(this); // device context for painting

		SendMessage(WM_ICONERASEBKGND, reinterpret_cast<WPARAM>(dc.GetSafeHdc()), 0);

		// Center icon in client rectangle
		int cxIcon = GetSystemMetrics(SM_CXICON);
		int cyIcon = GetSystemMetrics(SM_CYICON);
		CRect rect;
		GetClientRect(&rect);
		int x = (rect.Width() - cxIcon + 1) / 2;
		int y = (rect.Height() - cyIcon + 1) / 2;

		// Draw the icon
		dc.DrawIcon(x, y, m_hIcon);
	}
	else
	{
		CDHtmlDialog::OnPaint();
	}
}

// The system calls this function to obtain the cursor to display while the user drags
//  the minimized window.
HCURSOR CLinkitPClientDlg::OnQueryDragIcon()
{
	return static_cast<HCURSOR>(m_hIcon);
}

HRESULT CLinkitPClientDlg::OnButtonOK(IHTMLElement* /*pElement*/)
{
//	MessageBox(_T("eheheheh"));
	//OnOK();
	_cmt = new CMessageTip;
	_cmt->Create(IDD_DIALOG1,this);

	_msgList.push_back(_cmt);


	//_cmt->ShowWindow(SW_SHOW);

	return S_OK;
}

HRESULT CLinkitPClientDlg::OnButtonCancel(IHTMLElement* /*pElement*/)
{
	//this->Navigate(_T("http://114.215.236.240/linkit.html"));
//	this->Navigate(_T("http://127.0.0.1/linkit.html"));
	//OnCancel();
	return S_OK;
}




LPCTSTR  CLinkitPClientDlg::GetData()
{
	TCHAR Content[1024]= _T("hello world!");
	return Content;
}

LPCSTR CLinkitPClientDlg::TestFunction(VARIANT& vStr1,VARIANT& vStr2)
{
	CComVariant varStr1(vStr1),varStr2(vStr2);
	varStr1.ChangeType(VT_BSTR);
	varStr2.ChangeType(VT_BSTR);
	USES_CONVERSION;
	CString strMsg;
	strMsg.Format(_T("varStr1:%s,varStr2:%s"),OLE2T(varStr1.bstrVal),OLE2T(varStr2.bstrVal));
	AfxMessageBox(strMsg);
	return "heheh";
}

void CLinkitPClientDlg::OnTimer(UINT_PTR nIDEvent)
{
	// TODO: Add your message handler code here and/or call default
	EnterCriticalSection(&cs);
	if(nIDEvent == 1) //check first msgtip , if != _curmt show it
	{
		if(_msgList.size()>0)
		{
			list<CMessageTip*>::const_iterator it;
			it = _msgList.begin();
			if(*it != _curmt || _curmt==NULL)
			{
				(*it)->ShowWindow(SW_SHOWNOACTIVATE);
				_curmt = *it;
			}

		}

		if(_ntList.size()>0)
		{
			list<CNotificationTip*>::const_iterator it;
			it = _ntList.begin();
			if(*it != _curnt || _curnt==NULL)
			{
				(*it)->ShowWindow(SW_SHOWNOACTIVATE);
				_curnt = *it;
			}

		}

	}
	else if(nIDEvent == 2)//check first msgtip , if invisible and not null , kick it out
	{
		if(_msgList.size()>0)
		{
			list<CMessageTip*>::const_iterator it;
			it = _msgList.begin();
			if(*it == _curmt)
			{
				if(!(*it)->IsWindowVisible())
				{
					_msgList.pop_front();
					delete _curmt;
					_curmt = NULL;
				}
				
			}

		}
		if(_ntList.size()>0)
		{
			list<CNotificationTip*>::const_iterator it;
			it = _ntList.begin();
			if(*it == _curnt)
			{
				if(!(*it)->IsWindowVisible())
				{
					_ntList.pop_front();
					delete _curnt;
					_curnt = NULL;
				}

			}

		}
	}
	else if(nIDEvent == 3)
	{
// 		VARIANT temp;
// 		temp.bstrVal = _T("abdfsd");
// 		OnMsgHandler(temp);
// 		OnNotificationHandler(temp);

	//	BeFront();
	}

	LeaveCriticalSection(&cs);
	CDHtmlDialog::OnTimer(nIDEvent);
}


void CLinkitPClientDlg::OnLButtonDown(UINT nFlags, CPoint point)
{
	// TODO: Add your message handler code here and/or call default
	//	PostMessage(WM_NCLBUTTONDOWN, HTCAPTION, MAKELPARAM(point.x,point.y));

	CDHtmlDialog::OnLButtonDown(nFlags, point);
}


LRESULT CLinkitPClientDlg::OnNcHitTest(CPoint point)
{
	// TODO: Add your message handler code here and/or call default


	return CDHtmlDialog::OnNcHitTest(point);

}

void CLinkitPClientDlg::IsPCClient(VARIANT& v)
{

}

void CLinkitPClientDlg::OnMsgHandler(VARIANT& vMsg){
	//if(GetActiveWindow() != this)
	{
// 		if(_msgList.size() <= 20)
// 		{
// 			_cmt = new CMessageTip(this);
// 			_cmt->Create(IDD_DIALOG1,this);
// 			_msgList.push_back(_cmt);
// 			//MessageBox(vMsg.bstrVal);
// 		}
		

		for(int i = 0 ; i <20 ; i ++)
		{
			if(_cmt->IsLoadComplete())
			{
				_cmt->InsertMsg(CString(vMsg.bstrVal));
				break;
			}
			else
				Sleep(500);
		}

		_cmt->ShowWindow(SW_SHOWNOACTIVATE);
		_cmt->resetTimer();

	}

}

void CLinkitPClientDlg::OnNotificationHandler(VARIANT& vNt){
	
	//if(GetActiveWindow() != this)
	{
// 		if(_ntList.size() <= 20)
// 		{
// 
// 			_cnt = new CNotificationTip(this);
// 			_cnt->Create(IDD_NOTIFICATIONTIP,this);
// 			_ntList.push_back(_cnt);
// 			//	MessageBox(vNt.bstrVal);
// 		}
// 		_cnt->reNav();
// 		Sleep(3000);

		for(int i = 0 ; i <20 ; i ++)
		{
			if(_cnt->IsLoadComplete())
			{
				_cnt->InsertMsg(CString(vNt.bstrVal));
				break;
			}
			else
				Sleep(500);
		}
		_cnt->ShowWindow(SW_SHOWNOACTIVATE);
		_cnt->resetTimer();
	}
}


void CLinkitPClientDlg::OnReplyMsg(CString & strMsg)
{
	//MessageBox(strMsg);
	theApp.CallJSFunction(m_ipdoc,CString("extendSendMessage"),strMsg);
}

void CLinkitPClientDlg::OnDeleteNotification(CString & strNoti)
{
	theApp.CallJSFunction(m_ipdoc,CString("extendDeleteNotification"),strNoti);
}



void CLinkitPClientDlg::OnNavigateComplete(LPDISPATCH pDisp, LPCTSTR szUrl)
{
	CDHtmlDialog::OnNavigateComplete(pDisp, szUrl);

	// TODO: Add your specialized code here and/or call the base class
// 	CComPtr<IHTMLDocument2>  spDocument = NULL;
// 	this->GetDHtmlDocument(&spDocument);
// 	CComPtr<IHTMLElement> spElement;
// 	BSTR state ;
// 	
// 	spDocument->get_readyState(&state);
// 
// 
// 	HRESULT err = spDocument->get_body(&spElement);
// 	if (NULL == spElement)
// 		return;
// 
// 	
// 	CComPtr<IHTMLBodyElement> spBodyElement;
// 	spElement->QueryInterface(__uuidof(IHTMLBodyElement), (void**)&spBodyElement);
// 	if (NULL == spBodyElement)
// 		return;
// 	spBodyElement->put_scroll(L"no");

	GetDHtmlDocument(&m_ipdoc);
	ASSERT(m_ipdoc);
	//ShowWindow(SW_SHOW);

}


void CLinkitPClientDlg::PreInitDialog()
{
	// TODO: Add your specialized code here and/or call the base class
	SetHostFlags(DOCHOSTUIFLAG_NO3DBORDER | DOCHOSTUIFLAG_SCROLL_NO);
	CDHtmlDialog::PreInitDialog();
}


BOOL CLinkitPClientDlg::PreCreateWindow(CREATESTRUCT& cs)
{
	// TODO: Add your specialized code here and/or call the base class
	SetHostFlags(DOCHOSTUIFLAG_NO3DBORDER | DOCHOSTUIFLAG_SCROLL_NO);
	return CDHtmlDialog::PreCreateWindow(cs);
}


void CLinkitPClientDlg::OnDocumentComplete(LPDISPATCH pDisp, LPCTSTR szUrl)
{
	CDHtmlDialog::OnDocumentComplete(pDisp, szUrl);

	// TODO: Add your specialized code here and/or call the base class

}


void CLinkitPClientDlg::OnUpdateUIState(UINT /*nAction*/, UINT /*nUIElement*/)
{
	// This feature requires Windows 2000 or greater.
	// The symbols _WIN32_WINNT and WINVER must be >= 0x0500.
	// TODO: Add your message handler code here
}


BOOL CLinkitPClientDlg::Config()
{

	//prepare folders
	CString conf_file;
	conf_file.Format(_T("%S\\Lenovo"),getenv("APPDATA"));
	CreateDirectory(conf_file,0);
	conf_file.Append(_T("\\LINKit"));
	CreateDirectory(conf_file,0);
	conf_file.Append(_T("\\Conf.ini"));

	if(!_waccess(conf_file,0))
	{
		
		GetPrivateProfileString(L"Server", L"main_page", MAIN_PAGE_URL,main_page_url,512,conf_file);
		GetPrivateProfileString(L"Server", L"msg_pop", MSG_POP_URL,msg_page_url,512,conf_file);
		GetPrivateProfileString(L"Server", L"noti_pop", NOTIFICATION_POP_URL,noti_page_url,512,conf_file);

		m_firstrun = GetPrivateProfileInt(L"Settings", L"firstrun", 0, conf_file);

		if(!m_firstrun)
		{
			MessageBox(_T("Please run with administrative privileges for first use"));
			return -1;
		}
		m_ifCloseToHide = GetPrivateProfileInt(L"Settings", L"close2hide", 1, conf_file);
		m_ifAutoRun = GetPrivateProfileInt(L"Settings", L"autorun", 1, conf_file);
	
	}
	else
	{
 		WritePrivateProfileString(L"Server",L"main_page", MAIN_PAGE_URL, conf_file);
		WritePrivateProfileString(L"Server",L"msg_pop", MSG_POP_URL, conf_file);
		WritePrivateProfileString(L"Server",L"noti_pop", NOTIFICATION_POP_URL, conf_file);

		WritePrivateProfileString(L"Settings",L"close2hide", L"1", conf_file);
		WritePrivateProfileString(L"Settings",L"autorun", L"1", conf_file);
		WritePrivateProfileString(L"Settings",L"firstrun", L"0", conf_file);
		WritePrivateProfileString(L"Settings",L"closeReminder", L"0", conf_file);

		WritePrivateProfileString(L"Server1",L"main_page", L"http://114.215.236.240/linkit.html", conf_file);
		WritePrivateProfileString(L"Server1",L"msg_pop", L"http://114.215.236.240/notice_message.html", conf_file);
		WritePrivateProfileString(L"Server1",L"noti_pop", L"http://114.215.236.240/notice_notification.html", conf_file);

		MessageBox(_T("Please run with administrative privileges for first use"));
		return -1;
	}

	//auto run registry
	if(m_ifAutoRun)
	{
		HKEY hk = NULL;  
		CString str = _T("Software\\Microsoft\\Windows\\CurrentVersion\\Run");  
		if (RegCreateKey(HKEY_CURRENT_USER,str,&hk)!=0)  
		{  
			return -1;
		}  

		CString    sPath, sPath2;   
		GetModuleFileName(NULL,sPath.GetBufferSetLength(MAX_PATH+1),MAX_PATH); 
		sPath2.Format(_T("\"%s\" /min"),sPath);
		if (RegSetValueEx(hk,L"LINKit", NULL, REG_SZ,(const byte*)(sPath2.GetBuffer()),sPath2.GetLength()*2)!=0)  
		{  
			RegCloseKey(hk);  
			return -1;
		}  
		RegCloseKey(hk);  
	}

	
	return 0;
}


void CLinkitPClientDlg::updateSettings()
{
	//prepare folders
	CString conf_file;
	conf_file.Format(_T("%S\\Lenovo"),getenv("APPDATA"));
	CreateDirectory(conf_file,0);
	conf_file.Append(_T("\\LINKit"));
	CreateDirectory(conf_file,0);
	conf_file.Append(_T("\\Conf.ini"));
	//////////////////////////////////////////////////////////////////////////
	WritePrivateProfileString(L"Settings",L"close2hide", m_ifCloseToHide?L"1":L"0", conf_file);
	
	//auto run setting
	WritePrivateProfileString(L"Settings",L"autorun", m_ifAutoRun?L"1":L"0", conf_file);

	HKEY hk = NULL;  
	CString str = _T("Software\\Microsoft\\Windows\\CurrentVersion\\Run");  
	if (RegCreateKey(HKEY_CURRENT_USER,str,&hk)!=0)  
	{  
		return ;
	}  

	if(m_ifAutoRun)
	{
		CString    sPath, sPath2;   
		GetModuleFileName(NULL,sPath.GetBufferSetLength(MAX_PATH+1),MAX_PATH);   

		sPath2.Format(_T("\"%s\" /min"),sPath);
		if (RegSetValueEx(hk,L"LINKit", NULL, REG_SZ,(const byte*)(sPath2.GetBuffer()),sPath2.GetLength()*2)!=0)  
		{  
			RegCloseKey(hk);  
			return ;
		}  
		
	}
	else
	{
		 RegDeleteValue(hk,L"LINKit");

	}
	RegCloseKey(hk);  
}

void CLinkitPClientDlg::BeFront()
{
	ShowWindow(SW_SHOWNORMAL);
 	::SetWindowPos( this->m_hWnd, HWND_TOPMOST, 0,0,0,0, SWP_NOSIZE|SWP_NOMOVE ); 
 	::SetWindowPos(this->m_hWnd,  HWND_NOTOPMOST, 0,0,0,0, SWP_NOSIZE|SWP_NOMOVE );

}

LRESULT  CLinkitPClientDlg::OnIconNotify(WPARAM   wParam,   LPARAM   lParam)     
{     
	switch   ((UINT)lParam)     
	{     
	case WM_RBUTTONDOWN:
		{
			CMenu  menu;   
			menu.LoadMenu(IDR_MENU1);   
			//  mouse click point 
			CPoint  point;   
			GetCursorPos(&point);   
			//  active bkground window 
			SetForegroundWindow();   
			//  show menu
			menu.GetSubMenu(0)->TrackPopupMenu(   
				TPM_LEFTBUTTON|TPM_RIGHTBUTTON,    
				point.x,  point.y,  this,  NULL);    
			//  post additional message    
			PostMessage(WM_USER,  0,  0);   
			break;  
		}

	case   WM_LBUTTONDBLCLK:  
		this->ShowWindow(SW_SHOW);
		SetForegroundWindow();
			break;     
	}    
	return 0L;
}     


LRESULT CLinkitPClientDlg::OnInitHide(WPARAM   wParam,   LPARAM   lParam)
{
	ShowWindow(SW_HIDE);
	return 0L;
}

void CLinkitPClientDlg::OnClose()
{
	// TODO: Add your message handler code here and/or call default
	
	CDHtmlDialog::OnClose();
}


void CLinkitPClientDlg::OnCancel()
{
	// TODO: Add your specialized code here and/or call the base class
	CString conf_file;
	conf_file.Format(_T("%S\\Lenovo"),getenv("APPDATA"));
	CreateDirectory(conf_file,0);
	conf_file.Append(_T("\\LINKit"));
	CreateDirectory(conf_file,0);
	conf_file.Append(_T("\\Conf.ini"));
	m_closeReminder = GetPrivateProfileInt(L"Settings", L"closeReminder", 0, conf_file);
	if(!m_closeReminder)
	{
		MessageBox(_T("LINKit will be minimized to the notification area, you can change it from the settings by right click the LINKit icon."));
		WritePrivateProfileString(L"Settings",L"closeReminder", L"1", conf_file);
	}
	this->ShowWindow(SW_HIDE);
	if(!m_ifCloseToHide)
		CDHtmlDialog::OnCancel();
}


void CLinkitPClientDlg::OnPopupShowWindow()
{
	// TODO: Add your command handler code here
	ShowWindow(SW_SHOW);
	SetForegroundWindow();
}


void CLinkitPClientDlg::OnPopupSettings()
{

	// TODO: Add your command handler code here
	CSettingDlg setting;
	setting.setParent(this);
	INT_PTR nResponse = setting.DoModal();
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
}


void CLinkitPClientDlg::OnPopupExit()
{
	// TODO: Add your command handler code here
	NOTIFYICONDATA   nid;     
	nid.cbSize   =   sizeof(nid);     
	nid.hWnd   =   this->m_hWnd;     
	nid.uID   =  IDR_MAINFRAME;     
    Shell_NotifyIcon(NIM_DELETE,   &nid);    
	_exit(0);
}




void CLinkitPClientDlg::OnPopupAbout()
{
	// TODO: Add your command handler code here
	CAboutDlg aboutdlg;
	aboutdlg.DoModal();
}
