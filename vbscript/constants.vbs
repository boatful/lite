	' CommandTypeEnum. See: https://docs.microsoft.com/en-us/sql/ado/reference/ado-api/commandtypeenum
	Const adCmdText = 1
	Const adCmdTable = 2
	Const adCmdStoredProc = 4
	' ADO Data Types. See: https://www.w3schools.com/asp/ado_datatypes.asp (A LONG-ISH LIST)
	Const adVarChar = 200
	Const adDate = 7
	Const adInteger = 3
	Const adDouble = 5
	Const adBSTR = 8 ' SEE: http://stackoverflow.com/a/14743078/5863730
		
	Const adParamInput = 1
	
	' ExecuteOptionEnum. See: http://www.xtramania.com/Documentation/ADOxtra/Reference/Enums/ExecuteOptionEnum/
	Const adAsyncExecute = 16
	Const adAsyncFetch = 32
	Const adAsyncFetchNonBlocking = 64
	Const adExecuteNoRecords = 128
	Const adExecuteRecord = 2048	
	
	' CursorTypeEnum. See: https://docs.microsoft.com/en-us/sql/ado/reference/ado-api/cursortypeenum
	Const adOpenForwardOnly = 0
	Const adOpenDynamic = 2
	Const adOpenKeyset = 1
	Const adOpenStatic = 3
	
	' CursorLocationEnum. See: https://docs.microsoft.com/en-us/sql/ado/reference/ado-api/cursorlocationenum
	Const adUseServer = 2
	Const adUseNone = 1
	Const adUseClient = 3
	
	' LockTypeEnum. See: https://docs.microsoft.com/en-us/sql/ado/reference/ado-api/locktypeenum
	Const adLockPessimistic = 2
	Const adLockReadOnly = 1 ' DEFAULT
	Const adLockOptimistic = 3
	Const adLockBatchOptimistic = 4