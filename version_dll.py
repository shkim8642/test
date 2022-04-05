import pefile
 
 pe = pefile.PE(r'C:\adb.exe')


 FileVersionLS    = pe.VS_FIXEDFILEINFO.FileVersionLS
 FileVersionMS    = pe.VS_FIXEDFILEINFO.FileVersionMS
 ProductVersionLS = pe.VS_FIXEDFILEINFO.ProductVersionLS
 ProductVersionMS = pe.VS_FIXEDFILEINFO.ProductVersionMS
 
 FileVersion = (FileVersionMS >> 16, FileVersionMS & 0xFFFF, FileVersionLS >> 16, FileVersionLS & 0xFFFF)
 ProductVersion = (ProductVersionMS >> 16, ProductVersionMS & 0xFFFF, ProductVersionLS >> 16, ProductVersionLS & 0xFFFF)
 
 print 'File version:    %s.%s.%s.%s' % FileVersion 
 print 'Product version: %s.%s.%s.%s' % ProductVersion