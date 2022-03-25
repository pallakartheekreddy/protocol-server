const axiosCall = require('axios').default;
import axios from "axios";
import { BecknResponse } from "../schemas/becknResponse.schema";
import { SubscriberDetail } from "../schemas/subscriberDetails.schema";
import logger from "./logger";
import { combineURLs } from "./lookup";

const makeBecknRequest = async (subscriber: SubscriberDetail, body: any, axios_config: any): Promise<BecknResponse> => {
    try {
        // TODO: uncommet this.
        const requestURL = combineURLs(subscriber.subscriber_url, `/${process.env.api}`);
        console.log('Request URL :', requestURL);

        const response = await axios.post(requestURL, body, axios_config);

        return {
            data: JSON.stringify(response.data),
            status: response.status
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            return {
                data: JSON.stringify(error.response?.data),
                status: (error.response?.status) ? error.response?.status : 500
            }
        }

        return {
            data: "No Response",
            status: 500
        }
    }
}

export async function makeRequest_toBG(subscribers: SubscriberDetail[], body: any, axios_config: any): Promise<BecknResponse> {
    console.log(JSON.stringify(body));

    for (let i = 0; i < subscribers.length; i++) {
        logger.info(`Attempt Number: ${i + 1} \nAPI : ${process.env.api}`);

        const response = await makeBecknRequest(subscribers[i], body, axios_config);
        if (response.status == 200) {
            logger.info(`Result : Request Successful \nStatus: ${response.status} \nData : ${response.data}`);
            return response;
        }
        // Console the status in case failed.
        logger.error(`Result : Failed call to BG \nStatus: ${response.status}, \nData: ${response.data}`);
    }

    return {
        data: "No Response",
        status: 500
    }
}

export async function makeRequest_toBPP(subscriber: SubscriberDetail, body: any, axios_config: any): Promise<BecknResponse> {
    try {
        const response = await makeBecknRequest(subscriber, body, axios_config);
        logger.info(`BPP Request for the API ${process.env.api} \nApp Mode: ${process.env.mode} \ntransaction_id: ${body.context.transaction_id} \nmessage_id: ${body.context.message_id} \nResponse: ${response.data} \nResponse Status: ${response.status}`);
        return response;
    } catch (error) {
        throw error;
    }
}