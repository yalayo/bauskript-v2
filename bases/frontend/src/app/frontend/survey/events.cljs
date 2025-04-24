(ns app.frontend.survey.events
  (:require [re-frame.core :as re-frame :refer [after]]
            [cljs.reader]
            [app.frontend.config :as config]
            [app.frontend.db :as db]
            [day8.re-frame.tracing :refer-macros [fn-traced]]
            [day8.re-frame.http-fx]
            [ajax.edn :as ajax-edn]))

;; Initializing
;; Interceptors
(def ->local-store (after db/db->local-store))

;; Interceptor Chain
(def interceptors [->local-store])

;; To restore db from the browser's local storage
(re-frame/reg-cofx
 :local-store-db
 (fn [cofx _]
   (assoc cofx :local-store-db
						 ;; read in todos from localstore, and process into a sorted map
          (into (sorted-map)
                (some->> (.getItem js/localStorage db/ls-key)
                         (cljs.reader/read-string))))))

(re-frame/reg-event-fx
 ::initialize-db
 [(re-frame/inject-cofx :local-store-db)]
 (fn-traced [{:keys [local-store-db]} _]
            (if (empty? local-store-db)
              {:http-xhrio {:method          :get
                            :uri             (str config/api-url "/api/questions")
                            :timeout         8000
                            :response-format (ajax-edn/edn-response-format)
                            :on-success      [::set-initial-db]
                            :on-failure      [::handle-init-db-error]}}
              {:db local-store-db})))

(defn initialize-responses [questions]
  (into {} (map (fn [k] [(keyword (:id k)) true]) questions)))

(re-frame/reg-event-db
 ::set-initial-db
 [->local-store]
 (fn-traced [db [_ questions]]
            (-> db
                (assoc-in [:survey :questions] questions)
                (assoc-in [:survey :current-question-index] 0)
                (assoc-in [:survey :show-email-form] false)
                (assoc-in [:survey :responses] (initialize-responses questions))
                (assoc :current-view "survey"))))

(re-frame/reg-event-fx
 ::handle-init-db-error
 (fn-traced [{:keys [_]} [_ error]]
            (js/console.error "Failed to initialize DB from API:" error)
            {}))

(re-frame/reg-event-db
 ::answer-question
 [->local-store]
 (fn [db [_ val]]
   (let [index (get-in db [:survey :current-question-index])
         questions (get-in db [:survey :questions])
         current-question (nth questions index)
         id (keyword (:id current-question))]
     (assoc-in db [:survey :responses id] val))))

(re-frame/reg-event-db
 ::next-question
 [->local-store]
 (fn [db]
   (let [index (get-in db [:survey :current-question-index])
         total (count (get-in db [:survey :questions]))]
     (if (>= index (dec total))
       (-> db
           (assoc-in [:survey :show-email-form] true)
           #_(assoc-in [:survey :current-question-index] (inc index)))
       (assoc-in db [:survey :current-question-index] (inc index))))))

(re-frame/reg-event-db
 ::previous-question
 [->local-store]
 (fn [db]
   (let [index (get-in db [:survey :current-question-index])
         show-email-form? (get-in db [:survey :show-email-form])]
     (when (pos? index)
       (if (and (<= index 20) show-email-form?)
         (-> db
             (assoc-in [:survey :show-email-form] false)
             (assoc-in [:survey :current-question-index] (dec index)))
         (assoc-in db [:survey :current-question-index] (dec index)))))))

(re-frame/reg-event-db
 ::update-email-form
 [->local-store]
 (fn [db [_ id val]]
   (assoc-in db [:survey :form id] val)))

(re-frame/reg-event-fx
 ::save-survey
 (fn [{:keys [db]} _]
   (let [survey-data {:responses (get-in db [:survey :responses])
                      :email (get-in db [:survey :form :email])}]
     {:http-xhrio {:method          :post
                   :uri             (str config/api-url "/api/survey")
                   :params          survey-data
                   :format          (ajax-edn/edn-request-format)
                   :response-format (ajax-edn/edn-response-format)
                   :timeout         8000
                   :on-success      [::survey-submitted]
                   :on-failure      [::survey-submitt-error]}})))

(re-frame/reg-event-db
 ::survey-submitted
 [->local-store]
 (fn [db [_ response]]
   (let [email (get-in db [:survey :form :email])]
     (-> db
         (assoc-in [:survey :current-question-index] 0)
         (assoc-in [:survey :show-email-form] false)
         (assoc-in [:waiting-list :email] email)
         (assoc :current-view "waiting-list")))))

(re-frame/reg-event-fx
 ::handle-init-db-error
 (fn [{:keys [_]} [_ error]]
   (js/console.error "Failed to submitt survey:" error)
   {}))