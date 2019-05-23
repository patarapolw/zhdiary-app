import jieba
from wordfreq import word_frequency
import bottle as b

app = b.app()

@b.route('/<:re:.*>', method='OPTIONS')
def enable_cors_generic_route():
    """
    This route takes priority over all others. So any request with an OPTIONS
    method will be handled by this function.

    See: https://github.com/bottlepy/bottle/issues/402

    NOTE: This means we won't 404 any invalid path that is an OPTIONS request.
    """
    add_cors_headers()

@b.hook('after_request')
def enable_cors_after_request_hook():
    """
    This executes after every route. We use it to attach CORS headers when
    applicable.
    """
    add_cors_headers()

def add_cors_headers():
    b.response.headers['Access-Control-Allow-Origin'] = '*'
    b.response.headers['Access-Control-Allow-Methods'] = \
        'GET, POST, PUT, OPTIONS'
    b.response.headers['Access-Control-Allow-Headers'] = \
        'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

@app.post("/jieba/cut")
def jieba_cut():
    entry = b.request.json["entry"]
    return {
        "result": list(jieba.cut(entry))
    }

@app.post("/jieba/cutForSearch")
def jieba_cut_for_search():
    entry = b.request.json["entry"]
    return {
        "result": list(jieba.cut(entry))
    }

@app.post("/wordfreq")
def wordfreq_route():
    entry = b.request.json["entry"]
    return {
        "frequency": word_frequency(entry, "zh-CN") * 10**6
    }

app.run(host="localhost", port=33436)
