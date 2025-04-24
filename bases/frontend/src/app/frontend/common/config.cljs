(ns app.frontend.common.config)

(def api-url
  (if goog.DEBUG
    "http://localhost:5000"
    "https://bauskript.busqandote.com"))