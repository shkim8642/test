#include <atlstr.h> 
#include <Windows.h> 
#pragma comment(lib,"version.lib") 
void main(void) 
{ 
    // 버전 확인할 파일 경로(전체 경로) 
    CString strFilePath = _T( "C:\\Program Files (x86)\\Kakao\\KakaoTalk\\KakaoTalk.exe" ); 
    
    // 파일 정보 저장 버퍼 
    TCHAR atcBuffer[MAX_PATH] = { 0, }; 
    if ( FALSE != GetFileVersionInfo( strFilePath, 0, MAX_PATH, atcBuffer ) ) 
     { 
            VS_FIXEDFILEINFO* pFineInfo = NULL; 
            UINT bufLen = 0; 
            
            // VS_FIXEDFILEINFO 정보 가져오기 
            if ( FALSE != VerQueryValue( atcBuffer, _T("\\"), (LPVOID*)&pFineInfo, &bufLen ) !=0 ) 
            { 
                WORD majorVer, minorVer, buildNum, revisionNum; 
                majorVer = HIWORD( pFineInfo->dwFileVersionMS ); 
                minorVer = LOWORD( pFineInfo->dwFileVersionMS ); 
                buildNum = HIWORD( pFineInfo->dwFileVersionLS ); 
                revisionNum = LOWORD( pFineInfo->dwFileVersionLS ); 
                
                // 파일버전 출력 
                printf( "version : %d,%d,%d,%d\n", majorVer, minorVer, buildNum, revisionNum );
            }
    } 
        return; 
}

#출처: https://3001ssw.tistory.com/207 [C++, WinAPI, Android, OpenCV 정리 블로그]