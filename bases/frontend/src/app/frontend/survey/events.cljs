(ns app.frontend.survey.events
  (:require [re-frame.core :as re-frame :refer [after]]
            [cljs.reader]
            [app.frontend.common.config :as config]
            [app.frontend.common.db :as db]
            [day8.re-frame.tracing :refer-macros [fn-traced]]
            [day8.re-frame.http-fx]
            [ajax.edn :as ajax-edn]
            [ajax.core :as ajax]))

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
              {:db (assoc-in local-store-db [:survey :loading?] true)
               :http-xhrio {:method          :get
                            :uri             (str config/api-url "/api/survey-questions")
                            :timeout         8000
                            :response-format (ajax/json-response-format {:keywords? true})
                            :headers         {"Accept" "application/json"}
                            :on-success      [::set-initial-db]
                            :on-failure      [::handle-init-db-error]}}
              {:db (assoc-in local-store-db [:survey :loading?] false)})))

(defn initialize-responses [questions]
  (into {} (map (fn [k] [(keyword (str (:id k))) true]) questions)))

(re-frame/reg-event-db
 ::set-initial-db
 [->local-store]
 (fn-traced [db [_ questions]]
            (-> db
                (assoc-in [:survey :questions] questions)
                (assoc-in [:survey :current-question-index] 0)
                (assoc-in [:survey :responses] (initialize-responses questions))
                (assoc-in [:survey :loading?] false)))) ;; Done loading

(re-frame/reg-event-fx
 ::handle-init-db-error
 (fn-traced [{:keys [_]} [_ error]]
            (js/console.error "Failed to initialize DB from API:" error)
            {}))

(re-frame/reg-event-db
 ::answer-question
 [->local-store]
 (fn [db [_ val]]
   (if (< (index total)) 
     (let [index (get-in db [:survey :current-question-index])
           questions (get-in db [:survey :questions])
           total (count questions)
           current-question (nth questions index)
           id (keyword (str (:orderIndex current-question)))
           new-db (assoc-in db [:survey :responses id] val)]
       (println "Index: " index " Total: " total)
       (assoc-in new-db [:survey :current-question-index] (inc index)))
     (assoc-in db [:survey :current-step] "contact"))))

(re-frame/reg-event-db
 ::next-question
 [->local-store]
 (fn [db]
   (let [index (get-in db [:survey :current-question-index])
         total (count (get-in db [:survey :questions]))]
     (println "Index: " index " Total: " total)
     (if (< (inc index) total)
       (assoc-in db [:survey :current-question-index] (inc index))
       (assoc-in db [:survey :current-step] "contact")))))

(re-frame/reg-event-db
 ::previous-question
 [->local-store]
 (fn [db]
   (let [index (get-in db [:survey :current-question-index])
         current-step (get-in db [:survey :current-step])]
     (if (= current-step "contact")
       (-> db
           (assoc-in [:survey :current-question-index] (dec index))
           (assoc-in [:survey :current-step] "survey"))
       (assoc-in db [:survey :current-question-index] (dec index))))))

(re-frame/reg-event-db
 ::update-field
 [->local-store]
 (fn [db [_ id val]]
   (assoc-in db [:survey :form id] val)))

(defn adapt-data [data]
  (->> data
       (keys)
       (sort)
       (map (fn [k]
              (let [n (js/parseInt (name k))]
                {:questionId n
                 :answer (odd? n)})))
       vec))

(re-frame/reg-event-fx
 ::save-survey
 (fn [{:keys [db]} _]
   (let [survey-data {:email (get-in db [:survey :form :email])
                      :name (get-in db [:survey :form :name])
                      :company (get-in db [:survey :form :company])
                      :phone (get-in db [:survey :form :phone])
                      :answers (adapt-data (get-in db [:survey :responses]))}]
     {:http-xhrio {:method          :post
                   :uri             (str config/api-url "/api/survey-responses")
                   :params          survey-data
                   :format          (ajax/json-request-format) 
                   :response-format (ajax/json-response-format {:keywords? true})
                   :timeout         8000
                   :on-success      [::survey-submitted]
                   :on-failure      [::survey-submission-error]}})))

(re-frame/reg-event-db
 ::survey-submitted
 [->local-store]
 (fn [db [_ response]]
   (println "Response: " response)
   (let [email (get-in db [:survey :form :email])]
     (-> db
         (assoc-in [:survey :current-question-index] 0)
         (assoc-in [:survey :current-step] "thanks")))))

(re-frame/reg-event-fx
 ::survey-submission-error
 (fn [{:keys [_]} [_ error]]
   (js/console.error "Failed to submitt survey:" error)
   {}))