/*

This script extracts pure text content from html content in an EA event parameter and adds it as a new parameter to the event.

*/



var TEST_MESSAGE = "<at>Enterprise Alert</at>&nbsp;testing testing\n"
var PARAMETER_WITH_HTML = "text" // Name of the event parameter containing html markup
var PARAMETER_NEW = "pureText" // Desired name of the new event parameter that will not contain any html markup
var REMOVE_STRING = "Enterprise Alert"; // Any phrase you'd like to be removed entirely from the pure text result



/*
var pureText = ExecutePowershell(TEST_MESSAGE);
pureText = pureText.replace(REMOVE_STRING, "");
WScript.Echo(pureText);
*/


function OnNewEvent(eventObject)
{
	EAScriptHost.LogInfo("Event received.");	

	var htmlText = eventObject.GetEventParameter(PARAMETER_WITH_HTML);
	EAScriptHost.LogDebug("Prameter value with markup: " + htmlText);
	var plainText = ExecutePowershell(htmlText);
	plainText = plainText.replace(REMOVE_STRING, "");
	EAScriptHost.LogDebug("Prameter value without markup: " + plainText);
	eventObject.SetEventParameter(PARAMETER_NEW, plainText);
	
    eventObject.Send();
}


function ExecutePowershell(htmlString)
{
    var strCommand = "powershell.exe \"node.exe 'html_text.js' '" + htmlString + "'\"";
	    
	//EAScriptHost.LogInfo("Executing command: " + strCommand);
	
	try
	{				
		var WshShell = new ActiveXObject("WScript.Shell");
        var oExec = WshShell.Exec(strCommand);        

		if (oExec == null)
		{
            //RAContext.SetExecutionResult(RAContext.ExecutionError, "Could not create Shell object.", -1);	
            EAScriptHost.LogError("ExecuteCommand: Could not create Shell object.");
			return -1;
		}

		var allOut = "";
		var allError = "";
		var tryCount = 0;
		var tryReadCount = 0;

		while (tryCount < 60000)
		{
			var bRead = false;
			if (!oExec.StdOut.AtEndOfStream)
			{
				allOut += oExec.StdOut.ReadAll();
				bRead = true;
			}

			if (!oExec.StdErr.AtEndOfStream)
			{
				allError += oExec.StdErr.ReadAll();
				bRead = true;
			}

			if (! bRead)
			{
				if (tryReadCount++ > 10 && oExec.Status == 1)
					break;

				MMScriptHost.Sleep(100);
				tryCount += 100;            
			}
			else
			{            
				tryReadCount = 1;

				MMScriptHost.Sleep(1);
				tryCount++;

                EAScriptHost.LogDebug("ExecuteCommand: Reading data count=" + tryReadCount + ", Try Count=" + tryCount + ".");
			}
		}

		if (tryCount >= 60000)
		{
			EAScriptHost.LogError("ExecuteCommand: No response from process after 1min - aborting... Current Execution status=" + oExec.Status);
		}

		if (allOut.length > 0)
		{
			EAScriptHost.LogInfo(allOut);
		}
		if (allError.length > 0)
		{
			EAScriptHost.LogError(allError);
		}


        

		if (oExec.ExitCode != 0)
		{
			EAScriptHost.LogError("ExecuteCommand: Application exited with code: " + oExec.ExitCode);		
            //RAContext.SetExecutionResult(RAContext.ExecutionError, allOut + allError, oExec.ExitCode);
			
			
			return allError;
			
		}    
		else
		{
			EAScriptHost.LogInfo("ExecuteCommand: Application exited with code: " + oExec.ExitCode);		
            //RAContext.SetExecutionResult(RAContext.ExecutionOK, allOut, 0);
            
            return allOut;
        }    

	}
	catch (e)
	{
		EAScriptHost.LogError("Error executing command: " + strCommand);
		EAScriptHost.LogError(e.message);		
		//RAContext.SetExecutionResult(RAContext.ExecutionError, "Error executing command: " + strCommand + ":" + e.message, -1);
	}    	
}




function ExecutePowershellNoResult(alertID, executor)
{	
	strCommand = "powershell.exe" + " c:\\exportsimple.ps1 " + alertID + " " + executor
    EAScriptHost.LogInfo("Executing powershell command " + strCommand);

    var obShell = new ActiveXObject("Shell.Application");
    obShell.ShellExecute("powershell.exe", strCommand, "", "", 1);

    EAScriptHost.LogInfo("Command executed.");
}