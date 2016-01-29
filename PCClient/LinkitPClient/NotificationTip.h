#include "resource.h"

#pragma once



#ifdef _WIN32_WCE
#error "CDHtmlDialog is not supported for Windows CE."
#endif 

// CNotificationTip dialog
class CLinkitPClientDlg;
class CNotificationTip : public CDHtmlDialog
{
	DECLARE_DYNCREATE(CNotificationTip)

public:
	CNotificationTip(CWnd* pParent = NULL);   // standard constructor
	virtual ~CNotificationTip();
// Overrides
	HRESULT OnButtonOK(IHTMLElement *pElement);
	HRESULT OnButtonCancel(IHTMLElement *pElement);
	BOOL IfMouseOn();
	void resetTimer();
	virtual BOOL IsExternalDispatchSafe(){ return TRUE;}
// Dialog Data
	enum { IDD = IDD_NOTIFICATIONTIP, IDH = 0 };

protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support
	virtual BOOL OnInitDialog();
	int left,top,right,bottom;
	CLinkitPClientDlg * m_pParent;
	bool m_isLoadone;
	IHTMLDocument2 * m_ipdoc;
	DECLARE_MESSAGE_MAP()
	DECLARE_DHTML_EVENT_MAP()
	DECLARE_DISPATCH_MAP()
public:
	void SetParent(CLinkitPClientDlg * pParent);
	afx_msg void OnTimer(UINT_PTR nIDEvent);
	void reNav();
	virtual BOOL OnWndMsg(UINT message, WPARAM wParam, LPARAM lParam, LRESULT* pResult);
	int InsertMsg(CString & strMsg);
	void OnDeleteNotification(VARIANT& vStr1);
	
	virtual void OnNavigateComplete(LPDISPATCH pDisp, LPCTSTR szUrl);
	bool IsLoadComplete(){return m_isLoadone;}
	void HidePopWindow(VARIANT_BOOL isShowParent);
};
