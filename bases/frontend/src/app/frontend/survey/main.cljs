(ns app.frontend.survey.main
  (:require [reagent.dom :as rdom]
            [re-frame.core :as re-frame]
            [app.frontend.survey.events :as events]
            [app.frontend.survey.views :as views]))

(defn mount-root []
  (let [root-el (.getElementById js/document "survey")]
    (if root-el
      (do
        (re-frame/clear-subscription-cache!)
        (rdom/unmount-component-at-node root-el)
        (rdom/render [views/app] root-el))
      ;; If #survey doesn't exist yet, try again in 100ms
      (js/setTimeout mount-root 100))))

(defn init []
  (re-frame/dispatch-sync [::events/initialize-db])
  (mount-root))
