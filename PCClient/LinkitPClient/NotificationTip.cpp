// NotificationTip.cpp : implementation file
//

#include "stdafx.h"
#include "NotificationTip.h"
#include "LinkitPClient.h"
#include "LinkitPClientDlg.h"
// CNotificationTip dialog

IMPLEMENT_DYNCREATE(CNotificationTip, CDHtmlDialog)

CNotificationTip::CNotificationTip(CWnd* pParent /*=NULL*/)
	: CDHtmlDialog(CNotificationTip::IDD, CNotificationTip::IDH, pParent)
{
	EnableAutomation();
	m_ipdoc = NULL;
	m_isLoadone = false;
}

CNotificationTip::~CNotificationTip()
{
	if(m_ipdoc)
		m_ipdoc->Release();
}

void CNotificationTip::DoDataExchange(CDataExchange* pDX)
{
	CDHtmlDialog::DoDataExchange(pDX);
}
void CNotificationTip::SetParent(CLinkitPClientDlg * pParent)
{
	m_pParent = pParent;
}
BOOL CNotificationTip::OnInitDialog()
{
	CDHtmlDialog::OnInitDialog();

	//HDPI 
	int _dpiX, _dpiY;
	HDC hdc = ::GetDC(NULL);
	if (hdc)
	{
		_dpiX = GetDeviceCaps(hdc, LOGPIXELSX);
		_dpiY = GetDeviceCaps(hdc, LOGPIXELSY);
		::ReleaseDC(NULL, hdc);
	}

	int scalex = MulDiv(320, _dpiX, 96); 
	int scaley = MulDiv(170 + 180, _dpiY, 96); 

	int scaley1 = MulDiv(180,_dpiY,96);
	//HDPI


	//get workspace size
	int ws_width= GetSystemMetrics(SM_CXFULLSCREEN);
	int ws_heigh= GetSystemMetrics(SM_CYFULLSCREEN);
	left = ws_width-scalex;
	top = ws_heigh-scaley;
	right = ws_width;
	bottom = ws_heigh - scaley1;
	CRect tipRect(left,top,right,bottom);
	MoveWindow(&tipRect);
	SetWindowPos(&CWnd::wndTopMost,0,0,0,0,SWP_NOMOVE|SWP_NOSIZE);
	ModifyStyleEx(WS_EX_APPWINDOW,WS_EX_TOOLWINDOW);
	Navigate(m_pParent->noti_page_url);
	
	SetExternalDispatch(GetIDispatch(TRUE));
	return TRUE;  // return TRUE  unless you set the focus to a control
}

BEGIN_MESSAGE_MAP(CNotificationTip, CDHtmlDialog)
	ON_WM_TIMER()
END_MESSAGE_MAP()

BEGIN_DHTML_EVENT_MAP(CNotificationTip)
	DHTML_EVENT_ONCLICK(_T("ButtonOK"), OnButtonOK)
	DHTML_EVENT_ONCLICK(_T("ButtonCancel"), OnButtonCancel)
END_DHTML_EVENT_MAP()


BEGIN_DISPATCH_MAP(CNotificationTip, CDHtmlDialog) 
	DISP_FUNCTION(CNotificationTip, "deleteNotification",OnDeleteNotification,VT_EMPTY,VTS_VARIANT) 
	DISP_FUNCTION(CNotificationTip, "hidePopWindow",HidePopWindow,VT_EMPTY,VTS_BOOL)
END_DISPATCH_MAP()
// CNotificationTip message handlers

HRESULT CNotificationTip::OnButtonOK(IHTMLElement* /*pElement*/)
{
	OnOK();
	return S_OK;
}

HRESULT CNotificationTip::OnButtonCancel(IHTMLElement* /*pElement*/)
{
	OnCancel();
	return S_OK;
}

void CNotificationTip::resetTimer()
{
	KillTimer(1);
	SetTimer(1,30000,NULL);
}

void CNotificationTip::reNav()
{
	m_isLoadone = false;
	this->Navigate(m_pParent->noti_page_url);
}
void CNotificationTip::OnTimer(UINT_PTR nIDEvent)
{
	// TODO: Add your message handler code here and/or call default
	if (!IfMouseOn())
	{
		KillTimer(1);
		ShowWindow(SW_HIDE);
		//m_isLoadone = false;
		theApp.CallJSFunction(m_ipdoc,CString("clearMsgWindow"),CString(""));

	}
	CDHtmlDialog::OnTimer(nIDEvent);
}

BOOL CNotificationTip::IfMouseOn()
{
	POINT curPos;
	memset(&curPos,0,sizeof(POINT));
	GetCursorPos(&curPos);


	if(curPos.x>=left && curPos.x <=right && curPos.y>=top && curPos.y<=bottom)
		return TRUE;

	return FALSE;

}

void CNotificationTip::OnDeleteNotification(VARIANT& vStr1)
{
	m_pParent->OnDeleteNotification(CString(vStr1.bstrVal));
}
int CNotificationTip::InsertMsg(CString & strMsg)
{
	theApp.CallJSFunction(m_ipdoc,CString("showNotification"),strMsg);

	return 0;
}

BOOL CNotificationTip::OnWndMsg(UINT message, WPARAM wParam, LPARAM lParam, LRESULT* pResult)
{
	// TODO: Add your specialized code here and/or call the base class
	if (message == WM_SHOWWINDOW)

	{
		//SetTimer(1,5000,NULL);
	}
	return CDHtmlDialog::OnWndMsg(message, wParam, lParam, pResult);
}



void CNotificationTip::OnNavigateComplete(LPDISPATCH pDisp, LPCTSTR szUrl)
{
	CDHtmlDialog::OnNavigateComplete(pDisp, szUrl);

	// TODO: Add your specialized code here and/or call the base class
	GetDHtmlDocument(&m_ipdoc);
	ASSERT(m_ipdoc);
	m_isLoadone = true;
}

void CNotificationTip::HidePopWindow(VARIANT_BOOL isShowParent)
{
	KillTimer(1);
	ShowWindow(SW_HIDE);
	//this->reNav();
	theApp.CallJSFunction(m_ipdoc,CString("clearMsgWindow"),CString(""));
	if(isShowParent)
	{
		m_pParent->ShowWindow(SW_SHOWNORMAL);
		//m_pParent->BeFront();
	}
}