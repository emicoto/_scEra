if (window.Com) {
	//-------------------------------------------------------------------
	//
	//  Command Global Filter and Check
	//
	//-------------------------------------------------------------------

	Com.globalFilter = function (comId) {
		//write your code here to filter the command
		return 1;
	};
	Com.globalOrder = function (comId) {
		//write your code here to set the order of the command
		return 0;
	};
	Com.globalCond = function (comId) {
		//write your code here to check the condition of the command
		return 1;
	};
}
