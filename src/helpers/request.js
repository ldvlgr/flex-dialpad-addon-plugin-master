const request = async (path, manager, params) =>{
    const body = {
        ...params,
        Token: manager.store.getState().flex.session.ssoTokenPayload.token
    };

    const options = {
        method: 'POST',
        body: new URLSearchParams(body),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };

    const { REACT_APP_SERVICE_BASE_URL } = process.env;
    //Plugins v4 require a .env file (copy from .env.development)
    //issue with object destructuring above.  Use explicit prop ref instead
    const resp = await fetch(`${process.env.REACT_APP_SERVICE_BASE_URL}/${path}`, options)
    return (await resp.json())
}

export {
    request
}