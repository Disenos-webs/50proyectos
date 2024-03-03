const peticion = {
	getResponse: async (data, option = {}) => {
		try {
			const fetchdata = await fetch(data, option);
		   const response = await fetchdata.json();
			return await response;
		} catch (error) {
	   	return error;
	   }
			
	}
}