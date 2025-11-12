const moment = require('moment');
const FormData = require('form-data');

const utils = require('./tools');
const CONSTANT = require('./constant').default;

const queryModels = async () => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.QUERY_MODELS}`;
    const options = {
        method: 'GET',
        url,
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const getModel = async (id) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.GET_MODEL}${id}`;
    const options = {
        method: 'GET',
        url,
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const queryInstances = async (conditions) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.QUERY_INSTANCES}${JSON.stringify(conditions)}`;
    const options = {
        method: 'GET',
        url,
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const getInstance = async (id) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.GET_INSTANCE}${id}`;
    const options = {
        method: 'GET',
        url,
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const createThingModel = async (data) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.CREATE_MODEL}`;
    const options = {
        method: 'POST',
        url,
        data
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const registerDevice = async (data) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.REGISTER_INSTANCE}`;
    const options = {
        method: 'POST',
        url,
        data
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const queryRTData = async (id) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.DATA_REALTIME_ORIGINAL}${id}`;
    const options = {
        method: 'GET',
        url,
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const queryHistoryData = async (condition) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.DATA_HISTORY_ORIGINAL}${condition}`;
    const options = {
        method: 'GET',
        url,
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const queryAlertData = async (condition) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.DATA_ALERT}${condition}`;
    const options = {
        method: 'GET',
        url,
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const invokeOllama = async () => {
    let url = `http://localhost:11434/`;
    const options = {
        method: 'GET',
        url,
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const chatWithOllama = async (info) => {
    let url = `http://localhost:11434/api/generate`;
    const data = {
        "model": "llama3",
        "prompt": info,
        "stream": false
    };

    const options = {
        method: 'POST',
        url,
        data,
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const sfoc = async (id) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.ANALYSIS_SFOC}`;
    const options = {
        method: 'POST',
        url,
        data: {
            id
        }
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const kmeans = async (id) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.ANALYSIS_K_MEANS}`;
    const options = {
        method: 'POST',
        url,
        data: {
            id
        }
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

const vesselHealthIndex = async (data) => {
    let url = `${CONSTANT.WEB_SERVER_URL}/${CONSTANT.VERSION}${CONSTANT.ANALYSIS_VESSEL_HEALTH_INDEX}`;
    const options = {
        method: 'POST',
        url,
        data
    }

    const resp = await utils.invokeWebServer(options);
    // console.log(resp);

    return utils.handleHttpResponse(resp);
}

module.exports = {
    queryModels,
    getModel,
    queryInstances,
    getInstance,
    createThingModel,
    registerDevice,
    queryRTData,
    queryHistoryData,
    queryAlertData,
    invokeOllama,
    chatWithOllama,
    sfoc,
    kmeans,
    vesselHealthIndex,
};
