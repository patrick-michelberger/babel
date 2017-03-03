import {
    apiUrls
} from '../config/config';

export function annotate(file) {
    const data = {
        "requests": [{
            "image": {
                "content": file
            },
            "features": [{
                "type": "LABEL_DETECTION"
            }]
        }]
    };
    return fetch(apiUrls.cloudVision, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then((response) => response.json())
        .then((json) => {
            if (json && json.responses && json.responses[0] && json.responses[0].labelAnnotations) {
                return json.responses[0].labelAnnotations;
            } else {
                return [];
            }
        });
}
