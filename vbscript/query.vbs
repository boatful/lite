Function vbsLAST_INSERT_ID(strAnimal) ' ALMOST ALWAYS ...("frontend")
	vbsCONNECT_DB(strAnimal) ' TEST FOR A WORKING/OPEN CONNECTION. CONNECT IF NECESSARY.
	Set rsNewAutoIncrement = CreateObject("ADODB.Recordset")
	rsNewAutoIncrement.Open "SELECT @@Identity", DB_Farm(strAnimal)("objConn"), adOpenForwardOnly, adLockReadOnly, adCmdText
	vbsLAST_INSERT_ID = rsNewAutoIncrement.Fields(0).value
	Set rsNewAutoIncrement = Nothing
End Function

Function vbsQUERY_DB(strAnimal, intCommandTypeEnum, strInstructions, intReturnRows, parms)
	' MsgBox strAnimal
	' WE FIRST TEST TO BE SURE A DB CONNECTION TO strAnimal EXISTS AND IS VIABLE
	vbsCONNECT_DB(strAnimal)
	' MsgBox strInstructions
	' 2017-02-25: WE NOW CAN PASS STRINGIFY-ED JSON OBJECTS FROM JAVASCRIPT TO VBSCRIPT FUNCTIONS AS: parms.
	' THIS STRING THEN GETS Decode-ed BY demon's QUITE CAPABLE Class VbsJson IN VbsJson.vbs,
	' ELIMINATING ENTIRELY THE PROBLEM OF PASSING JS PARM ARRAYS THAT VBS CAN'T FATHOM.
	' FOR EXAMPLE:
		' IN JAVASCRIPT...
		' jsonPatient = JSON.stringify({"firstname":"Tony","lastname":"O'Shaw","dos":"2017-02-26","dob":"1958-12-11","hep":["af01","af02"]});
		' vbsQUERY_DB("frontend",4,"testingJSON",128,jsonPatient);
		' THEN SEE: Case "testingJSON" (BELOW) FOR A TASTE OF HOW TO READ/SPILL/ERROR CHECK THE PARSED JSON RESULT
		If parms <> "" Then
			Err.Clear()
			Set JsonInVBS = New VbsJson ' Ah ha! Using simply: Set json = New VbsJson WAS ELIMINATING THE JSON OBJECT IN JAVASCRIPT!!
			Set o = JsonInVBS.Decode(parms)
			If ( Err.number <> 0 ) Then MsgBox "Set o = JsonInVBS.Decode(parms)..." & vbNewLine & "...throws the following error:" & vbNewLine & Err.description
			Err.Clear()
			Set JsonInVBS = Nothing
		End If

	Select Case intCommandTypeEnum
		Case 1 ' adCmdText
			On Error Resume Next ' Duplicate Unique value for user_id in tblProviders, can be (must be) ignored...
			Select Case strInstructions
				Case "SELECT @@Identity" 	' vbsQUERY_DB("frontend",1,"SELECT @@Identity",129,"") 
											' IS LONG-HAND FOR: vbsLAST_INSERT_ID(strAnimal)
					vbsQUERY_DB = vbsLAST_INSERT_ID(strAnimal)
					Exit Function
				Case Else
					DB_Farm(strAnimal)("objConn").Execute strInstructions, , intReturnRows
			End Select
			Err.Clear() ' Duplicate Unique value for user_id in tblProviders, can be (must be) ignored...
			If ( Err.number <> 0 ) Then MsgBox "ACCESS balked at:" & vbNewLine & strInstructions & vbNewLine & "Why?" & vbNewLine & Err.description
			Err.Clear()
		Case 2 ' adCmdTable
		Case 4 ' adCmdStoredProc
			Set cmd = CreateObject("ADODB.Command")
			cmd.CommandText = strInstructions
			cmd.CommandType = adCmdStoredProc
			cmd.ActiveConnection = DB_Farm(strAnimal)("objConn")
			Select Case strInstructions
				Case "testingJSON" 	' DO NOT DELETE!! 
									' THIS IS INSTRUCTIVE 
									' (AND MAY AID DEBUGGING FUTURE JSON-STRINGIFIED parms)
					' MsgBox parms
					' E.G. {"firstname":"Tony","lastname":"O'Shaw","dos":"2017-02-26","dob":"1958-12-11","hep":["af01","af02"]}
					Err.Clear()
					MsgBox o("dob")
					MsgBox o("lastname")
					On Error Resume Next
					MsgBox UBound(o("hep")) ' if it was an array
					If ( Err.number <> 0 ) Then MsgBox "UBound(o(""hep"") BUT IT'S NOT AN ARRAY..." & Err.description
					Err.Clear()
					MsgBox  o("hep").Count 	' if it became a dictionary object)
					If ( Err.number <> 0 ) Then MsgBox "o(""hep"").Count BUT IT'S NOT AN OBJECT..." & Err.description
					Err.Clear()
					On Error Goto 0
					dim i
					For Each i In o("hep")
						MsgBox i
					Next
					Set cmd = Nothing
					If parms <> "" Then Set o = Nothing
					Exit Function
				Case "qryPatientsAgeCalc"
					' THIS QUERY UPDATES EVERY SINGLE PATIENT'S AGE, BASED ON Date() AND patient_dob
				Case "qryPatientsAddPatient"  ' EXPECTS (IN ORDER): EXPECTS (IN ORDER): patient_last, patient_first, patient_mrn, patient_dob
					For Each oParms In o
						'' patient_dob
						Select Case oParms
							Case "dob"
								intDataTypeEnum = adDate
							' Case "mrn"
								' intDataTypeEnum = adInteger
							Case Else
								intDataTypeEnum = adVarChar
						End Select
						' PASSING ZERO-LENGTH STRINGS OR VALUES TO STORED PROCEDURES OR QUERIES
						' REQUIRES SETTING THE DataTypeEnum TO: adBSTR (aka 8)
						' SEE: http://stackoverflow.com/a/14743078/5863730
						If Len(o(oParms)) = 0 Then intDataTypeEnum = adBSTR
						MsgBox oParms & ": " & intDataTypeEnum
						cmd.Parameters.Append cmd.CreateParameter(oParms, intDataTypeEnum, ,Len(o(oParms)))
						cmd(oParms) = o(oParms)
					Next
					If parms <> "" Then Set o = Nothing
				Case "qryProvidersAddProvider"  ' EXPECTS (IN ORDER): user_id, last_name, first_name
					For Each oParms In o
						'' patient_dob
						Select Case oParms
							Case "patient_dob"
								intDataTypeEnum = adDate
							Case "patient_mrn"
								intDataTypeEnum = adInteger
							Case Else
								intDataTypeEnum = adVarChar
						End Select
						cmd.Parameters.Append cmd.CreateParameter(oParms, intDataTypeEnum, ,255)
						cmd(oParms) = o(oParms)
					Next
					If parms <> "" Then Set o = Nothing
				Case "qryProvidersUpdateLogin"
					' MsgBox "o(""user_id"") is: " & o("user_id") & " in... " & strInstructions
					cmd.Parameters.Append cmd.CreateParameter("user_id", adVarChar, ,255)
					cmd("user_id") = vbsStrUser ' SAME RESULT AS IF WE USED: o("user_id")
				Case Else
					' Do nothing, for now...
			End Select
			On Error Resume Next ' Duplicate Unique value for user_id in tblProviders, can be (must be) ignored...
			cmd.Execute recs,,intReturnRows
			'Did it work?
			MsgBox "Records updated: " & recs 
			Set cmd = Nothing
	End Select
	If parms <> "" Then Set o = Nothing
End Function