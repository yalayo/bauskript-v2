(ns app.frontend.survey.main
  (:require [reagent.dom :as rdom]
            [re-frame.core :as re-frame]
            [app.frontend.survey.events :as events]
            [app.frontend.survey.views :as views]))

(defn ^:dev/after-load mount-root []
  (js/console.log "Mount called")
  (let [root-el (.getElementById js/document "survey")]
    (println "Root: " root-el)
    (if root-el
      (do
        (re-frame/clear-subscription-cache!)
        (rdom/unmount-component-at-node root-el) 
        (rdom/render [views/app] root-el) 
        true)
      false)))

(defn init []
  (re-frame/dispatch-sync [::events/initialize-db])
  (let [monted? (mount-root)]
    (js/console.log "Mounted: " monted?)
    (when-not monted?
      (js/console.log "Let's wait!!")
      (js/setTimeout mount-root 100))) )
