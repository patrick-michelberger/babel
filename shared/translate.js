import {
    apiUrls
} from '../config/config';

const langMap = {
    english: 'en',
    spanish: 'es',
    german: 'de',
    french: 'fr',
    chinese: 'zh',
    italian: 'it',
    korean: 'ko',
    japanese: 'ja',
    dutch: 'nl',
    hindi: 'hi'
}

const cache = {}

export default function translate(term) {
    const url = `${apiUrls.translate}&q=${term}&source=en&target=${langMap["italian"]}`;
    return fetch(url)
        .then(response => response.json())
        .then(json => {
            console.log("translate response: ", json);
            if (json && json.data && json.data.translations && json.data.translations[0] && json.data.translations[0].translatedText) {
                return json.data.translations[0].translatedText;
            } else {
                return false;
            }
        });
}
