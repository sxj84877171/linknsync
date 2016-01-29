#pragma once

#include "resource.h"
#include "afxwin.h"
// CSettingDlg dialog

class CLinkitPClientDlg;
class CSettingDlg : public CDialogEx
{
	DECLARE_DYNAMIC(CSettingDlg)

public:
	CSettingDlg(CWnd* pParent = NULL);   // standard constructor
	virtual ~CSettingDlg();

// Dialog Data
	enum { IDD = IDD_DLG_SETTING };
	void setParent(CLinkitPClientDlg * pParent);
protected:
	virtual void DoDataExchange(CDataExchange* pDX);    // DDX/DDV support
	
	CLinkitPClientDlg * m_pParent;
	DECLARE_MESSAGE_MAP()
public:
	virtual BOOL OnInitDialog();
protected:
	CButton m_chkClose2Hide;
	CButton m_chkAutoRun;
	HICON m_hIcon;
public:
	afx_msg void OnBnClickedCheck1();
	afx_msg void OnBnClickedCheck2();
};
