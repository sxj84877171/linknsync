#pragma once

#ifdef _WIN32_WCE
#error "CDHtmlDialog is not supported for Windows CE."
#endif 

// CMessageTip dialog

class CMessageTip : public CDHtmlDialog
{
	DECLARE_DYNCREATE(CMessageTip)

public:
	CMessageTip(CWnd* pParent = NULL);   // standard constructor
	virtual ~CMessageTip();
	BOOL IfMouseOn();
// Overrides
	HRESULT OnButtonOK(IHTMLElement *pElement);
	HRESULT OnButtonCancel(IHTMLElement *pElement);
	virtual BOOL IsExternalDispatchSafe(){ return TRUE;}
// Dialog Data
	enum { IDD = IDD_DIALOG1, IDH = 0 /*IDR_HTML_MESSAGETIP2*/ };

protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support
	virtual BOOL OnInitDialog();
	bool m_isLoadone;
	CLinkitPClientDlg * m_pParent;
	int left,top,right,bottom;
	IHTMLDocument2 * m_ipdoc;
	DECLARE_MESSAGE_MAP()
	DECLARE_DHTML_EVENT_MAP()
	DECLARE_DISPATCH_MAP()
public:
	afx_msg void OnTimer(UINT_PTR nIDEvent);
	void SetParent(CLinkitPClientDlg * pParent);
	virtual BOOL OnWndMsg(UINT message, WPARAM wParam, LPARAM lParam, LRESULT* pResult);
	virtual BOOL OnCommand(WPARAM wParam, LPARAM lParam);
	void resetTimer();
	void reNav();
	int InsertMsg(CString & strMsg);
	
	virtual BOOL IsInvokeAllowed(DISPID /*dispid*/);
	void OnReplyMsg(VARIANT& vStr1);
	virtual void OnNavigateComplete(LPDISPATCH pDisp, LPCTSTR szUrl);
	bool IsLoadComplete(){return m_isLoadone;}
	virtual BOOL PreTranslateMessage(MSG* pMsg);
	afx_msg void OnSysCommand(UINT nID, LPARAM lParam);
	void HidePopWindow(VARIANT_BOOL isShowParent);
};
