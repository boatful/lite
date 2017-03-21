Public vbsStrUser

Function vbsLOGIN()
	vbsStrUser = CreateObject("WScript.Network").UserName
	vbsLOGIN = vbsStrUser
End Function

// see: https://www.tutorialspoint.com/vbscript/index.htm
Function vbsNewInstance()
	Set objShell = CreateObject("WScript.Shell")
	objShell.Run("index.hta")
	Set objShell = Nothing
End Function

Function vbsLpad (inputStr, padChar, lengthStr)  
	vbsLpad = string(lengthStr - Len(inputStr),padChar) & inputStr  
End Function 

Function vbsRpad (inputStr, padChar, lengthStr)  
	vbsRpad = inputStr & string(lengthStr - Len(inputStr), padChar)  
End Function 

Function vbsNewCalculator()
	// see: https://technet.microsoft.com/en-us/library/ee156605.aspx
	Set objShell = CreateObject("WScript.Shell")
	objShell.Run("calc.exe")
	Set objShell = Nothing
	// objShell.Run("%comspec% /K dir"), 1, True
End Function

Function vbsNewHEP()
	// see: https://technet.microsoft.com/en-us/library/ee156605.aspx
	Set objShell = CreateObject("WScript.Shell")
	objShell.Run("hep.docm")
	Set objShell = Nothing
	// objShell.Run("%comspec% /K dir"), 1, True
End Function

Function vbsNewEXCEL()
	' WHAT: INVISIBLY, WE COPY/PASTE FROM HTA/CLIPBOARD TO receiver.xlsx AND THEN 
	' 	COPY WHAT'S NEWLY IN receiver.xlsx TO THE CLIPBOARD BEFORE CLOSING EXCEL.
	' WHY: EXCEL CONVERTS HTML FORMATTING TO SOMETHING PRISM UNDERSTANDS
	' 	(BOLD, UNDERLINE, FONT-FAMILY, RIGHT/LEFT ALIGN, ETC.)
	Set ExcelApp = CreateObject("Excel.Application")
	With ExcelApp
		.Visible = False
		.DisplayAlerts = False
		' see: https://msdn.microsoft.com/en-us/library/ms970635.aspx
		' (IE SCRIPTING OBJECT MODEL -> The Location Object)
		' SUBSTITUTE window.location.pathname (IE9) FOR Location.PathName (IE6)
		Set xlBook = .Workbooks.Open(Replace(Replace(window.location.pathname,"index.hta","receiver.xlsx"),"\","/"))
		Set xlSheet = xlBook.Worksheets(1)
		xlSheet.Cells(1,1).Activate
		xlSheet.Paste
		' see: https://msdn.microsoft.com/en-us/library/microsoft.office.tools.excel.worksheet.usedrange.aspx
		xlSheet.UsedRange.Copy
		Set xlSheet = Nothing
		Set xlBook = Nothing
		.Quit
	End With
	Set ExcelApp = Nothing
End Function