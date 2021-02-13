"""

Based on:
- Iain Nash -- https://github.com/iainnash/duckduckgo-images-api
- Deepan Prabhu Babu --  https://github.com/deepanprabhu/duckduckgo-images-api


"""

import requests
import re
import json
import time
import logging

from .languages import get_language_code


def get_duckduckgo_images(query, count=1, max_n_retries=10, n_results=5):
    language_code = get_language_code()

    url = 'https://duckduckgo.com/'
    params = {'q': query}

    logging.debug('Hitting DuckDuckGo for Token')

    # First make a request to above URL, and parse out the 'vqd'
    # This is a special token, which should be used in the subsequent request
    res = requests.post(url, data=params)
    searchObj = re.search(r'vqd=([\d-]+)\&', res.text, re.M|re.I)

    if not searchObj:
        logging.error('Token Parsing Failed!')
        return -1

    logging.debug('Obtained Token')

    headers = {
        # 'dnt': '1',
        # 'accept-encoding': 'gzip, deflate, sdch, br',
        # 'x-requested-with': 'XMLHttpRequest',
        'accept-language': language_code,
        # 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36',
        # 'accept': 'application/json, text/javascript, */*; q=0.01',
        # 'referer': 'https://duckduckgo.com/',
        # 'authority': 'duckduckgo.com',
    }

    params = (
        ('l', 'wt-wt'),
        ('o', 'json'),
        ('q', query),
        ('vqd', searchObj.group(1)),
        ('f', ',,,'),
        ('p', '2')
    )

    results = []

    requestUrl = url + 'i.js'

    logging.debug('Hitting Url : %s', requestUrl)

    while count > 0:
        n_retries = 0
        while n_retries < max_n_retries:
            try:
                res = requests.get(requestUrl, headers=headers, params=params)
                data = json.loads(res.text)
                # logging.debug("\n\n\n DATA:")
                # print(*map(lambda d: d["url"] + "\n", data["results"][:n_results]))
                # logging.debug("\n\n\n")
                count -= 1
                break
            except ValueError as e:
                logging.debug(f'Hitting Url Failure {e} - Sleep and Retry: {requestUrl}')
                time.sleep(0.1)
                n_retries += 1
                data = {"results": {}}
                continue

            if n_retries == max_n_retries - 1:
                logging.debug(f'Hit maximum number of retries ({max_n_retries}), giving up.')


        logging.debug('Hitting Url Success : %s', requestUrl)
        results += data['results']

        if 'next' not in data:
            logging.debug('No Next Page - Exiting')
            return results

        requestUrl = url + data['next']
    return results
