// LinkitPClientDlg.h : header file
//
#include <list>

#pragma once

using namespace std;
class CMessageTip;
class CNotificationTip;
// CLinkitPClientDlg dialog
class CLinkitPClientDlg : public CDHtmlDialog
{
// Construction
public:
	CLinkitPClientDlg(CWnd* pParent = NULL);	// standard constructor

	~CLinkitPClientDlg()
	{
		delete [] main_page_url;
		delete [] msg_page_url ;
		delete [] noti_page_url;
		if(m_ipdoc)
			m_ipdoc->Release();
	}
	// Dialog Data
	enum { IDD = IDD_LINKITPCLIENT_DIALOG, IDH = 0 };

	protected:
	virtual void DoDataExchange(CDataExchange* pDX);	// DDX/DDV support

	HRESULT OnButtonOK(IHTMLElement *pElement);
	HRESULT OnButtonCancel(IHTMLElement *pElement);
	
// Implementation
protected:
	HICON m_hIcon;
	list<CMessageTip*> _msgList;
	list<CNotificationTip*> _ntList;
	IHTMLDocument2 * m_ipdoc;
	// Generated message map functions
	virtual BOOL OnInitDialog();
	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
	afx_msg void OnPaint();
	afx_msg HCURSOR OnQueryDragIcon();

	BOOL Config();
	virtual BOOL IsExternalDispatchSafe(){ return TRUE;}
	LPCTSTR  GetData();
	LPCSTR TestFunction(VARIANT& vStr1,VARIANT& vStr2);

	void OnMsgHandler(VARIANT& vMsg);
	void OnNotificationHandler(VARIANT& vMsg);
	CRITICAL_SECTION cs;

	CMessageTip * _cmt , * _curmt;
	CNotificationTip * _cnt , * _curnt;


	DECLARE_MESSAGE_MAP()
	DECLARE_DHTML_EVENT_MAP()
	DECLARE_DISPATCH_MAP();
public:
	TCHAR * main_page_url ;
	TCHAR * msg_page_url;
	TCHAR * noti_page_url;
	
	BOOL m_ifCloseToHide;
	BOOL m_ifAutoRun;
	BOOL m_firstrun;
	BOOL m_closeReminder;
	afx_msg void OnTimer(UINT_PTR nIDEvent);
	afx_msg void OnLButtonDown(UINT nFlags, CPoint point);
	afx_msg LRESULT OnNcHitTest(CPoint point);
	void IsPCClient(VARIANT & v);
	void OnReplyMsg(CString & strMsg);
	void OnDeleteNotification(CString & strNoti);
	
	virtual void OnNavigateComplete(LPDISPATCH pDisp, LPCTSTR szUrl);
	virtual void PreInitDialog();
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);
	virtual void OnDocumentComplete(LPDISPATCH pDisp, LPCTSTR szUrl);
	afx_msg void OnUpdateUIState(UINT /*nAction*/, UINT /*nUIElement*/);
	LRESULT  OnIconNotify(WPARAM   wParam,   LPARAM   lParam);
	LRESULT OnInitHide(WPARAM   wParam,   LPARAM   lParam);
	void BeFront();
	afx_msg void OnClose();
	virtual void OnCancel();
	afx_msg void OnPopupShowWindow();
	afx_msg void OnPopupSettings();
	afx_msg void OnPopupExit();

	void updateSettings();
	afx_msg void OnPopupAbout();
};
