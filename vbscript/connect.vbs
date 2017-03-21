Public DB_Farm
Set DB_Farm = CreateObject("Scripting.Dictionary")

Function vbsCONNECT_DB(strAnimal)
	' BOUND TO FAIL IF THE CALLING SCRIPT STOPS BEING NAMED: "index.hta".
	' CREATE A NEW DB CONNECTION **UNLESS** ONE ALREADY EXISTS (FOR strAnimal IN OUR DB_Farm)
	
	strLocation = Location.pathname ' DIFFERS SLIGHTLY FROM: window.location (JAVASCRIPT)
	' MsgBox strLocation & vbNewLine & " is Location.pathname in: vbsCONNECT_DB()"
	If NOT isObject(DB_Farm) OR uCase(typeName(DB_Farm)) = "NOTHING" Then Set DB_Farm = CreateObject("Scripting.Dictionary")
	If NOT isObject(DB_Farm(strAnimal)) OR uCase(typeName(DB_Farm(strAnimal))) = "NOTHING" Then Set DB_Farm(strAnimal) = CreateObject("Scripting.Dictionary")
	Err.Clear()
	If ( NOT isObject(DB_Farm(strAnimal)("objConn")) OR uCase(typeName(DB_Farm(strAnimal)("objConn"))) = "NOTHING" ) Then
		dim strDSN
		Select Case strAnimal
			Case "frontend"
				strDSN = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source="
				strMDBB = Replace(Replace(strLocation,"index.hta","frontend.accdb"),"file:///","") ' THIS FAILS IF YOU CREATE A LINK TO THE APPLICATION IN AN OUTLOOK EMAIL
				// UH OH! DATA PROVIDER Provider=Microsoft.ACE.OLEDB.12.0 IS NOT PRE-INSTALLED ON MY HOME Win7 MACHINE,
				// AND Microsoft.Jet.OLEDB.4.0 CANNOT READ AN ACCESS 2010 DATABASE FILE (*.accdb)
				// see: https://www.microsoft.com/en-us/download/details.aspx?displaylang=en&id=13255
				// REGARDING THE Microsoft Access Database Engine 2010 Redistributable
				// 2017-02-12: I TRIED INSTALLING THE x-64 VERSION OF THIS ON WIN7 LAPTOP - TO NO AVAIL - SO I UNINSTALLED IT.
				// INSTALLING THE FIRST (x-86) VERSION OF IT - THOUGH - SEEMED TO DO THE TRICK.
				// 2017-03-03: THE EXACT OPPOSITE WAS TRUE ON MY NEW WIN10 LAPTOP!
				// AT WORK, UNTIL I DISABLED MACROS/TRUST CENTER ON THE *.accdb, THE DB WAS GETTING LOCKED/CORRUPTED.
			Case Else
				strDSN = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source="
				' strMDBB = "2017-02-05/backend.mdb" ' THIS FAILS IF YOU CREATE A LINK TO THE APPLICATION IN AN OUTLOOK EMAIL
				MsgBox "Not sure we are ever (AGAIN) going to use *.mdb and JET. Exiting vbsCONNECT_DB()."
				' vbsCONNECT_DB = false
				Exit Function
		End Select
		' Set DB_Farm(strAnimal) = CreateObject("Scripting.Dictionary")
		Set DB_Farm(strAnimal)("objConn") = CreateObject("ADODB.Connection")
		DB_Farm(strAnimal)("objConn").Mode = adModeReadWrite ' DEFINED, WITH MANY OTHER CONSTANTS, IN: ./mylib/vbscript/constants.vbs
		DB_Farm(strAnimal)("objConn").Open(strDSN & strMDBB)
		If ( Err.number <> 0 ) Then 
			MsgBox "Unable to Connect to DB..." & Err.description
			' vbsCONNECT_DB = false
			Exit Function
		End If
	End If
	' vbsCONNECT_DB = true
End Function

Function vbsDISCONNECT_DB(strAnimal)
	Err.Clear()
	On Error Resume Next
	If (isObject(DB_Farm(strAnimal)("objConn")) and uCase(typeName(DB_Farm(strAnimal)("objConn"))) = "CONNECTION") Then
		DB_Farm(strAnimal)("objConn").Close
		Set DB_Farm(strAnimal)("objConn") = Nothing
		Set DB_Farm(strAnimal) = Nothing
	End If
	If ( Err.number <> 0 ) Then 
		MsgBox "Unable to Disconnect from the DB... " & Err.description
		vbsDISCONNECT_DB = false
		Exit Function
	End If
	vbsDISCONNECT_DB = true
End Function