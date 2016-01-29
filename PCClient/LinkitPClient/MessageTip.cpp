// MessageTip.cpp : implementation file
//

#include "stdafx.h"
#include "LinkitPClient.h"
#include "LinkitPClientDlg.h"
#include "MessageTip.h"


// CMessageTip dialog

IMPLEMENT_DYNCREATE(CMessageTip, CDHtmlDialog)

CMessageTip::CMessageTip(CWnd* pParent /*=NULL*/)
	: CDHtmlDialog(CMessageTip::IDD, CMessageTip::IDH, pParent)
{
	EnableAutomation();
	m_isLoadone = false;
	m_ipdoc = NULL;
}

CMessageTip::~CMessageTip()
{
	if(m_ipdoc)
		m_ipdoc->Release();
}

void CMessageTip::DoDataExchange(CDataExchange* pDX)
{
	CDHtmlDialog::DoDataExchange(pDX);
}

void CMessageTip::SetParent(CLinkitPClientDlg * pParent)
{
	m_pParent = pParent;
}
BOOL CMessageTip::OnInitDialog()
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
	int scaley = MulDiv(170, _dpiY, 96); 

	//HDPI


    //get workspace size
	int ws_width= GetSystemMetrics(SM_CXFULLSCREEN);
	int ws_heigh= GetSystemMetrics(SM_CYFULLSCREEN);
	left = ws_width-scalex;
	top = ws_heigh-scaley;
	right = ws_width;
	bottom = ws_heigh;
	CRect tipRect(left,top,right,bottom);
	MoveWindow(&tipRect);
	
	//get toolbar height
	//APPBARDATA abd;
	//memset(&abd,0,sizeof(APPBARDATA));
	//abd.cbSize = sizeof(abd);
	//SHAppBarMessage(ABM_GETTASKBARPOS,&abd);
	ModifyStyleEx(WS_EX_APPWINDOW,WS_EX_TOOLWINDOW);
	SetWindowPos(&CWnd::wndTopMost,0,0,0,0,SWP_NOMOVE|SWP_NOSIZE);
	Navigate(m_pParent->msg_page_url);


	SetExternalDispatch(GetIDispatch(TRUE));
	
	return TRUE;  // return TRUE  unless you set the focus to a control
}

BEGIN_MESSAGE_MAP(CMessageTip, CDHtmlDialog)
	ON_WM_TIMER()
	ON_WM_SYSCOMMAND()
END_MESSAGE_MAP()

BEGIN_DHTML_EVENT_MAP(CMessageTip)
	DHTML_EVENT_ONCLICK(_T("ButtonOK"), OnButtonOK)
	DHTML_EVENT_ONCLICK(_T("ButtonCancel"), OnButtonCancel)
END_DHTML_EVENT_MAP()

BEGIN_DISPATCH_MAP(CMessageTip, CDHtmlDialog) 
	DISP_FUNCTION(CMessageTip, "replyMsg",OnReplyMsg,VT_EMPTY,VTS_VARIANT) 
	DISP_FUNCTION(CMessageTip, "hidePopWindow",HidePopWindow,VT_EMPTY,VTS_BOOL) 
END_DISPATCH_MAP()

// CMessageTip message handlers

HRESULT CMessageTip::OnButtonOK(IHTMLElement* /*pElement*/)
{
	InsertMsg(CString("hello world!"));
	//OnOK();
	return S_OK;
}

HRESULT CMessageTip::OnButtonCancel(IHTMLElement* /*pElement*/)
{
	OnCancel();
	return S_OK;
}


BOOL CMessageTip::IfMouseOn()
{
	POINT curPos;
	memset(&curPos,0,sizeof(POINT));
	GetCursorPos(&curPos);
	

	if(curPos.x>=left && curPos.x <=right && curPos.y>=top && curPos.y<=bottom)
		return TRUE;

	return FALSE;

}

void CMessageTip::resetTimer()
{
	KillTimer(1);
	SetTimer(1,30000,NULL);
}
void CMessageTip::OnTimer(UINT_PTR nIDEvent)
{
	// TODO: Add your message handler code here and/or call default
	if (!IfMouseOn())
	{
		KillTimer(1);
		ShowWindow(SW_HIDE);
	//	m_isLoadone = false;
		theApp.CallJSFunction(m_ipdoc, CString("clearMsgWindow"),CString(""));
	}
	CDHtmlDialog::OnTimer(nIDEvent);
}


BOOL CMessageTip::OnWndMsg(UINT message, WPARAM wParam, LPARAM lParam, LRESULT* pResult)
{
	// TODO: Add your specialized code here and/or call the base class
	if (message == WM_SHOWWINDOW)

	{
		//SetTimer(1,30000,NULL);
	}
	return CDHtmlDialog::OnWndMsg(message, wParam, lParam, pResult);
}


BOOL CMessageTip::OnCommand(WPARAM wParam, LPARAM lParam)
{
	// TODO: Add your specialized code here and/or call the base class

	return CDHtmlDialog::OnCommand(wParam, lParam);
}


int CMessageTip::InsertMsg(CString & strMsg)
{
   theApp.CallJSFunction(m_ipdoc,CString("showMessage"),strMsg);
	return 0;
}

void CMessageTip::OnReplyMsg(VARIANT& vStr1)
{
	m_pParent->OnReplyMsg(CString(vStr1.bstrVal));
}


BOOL CMessageTip::IsInvokeAllowed(DISPID /*dispid*/)
{
	// TODO: Add your specialized code here and/or call the base class

	return TRUE;
}


void CMessageTip::OnNavigateComplete(LPDISPATCH pDisp, LPCTSTR szUrl)
{
	CDHtmlDialog::OnNavigateComplete(pDisp, szUrl);

	// TODO: Add your specialized code here and/or call the base class
	GetDHtmlDocument(&m_ipdoc);
	ASSERT(m_ipdoc);
	m_isLoadone = true;
}


BOOL CMessageTip::PreTranslateMessage(MSG* pMsg)
{
	// TODO: Add your specialized code here and/or call the base class

	return CDHtmlDialog::PreTranslateMessage(pMsg);
}


void CMessageTip::OnSysCommand(UINT nID, LPARAM lParam)
{
	// TODO: Add your message handler code here and/or call default

	CDHtmlDialog::OnSysCommand(nID, lParam);
}

void CMessageTip::HidePopWindow(VARIANT_BOOL isShowParent)
{
	KillTimer(1);
	ShowWindow(SW_HIDE);
	theApp.CallJSFunction(m_ipdoc, CString("clearMsgWindow"),CString(""));
	if(isShowParent)
	{
		m_pParent->ShowWindow(SW_SHOWNORMAL);
		//m_pParent->BeFront();
	}
}


void CMessageTip::reNav()
{
	m_isLoadone = false;
	this->Navigate(m_pParent->noti_page_url);
}