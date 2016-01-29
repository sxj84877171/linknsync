// SettingDlg.cpp : implementation file
//

#include "stdafx.h"
#include "SettingDlg.h"
#include "afxdialogex.h"
#include "LinkitPClientDlg.h"

// CSettingDlg dialog

IMPLEMENT_DYNAMIC(CSettingDlg, CDialogEx)

CSettingDlg::CSettingDlg(CWnd* pParent /*=NULL*/)
	: CDialogEx(CSettingDlg::IDD, pParent)
{
	m_hIcon = AfxGetApp()->LoadIcon(IDR_MAINFRAME);
	m_pParent = NULL;
}

CSettingDlg::~CSettingDlg()
{
}

void CSettingDlg::DoDataExchange(CDataExchange* pDX)
{
	CDialogEx::DoDataExchange(pDX);
	DDX_Control(pDX, IDC_CHECK2, m_chkAutoRun);
	DDX_Control(pDX, IDC_CHECK1, m_chkClose2Hide);
}

void CSettingDlg::setParent(CLinkitPClientDlg * pParent)
{
	m_pParent = pParent;
}

BEGIN_MESSAGE_MAP(CSettingDlg, CDialogEx)
	ON_BN_CLICKED(IDC_CHECK1, &CSettingDlg::OnBnClickedCheck1)
	ON_BN_CLICKED(IDC_CHECK2, &CSettingDlg::OnBnClickedCheck2)
END_MESSAGE_MAP()


// CSettingDlg message handlers


BOOL CSettingDlg::OnInitDialog()
{
	CDialogEx::OnInitDialog();

	if (m_pParent->m_ifCloseToHide)
	{
		m_chkClose2Hide.SetCheck(1);
	}
	else
		m_chkClose2Hide.SetCheck(0);
	
	if (m_pParent->m_ifAutoRun)
	{
		m_chkAutoRun.SetCheck(1);
	}
	else
		m_chkAutoRun.SetCheck(0);

	SetIcon(m_hIcon, TRUE);			// Set big icon
	SetIcon(m_hIcon, FALSE);		// Set small icon
	
	CRect windowrect;
	GetWindowRect(&windowrect);
	int width= windowrect.Width();
	int height=windowrect.Height();

	//HDPI 
	int _dpiX, _dpiY;
	HDC hdc = ::GetDC(NULL);
	if (hdc)
	{
		_dpiX = GetDeviceCaps(hdc, LOGPIXELSX);
		_dpiY = GetDeviceCaps(hdc, LOGPIXELSY);
		::ReleaseDC(NULL, hdc);
	}

	int scalex = MulDiv(width, _dpiX, 96); 
	int scaley = MulDiv(height, _dpiY, 96); 

	//HDPI
	SetWindowPos(NULL,0,0,scalex,scaley,SWP_NOMOVE);

	CRect rectBtn;
	m_chkAutoRun.GetWindowRect(&rectBtn);
	width = rectBtn.Width();
	height = rectBtn.Height();

	scalex = MulDiv(width,_dpiX,96);
	scaley = MulDiv(height, _dpiY, 96); 

	m_chkAutoRun.SetWindowPos(NULL,0,0,scalex,scaley,SWP_NOMOVE);


	m_chkClose2Hide.GetWindowRect(&rectBtn);
	width = rectBtn.Width();
	height = rectBtn.Height();

	scalex = MulDiv(width,_dpiX,96);
	scaley = MulDiv(height, _dpiY, 96); 

	m_chkClose2Hide.SetWindowPos(NULL,0,0,scalex,scaley,SWP_NOMOVE);


	return TRUE;  // return TRUE unless you set the focus to a control

}


void CSettingDlg::OnBnClickedCheck1()
{
	//close to hide
	// TODO: Add your control notification handler code here
	m_pParent->m_ifCloseToHide = m_chkClose2Hide.GetCheck();
	m_pParent->updateSettings();
}


void CSettingDlg::OnBnClickedCheck2()
{
	//auto run
	// TODO: Add your control notification handler code here
	m_pParent->m_ifAutoRun = m_chkAutoRun.GetCheck();
	m_pParent->updateSettings();
}
